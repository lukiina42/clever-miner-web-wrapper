# api/clever_miner_api/views.py
from cleverminer import cleverminer
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from .models import Dataset
from .serializers import DatasetSerializer, FourFtMinerSerializer

import pandas as pd

from .utils.const import get_saved_result_path


class DatasetApiView(APIView):
    parser_classes = (MultiPartParser,)

    # add permission to check if user is authenticated
    # permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=DatasetSerializer,
        responses={204: None},
        methods=["POST"]
    )
    def post(self, request, *args, **kwargs):
        serializer = DatasetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        '''
        List all the datasets
        '''
        todos = Dataset.objects.all()
        serializer = DatasetSerializer(todos, many=True)
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)


class FourFtMinerView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FourFtMinerSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            dataset_id = validated_data['dataset_id']
            base = validated_data['base']
            confidence = validated_data['confidence']
            rel_base = validated_data['rel_base']
            aad = validated_data['aad']
            antecedents = validated_data.get('antecedent', [])
            succedents = validated_data.get('succedent', [])
            ante_min_len = validated_data.get('ante_min_len')
            ante_max_len = validated_data.get('ante_max_len')
            succe_min_len = validated_data.get('succe_min_len')
            succe_max_len = validated_data.get('succe_max_len')
            con_dis_antecedent_type = validated_data.get('con_dis_antecedent_type')
            con_dis_succedent_type = validated_data.get('con_dis_succedent_type')

            antecedent_attributes = [
                {
                    'name': antecedent['name'],
                    'type': antecedent['type'],
                    'minlen': antecedent['min_len'],
                    'maxlen': antecedent['max_len']
                }
                for antecedent in antecedents
            ]

            succedent_attributes = [
                {
                    'name': succedent['name'],
                    'type': succedent['type'],
                    'minlen': succedent['min_len'],
                    'maxlen': succedent['max_len']
                }
                for succedent in succedents
            ]

            # Fetch the dataset by dataset_id
            try:
                dataset = Dataset.objects.get(id=dataset_id)
            except Dataset.DoesNotExist:
                raise NotFound(detail=f"Dataset with id {dataset_id} not found.")

            # Use get_url method from DatasetSerializer to get the presigned URL
            signed_url = DatasetSerializer(dataset).get_url(dataset)
            file = pd.read_csv(signed_url, encoding='cp1250', sep=', ')

            quantifiers = {
                'confidence': confidence,
                'aad': aad,
                'Base': base,
                'relbase': rel_base
            }

            quantifiers = {key: value for key, value in quantifiers.items() if value is not None}

            if len(quantifiers) == 0:
                quantifiers = {'Base': 0}

            clm = cleverminer(
                df=file,
                proc='4ftMiner',
                quantifiers=quantifiers,
                ante={
                    'attributes': antecedent_attributes, 'minlen': ante_min_len, 'maxlen': ante_max_len,
                    'type': con_dis_antecedent_type
                },
                succ={
                    'attributes': succedent_attributes, 'minlen': succe_min_len, 'maxlen': succe_max_len,
                    'type': con_dis_succedent_type
                }
            )

            rulelist = clm.rulelist
            for rule in rulelist:
                rule['ruletext'] = clm.get_ruletext(rule['rule_id'])

            # Save to db
            serializer.save()

            # clm.load(get_saved_result_path())

            return Response(rulelist, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

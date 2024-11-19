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
            dataset = serializer.save()
            return Response(DatasetSerializer(dataset).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        '''
        List all the datasets
        '''
        todos = Dataset.objects.all()
        serializer = DatasetSerializer(todos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FourFtMinerView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FourFtMinerSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            dataset_id = validated_data['dataset_id']
            base = validated_data['base']
            confidence = validated_data['confidence']
            rel_base = validated_data['relbase']
            aad = validated_data['aad']
            antecedents = validated_data.get('antecedent', [])
            succedents = validated_data.get('succedent', [])
            ante_min_len = validated_data.get('anteMinLen')
            ante_max_len = validated_data.get('anteMaxLen')
            succe_min_len = validated_data.get('succeMinLen')
            succe_max_len = validated_data.get('succeMaxLen')
            con_dis_antecedent_type = validated_data.get('conDisAntecedentType')
            con_dis_succedent_type = validated_data.get('conDisSuccedentType')

            antecedent_attributes = [
                {
                    'name': antecedent['name'],
                    'type': antecedent['type'],
                    'minlen': antecedent['minLen'],
                    'maxlen': antecedent['maxLen']
                }
                for antecedent in antecedents
            ]
            
            succedent_attributes = [
                {
                    'name': succedent['name'],
                    'type': succedent['type'],
                    'minlen': succedent['minLen'],
                    'maxlen': succedent['maxLen']
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

            clm = cleverminer(
                df=file, 
                proc='4ftMiner',
                quantifiers=quantifiers,
                ante={
                    'attributes': antecedent_attributes, 'minlen': ante_min_len, 'maxlen': ante_max_len, 'type': con_dis_antecedent_type
                },
                succ={
                    'attributes': succedent_attributes, 'minlen': succe_min_len, 'maxlen': succe_max_len, 'type': con_dis_succedent_type
                }
            )

            rulelist = clm.rulelist
            for rule in rulelist:
                rule['ruletext'] = clm.get_ruletext(rule['rule_id'])

            print(rulelist)

            return Response(rulelist, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

from .utils.s3 import create_presigned_url


# class CleverMinerApiView(APIView):
#     # def get(self, request, *args, **kwargs):
#     #     '''
#     #     List all the todo items for given requested user
#     #     '''
#     #     todos = TodoItem.objects.all()
#     #     serializer = TodoSerializer(todos, many=True)
#     #     return Response(serializer.data, status=status.HTTP_200_OK)
#
#     @extend_schema(
#         request=TodoSerializer,
#         responses={204: None},
#         methods=["POST"]
#     )
#     def post(self, request, *args, **kwargs):
#         '''
#         Create the Todo with given todo data
#         '''
#         data = {
#             'task': request.data.get('task'),
#             'completed': request.data.get('completed'),
#         }
#         serializer = TodoSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
            antecedent_name = validated_data['antecedentName']
            succedent_name = validated_data['succedentName']

            # Fetch the dataset by dataset_id
            try:
                dataset = Dataset.objects.get(id=dataset_id)
            except Dataset.DoesNotExist:
                raise NotFound(detail=f"Dataset with id {dataset_id} not found.")

            # Use get_url method from DatasetSerializer to get the presigned URL
            signed_url = DatasetSerializer(dataset).get_url(dataset)
            file = pd.read_csv(signed_url, encoding='cp1250', sep=', ')

            clm = cleverminer(df=file, proc='4ftMiner',
                              quantifiers={'conf': confidence, 'Base': base},
                              ante={
                                  'attributes': [
                                      {'name': antecedent_name, 'type': 'subset', 'minlen': 1, 'maxlen': 1}
                                  ], 'minlen': 1, 'maxlen': 1, 'type': 'con'},
                              succ={
                                  'attributes': [
                                      {'name': succedent_name, 'type': 'subset', 'minlen': 1, 'maxlen': 1}
                                  ], 'minlen': 1, 'maxlen': 1, 'type': 'con'}
                              )

            # Here you can add your business logic to process the data
            # For now, we'll just return the validated data as the response

            return Response(clm.rulelist, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
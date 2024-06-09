# api/clever_miner_api/views.py
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import FileUploadParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from .serializers import DatasetSerializer


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
    parser_classes = (FileUploadParser,)

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
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import NotFound, PermissionDenied

from ..models import Dataset
from ..serializers.dataset import DatasetSerializer

class DatasetApiView(APIView):
    parser_classes = (MultiPartParser,)
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=DatasetSerializer,
        responses={204: None},
        methods=["POST"]
    )
    def post(self, request, *args, **kwargs):
        serializer = DatasetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Associate the dataset with the current user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        '''
        List all the datasets for the current user
        '''
        # Filter datasets by the current user
        datasets = Dataset.objects.filter(user=request.user)
        serializer = DatasetSerializer(datasets, many=True)
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)
        
    def delete(self, request, *args, **kwargs):
        '''
        Delete a dataset by ID
        '''
        dataset_id = request.query_params.get('id')
        if not dataset_id:
            return Response({"error": "Dataset ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            
            # Check if the dataset belongs to the current user
            if dataset.user != request.user:
                raise PermissionDenied("You do not have permission to delete this dataset")
                
            dataset.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Dataset.DoesNotExist:
            raise NotFound("Dataset not found")

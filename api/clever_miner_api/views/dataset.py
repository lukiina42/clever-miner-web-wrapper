from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from ..models import Dataset, FourFtResult
from ..serializers.dataset import DatasetSerializer
from .. import storage
from ..storage import delete_file
from ..services import DatasetService


class DatasetApiView(APIView):
    """
    API view for handling the collection of Dataset resources.
    Supports listing all datasets and creating new ones.
    """
    parser_classes = (MultiPartParser,)

    @extend_schema(
        request=DatasetSerializer,
        responses={204: None},
        methods=["POST"]
    )
    def post(self, request, *args, **kwargs):
        """
        Create a new dataset.
        
        Uploads the file to S3 and creates a dataset record.
        """
        serializer = DatasetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Create dataset without user association
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        """
        List all datasets.
        
        Supports filtering by name and ordering.
        """
        # Extract query parameters
        name = request.query_params.get('name', None)
        ordering = request.query_params.get('ordering', None)
        
        # Get all datasets without user filtering
        queryset = DatasetService.filter_datasets(name=name, ordering=ordering)
        
        serializer = DatasetSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DatasetDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific dataset.
    """
    
    def get(self, request, id, *args, **kwargs):
        """
        Retrieve a specific dataset by ID.
        
        Returns detailed information about a dataset, including its metadata and download URL.
        """
        try:
            # Get dataset without permission check
            dataset = DatasetService.get_dataset(id)
            serializer = DatasetSerializer(dataset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete(self, request, id, *args, **kwargs):
        """
        Delete a specific dataset by ID.
        
        Removes the dataset and its associated S3 objects. 
        Will fail if the dataset is used by any existing mining results.
        """
        try:
            # Get dataset without permission check
            dataset = DatasetService.get_dataset(id)
            
            # Check if dataset is used by any FourFtResult
            if DatasetService.has_related_results(dataset):
                return Response(
                    {"error": "Cannot delete dataset because it is used by existing results. Delete the results first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Delete storage file and dataset
            DatasetService.delete_dataset(dataset)
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

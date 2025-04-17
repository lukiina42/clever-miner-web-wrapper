from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import NotFound, PermissionDenied
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=DatasetSerializer,
        responses={204: None},
        methods=["POST"]
    )
    def post(self, request, *args, **kwargs):
        """
        Create a new dataset.
        
        Uploads the file to S3 and creates a dataset record associated with the current user.
        """
        serializer = DatasetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Associate the dataset with the current user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={200: DatasetSerializer(many=True)},
        methods=["GET"],
        parameters=[
            {
                "name": "name",
                "type": "string",
                "in": "query",
                "description": "Filter datasets by name (contains)",
                "required": False
            },
            {
                "name": "ordering",
                "type": "string",
                "in": "query",
                "description": "Order datasets by field (created_at, -created_at, updated_at, -updated_at). Prefix with '-' for descending order.",
                "required": False
            }
        ]
    )
    def get(self, request, *args, **kwargs):
        """
        List all datasets belonging to the current user.
        
        Returns a list of all datasets uploaded by the authenticated user.
        
        Query Parameters:
        - name: Filter datasets by name (contains)
        - ordering: Order datasets by field (created_at, -created_at, updated_at, -updated_at)
          prefix with '-' for descending order
        """
        # Get filter parameters
        name_filter = request.query_params.get('name', None)
        ordering = request.query_params.get('ordering', None)
        
        # Get filtered datasets
        datasets = DatasetService.filter_datasets(
            user=request.user,
            name=name_filter,
            ordering=ordering
        )
            
        serializer = DatasetSerializer(datasets, many=True)
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)


class DatasetDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific dataset.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, id, *args, **kwargs):
        """
        Retrieve a specific dataset by ID.
        
        Returns detailed information about a dataset, including its metadata and download URL.
        """
        try:
            dataset = DatasetService.get_dataset_with_permission_check(id, request.user)
            serializer = DatasetSerializer(dataset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete(self, request, id, *args, **kwargs):
        """
        Delete a specific dataset by ID.
        
        Removes the dataset and its associated S3 objects. 
        Will fail if the dataset is used by any existing mining results.
        """
        try:
            # Get dataset with permission check
            dataset = DatasetService.get_dataset_with_permission_check(id, request.user)
            
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
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

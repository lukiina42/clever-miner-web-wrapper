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
        # Filter datasets by the current user
        datasets = Dataset.objects.filter(user=request.user)
        
        # Apply name filter if provided
        name_filter = request.query_params.get('name', None)
        if name_filter:
            datasets = datasets.filter(name__icontains=name_filter)
        
        # Apply ordering if provided
        ordering = request.query_params.get('ordering', None)
        if ordering:
            # Ensure the ordering field is valid
            valid_ordering_fields = ['created_at', '-created_at', 'updated_at', '-updated_at']
            if ordering in valid_ordering_fields:
                datasets = datasets.order_by(ordering)
        else:
            # Default ordering: most recent first
            datasets = datasets.order_by('-created_at')
            
        serializer = DatasetSerializer(datasets, many=True)
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)


class DatasetDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific dataset.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    @staticmethod
    def _get_dataset_with_permission_check(dataset_id, user):
        """Helper method to get a dataset and check user permissions"""
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            if dataset.user and dataset.user != user:
                raise PermissionDenied("You do not have permission to access this dataset")
            return dataset
        except Dataset.DoesNotExist:
            raise NotFound(detail=f"Dataset with id {dataset_id} not found.")
    
    def get(self, request, id, *args, **kwargs):
        """
        Retrieve a specific dataset by ID.
        
        Returns detailed information about a dataset, including its metadata and download URL.
        """
        try:
            dataset = self._get_dataset_with_permission_check(id, request.user)
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
            dataset = self._get_dataset_with_permission_check(id, request.user)
            
            # Check if dataset is used by any FourFtResult
            related_results = FourFtResult.objects.filter(dataset=dataset)
            # TODO verify this should work like that, it could be cascade delete
            if related_results.exists():
                return Response(
                    {"error": "Cannot delete dataset because it is used by existing results. Delete the results first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
    
            storage.delete_file(dataset.storage_file)
            
            # Delete the dataset
            dataset.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.exceptions import NotFound, PermissionDenied
from ...models import Dataset, FourFtResult
from ...storage import delete_file
from ...serializers.dataset import DatasetSerializer

class DatasetService:
    """
    Service class for handling Dataset-related operations.
    Encapsulates business logic for creating, reading, updating, and deleting datasets.
    """

    @staticmethod
    def filter_datasets(user, name=None, ordering=None):
        """
        Filter datasets by user and optional name and ordering.
        
        Args:
            user: The user to filter datasets for
            name: Optional name filter
            ordering: Optional ordering field
            
        Returns:
            Queryset of filtered datasets
        """
        queryset = Dataset.objects.filter(user=user)
        
        if name:
            queryset = queryset.filter(name__icontains=name)
            
        if ordering:
            queryset = queryset.order_by(ordering)
            
        return queryset
    
    @staticmethod
    def get_dataset_with_permission_check(dataset_id, user):
        """
        Get a dataset by ID with permission check.
        
        Args:
            dataset_id: ID of the dataset to retrieve
            user: User requesting the dataset
            
        Returns:
            Dataset instance
            
        Raises:
            NotFound: If dataset with given ID doesn't exist
            PermissionDenied: If user doesn't have permission to access the dataset
        """
        try:
            dataset = Dataset.objects.get(pk=dataset_id)
        except Dataset.DoesNotExist:
            raise NotFound(f"Dataset with ID {dataset_id} not found")
        
        if dataset.user != user:
            raise PermissionDenied("You do not have permission to access this dataset")
        
        return dataset
    
    @staticmethod
    def has_related_results(dataset):
        """
        Check if a dataset has any related mining results.
        
        Args:
            dataset: Dataset instance to check
            
        Returns:
            bool: True if there are related results, False otherwise
        """
        return FourFtResult.objects.filter(dataset=dataset).exists()
    
    @staticmethod
    def delete_dataset(dataset):
        """
        Delete a dataset and its associated storage file.
        
        Args:
            dataset: Dataset instance to delete
        """
        delete_file(dataset.storage_file)
        dataset.delete()
    
    @staticmethod
    def get_dataset_url(dataset):
        """
        Get the signed URL for a dataset.
        """
        return DatasetSerializer(dataset).get_url(dataset)
    
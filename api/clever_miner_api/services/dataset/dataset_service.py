from rest_framework.exceptions import NotFound
from ...models import Dataset, FourFtResult
from ...storage import delete_file
from ...serializers.dataset import DatasetSerializer

class DatasetService:
    """
    Service class for handling Dataset-related operations.
    Encapsulates business logic for creating, reading, updating, and deleting datasets.
    """

    @staticmethod
    def filter_datasets(name=None, ordering=None):
        """
        Filter datasets by optional name and ordering.
        
        Args:
            name: Optional name filter
            ordering: Optional ordering field
            
        Returns:
            Queryset of filtered datasets
        """
        queryset = Dataset.objects.all()
        
        if name:
            queryset = queryset.filter(name__icontains=name)
            
        if ordering:
            queryset = queryset.order_by(ordering)
            
        return queryset
    
    @staticmethod
    def get_dataset(dataset_id):
        """
        Get a dataset by ID.
        
        Args:
            dataset_id: ID of the dataset to retrieve
            
        Returns:
            Dataset instance
            
        Raises:
            NotFound: If dataset with given ID doesn't exist
        """
        try:
            dataset = Dataset.objects.get(pk=dataset_id)
        except Dataset.DoesNotExist:
            raise NotFound(f"Dataset with ID {dataset_id} not found")
        
        return dataset
    
    @staticmethod
    def get_dataset_with_permission_check(dataset_id, user):
        """
        Get a dataset by ID without permission checks.
        
        Args:
            dataset_id: ID of the dataset to retrieve
            user: User requesting access (unused, for compatibility)
            
        Returns:
            Dataset instance
            
        Raises:
            NotFound: If dataset with given ID doesn't exist
        """
        return DatasetService.get_dataset(dataset_id)
    
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
        dataset.storage_file.delete()
        dataset.delete()
    
    @staticmethod
    def get_dataset_url(dataset):
        """
        Get the signed URL for a dataset.
        """
        return DatasetSerializer(dataset).get_url(dataset)
    
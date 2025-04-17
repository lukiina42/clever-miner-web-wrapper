from rest_framework.exceptions import NotFound, PermissionDenied
from ...models import FourFtResult

class ResultService:
    """Service class for FourFtResult operations"""
    
    @staticmethod
    def get_result_with_permission_check(result_id, user):
        """
        Get a FourFtResult and check user permissions.
        
        Args:
            result_id: The ID of the FourFtResult
            user: The user requesting access
            
        Returns:
            FourFtResult: The requested FourFtResult
            
        Raises:
            NotFound: If the FourFtResult does not exist
            PermissionDenied: If the user does not have permission to access the FourFtResult
        """
        try:
            instance = FourFtResult.objects.get(id=result_id)
            if instance.user and instance.user != user:
                raise PermissionDenied("You do not have permission to access this result")
            return instance
        except FourFtResult.DoesNotExist:
            raise NotFound(detail=f"FourFtResult with id {result_id} not found.")
    
    @staticmethod
    def filter_results(user, name=None, dataset_name=None, ordering=None):
        """
        Filter FourFtResult instances.
        
        Args:
            user: The user requesting access
            name: Optional name filter
            dataset_name: Optional dataset name filter
            ordering: Optional ordering field
            
        Returns:
            QuerySet: The filtered FourFtResult instances
        """
        # Filter results by the current user
        four_ft_results = FourFtResult.objects.filter(user=user)
        
        # Apply name filter if provided
        if name:
            four_ft_results = four_ft_results.filter(name__icontains=name)
            
        # Apply dataset name filter if provided
        if dataset_name:
            four_ft_results = four_ft_results.filter(dataset_name__icontains=dataset_name)
        
        # Apply ordering if provided
        if ordering:
            # Ensure the ordering field is valid
            valid_ordering_fields = ['created_at', '-created_at', 'updated_at', '-updated_at']
            if ordering in valid_ordering_fields:
                four_ft_results = four_ft_results.order_by(ordering)
        else:
            # Default ordering: most recent first
            four_ft_results = four_ft_results.order_by('-created_at')
        
        return four_ft_results
    
    @staticmethod
    def sort_rules_by_field(rules, ordering):
        """
        Sort rules by a field.
        
        Args:
            rules: The rules to sort
            ordering: The ordering field
            
        Returns:
            list: The sorted rules
        """
        if not rules or not ordering:
            return rules
            
        reverse = False
        order_field = ordering
        
        # Check if it's a descending order
        if ordering.startswith('-'):
            reverse = True
            order_field = ordering[1:]
            
        # Validate the field exists in rules
        if rules and order_field in rules[0]['params']:
            return sorted(
                rules, 
                key=lambda rule: rule['params'][order_field],
                reverse=reverse
            )
        
        return rules 
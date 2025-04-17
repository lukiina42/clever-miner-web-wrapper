from cleverminer import cleverminer
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
import io
import base64
from django.shortcuts import get_object_or_404

from ..models import Dataset, FourFtResult
from ..serializers.dataset import DatasetSerializer
from ..serializers.fourft import FourFtMinerSerializer
from ..utils.s3 import object_s3_delete
from .. import storage

import pandas as pd

from ..serializers.rule import RuleDataSerializer
from ..utils.clm_init import clm_init
import matplotlib.pyplot as plt
from drf_spectacular.utils import extend_schema
from rest_framework import serializers


class FourFtMinerView(APIView):
    """
    API view for handling the collection of FourFtResult resources.
    Supports listing all results and creating new ones.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    @staticmethod
    def _get_dataset_with_permission_check(dataset_id, user):
        """Helper method to get a dataset and check user permissions"""
        try:
            dataset = Dataset.objects.get(id=dataset_id)
            if dataset.user and dataset.user != user:
                raise PermissionDenied("You do not have permission to use this dataset")
            return dataset
        except Dataset.DoesNotExist:
            raise NotFound(detail=f"Dataset with id {dataset_id} not found.")
    
    @staticmethod
    def _process_mining_data(validated_data, dataset):
        """Helper method to process mining data and run cleverminer"""
        # Extract parameters from validated data
        base = validated_data['base']
        confidence = validated_data['confidence']
        rel_base = validated_data['rel_base']
        aad = validated_data['aad']
        antecedent_literals = validated_data.get('antecedent', [])
        succedent_literals = validated_data.get('succedent', [])
        condition_literals = validated_data.get('condition', [])  # Get optional condition literals
        ante_min_len = validated_data.get('ante_min_len')
        ante_max_len = validated_data.get('ante_max_len')
        succe_min_len = validated_data.get('succe_min_len')
        succe_max_len = validated_data.get('succe_max_len')
        con_dis_antecedent_type = validated_data.get('con_dis_antecedent_type')
        con_dis_succedent_type = validated_data.get('con_dis_succedent_type')
        con_dis_condition_type = validated_data.get('con_dis_condition_type')
        cond_min_len = validated_data.get('cond_min_len', 1) # Default to 1 if not provided
        cond_max_len = validated_data.get('cond_max_len', 1) # Default to 1 if not provided

        # Validate condition type if condition literals are provided
        if condition_literals and not con_dis_condition_type:
            raise serializers.ValidationError({"con_dis_condition_type": "Condition type is required when condition literals are provided."})

        # Prepare antecedent and succedent attributes
        antecedent_attributes = [
            {
                'name': antecedent_literal['name'],
                'type': antecedent_literal['type'],
                'minlen': antecedent_literal['min_len'],
                'maxlen': antecedent_literal['max_len']
            }
            for antecedent_literal in antecedent_literals
        ]

        succedent_attributes = [
            {
                'name': succedent_literal['name'],
                'type': succedent_literal['type'],
                'minlen': succedent_literal['min_len'],
                'maxlen': succedent_literal['max_len']
            }
            for succedent_literal in succedent_literals
        ]
        
        # Prepare condition attributes (if provided)
        condition_attributes = [
            {
                'name': condition_literal['name'],
                'type': condition_literal['type'],
                'minlen': condition_literal['min_len'],
                'maxlen': condition_literal['max_len']
            }
            for condition_literal in condition_literals
        ]

        # Get dataset URL and load the file
        signed_url = DatasetSerializer(dataset).get_url(dataset)
        file = pd.read_csv(signed_url, encoding='cp1250', sep=dataset.delimiter)

        # Prepare quantifiers
        quantifiers = {
            'conf': confidence,
            'aad': aad,
            'Base': base,
            'relbase': rel_base
        }

        quantifiers = {key: value for key, value in quantifiers.items() if value is not None}

        if len(quantifiers) == 0:
            quantifiers = {'Base': 0}

        # Prepare parameters for cleverminer
        params = {
            'df': file,
            'proc': '4ftMiner',
            'quantifiers': quantifiers,
            'ante': {
                'attributes': antecedent_attributes, 
                'minlen': ante_min_len, 
                'maxlen': ante_max_len,
                'type': con_dis_antecedent_type
            },
            'succ': {
                'attributes': succedent_attributes, 
                'minlen': succe_min_len, 
                'maxlen': succe_max_len,
                'type': con_dis_succedent_type
            }
        }
        
        # Add condition if provided
        if condition_attributes:
            params['cond'] = {
                'attributes': condition_attributes,
                'minlen': cond_min_len,
                'maxlen': cond_max_len,
                'type': con_dis_condition_type
            }

        # Run cleverminer
        clm = cleverminer(**params)
        
        return clm
    
    def post(self, request, *args, **kwargs):
        """
        Create a new FourFtResult instance.
        
        Runs the data mining process using the specified dataset and parameters,
        stores the results, and associates it with the current user.
        """
        serializer = FourFtMinerSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            dataset_id = validated_data['dataset_id']
            
            # Get dataset with permission check
            dataset = self._get_dataset_with_permission_check(dataset_id, request.user)
            
            # Process mining data
            clm = self._process_mining_data(validated_data, dataset)

            # Save to db with the current user
            result = serializer.save(clm=clm, user=request.user)

            return Response({'id': result.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        responses={200: FourFtMinerSerializer(many=True)},
        methods=["GET"],
        parameters=[
            {
                "name": "name",
                "type": "string",
                "in": "query",
                "description": "Filter results by name (contains)",
                "required": False
            },
            {
                "name": "dataset_name",
                "type": "string",
                "in": "query",
                "description": "Filter results by dataset name (contains)",
                "required": False
            },
            {
                "name": "ordering",
                "type": "string",
                "in": "query",
                "description": "Order results by field (created_at, -created_at, updated_at, -updated_at). Prefix with '-' for descending order.",
                "required": False
            }
        ]
    )
    def get(self, request, *args, **kwargs):
        """
        List all FourFtResult instances belonging to the current user.
        
        Returns a list of all mining results created by the authenticated user.
        
        Query Parameters:
        - name: Filter results by name (contains)
        - dataset_name: Filter results by dataset name (contains)
        - ordering: Order results by field (created_at, -created_at, updated_at, -updated_at)
          prefix with '-' for descending order
        """
        # Filter results by the current user
        four_ft_results = FourFtResult.objects.filter(user=request.user)
        
        # Apply name filter if provided
        name_filter = request.query_params.get('name', None)
        if name_filter:
            four_ft_results = four_ft_results.filter(name__icontains=name_filter)
            
        # Apply dataset name filter if provided
        dataset_name_filter = request.query_params.get('dataset_name', None)
        if dataset_name_filter:
            four_ft_results = four_ft_results.filter(dataset_name__icontains=dataset_name_filter)
        
        # Apply ordering if provided
        ordering = request.query_params.get('ordering', None)
        if ordering:
            # Ensure the ordering field is valid
            valid_ordering_fields = ['created_at', '-created_at', 'updated_at', '-updated_at']
            if ordering in valid_ordering_fields:
                four_ft_results = four_ft_results.order_by(ordering)
        else:
            # Default ordering: most recent first
            four_ft_results = four_ft_results.order_by('-created_at')
        
        serializer = FourFtMinerSerializer(four_ft_results, many=True, context={"request": request})
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)


class FourFtResultDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific FourFtResult.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    @staticmethod
    def _get_result_with_permission_check(result_id, user):
        """Helper method to get a result and check user permissions"""
        try:
            instance = FourFtResult.objects.get(id=result_id)
            if instance.user and instance.user != user:
                raise PermissionDenied("You do not have permission to access this result")
            return instance
        except FourFtResult.DoesNotExist:
            raise NotFound(detail=f"FourFtResult with id {result_id} not found.")
    
    def get(self, request, id=None, four_ft_id=None):
        result_id = id or four_ft_id
        result = get_object_or_404(FourFtResult, id=result_id)
        
        try:
            # Get ordering parameter from query params
            ordering = request.query_params.get('ordering', None)

            # Get serialized data
            serializer = FourFtMinerSerializer(result, context={"request": request})
            data = serializer.data
            
            rules = data['rules']
                
            # Apply ordering if provided
            if ordering and rules:
                reverse = False
                order_field = ordering
                
                # Check if it's a descending order
                if ordering.startswith('-'):
                    reverse = True
                    order_field = ordering[1:]
                    
                # Validate the field exists in rules
                if order_field in rules[0]['params']:
                    data['rules'] = sorted(
                        rules, 
                        key=lambda rule: rule['params'][order_field],
                        reverse=reverse
                    )

            return Response(data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
 
    def put(self, request, id, *args, **kwargs):
        """
        Update a specific FourFtResult by ID.
        
        Re-runs the mining process with updated parameters and updates the stored result.
        """
        try:
            # Get existing result with permission check
            instance = self._get_result_with_permission_check(id, request.user)
            
            # Validate the data
            serializer = FourFtMinerSerializer(instance, data=request.data, partial=False)
            if serializer.is_valid():
                validated_data = serializer.validated_data
                dataset_id = validated_data['dataset_id']
                
                # Get dataset with permission check
                dataset = FourFtMinerView._get_dataset_with_permission_check(dataset_id, request.user)
                
                # Process mining data
                clm = FourFtMinerView._process_mining_data(validated_data, dataset)
                
                # Add rule text to rules
                for rule in clm.rulelist:
                    rule['ruletext'] = clm.get_ruletext(rule['rule_id'])

                # Save updated data to db
                serializer.save(clm=clm)

                return Response(None, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)
            
    def delete(self, request, id=None, four_ft_id=None):
        result_id = id or four_ft_id
        result = get_object_or_404(FourFtResult, id=result_id)
        
        # Delete the file from storage
        if result.storage_file:
            storage.delete_file(result.storage_file)
            
        
        # Delete the result
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FourFtResultRuleDetailView(RetrieveAPIView):
    """
    API view for retrieving specific rules from a FourFtResult.
    """
    serializer_class = RuleDataSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter queryset by the current user
        return FourFtResult.objects.filter(user=self.request.user)

    def get_object(self):
        """
        Retrieve a specific FourFtResult by ID and ensure it has the given rule ID.
        
        Also generates a visual representation of the rule as a base64-encoded image.
        """
        queryset = self.get_queryset()

        # Extracting values from the URL
        four_ft_id = self.kwargs.get("four_ft_id")
        rule_id = int(self.kwargs.get("rule_id"))

        # Filtering by both IDs
        obj = queryset.filter(id=four_ft_id).first()

        if not obj:
            raise NotFound(f'FourFtResult with id ${four_ft_id} was not found.')
        if not obj.storage_file:
            raise NotFound(f'FourFtResult with id ${four_ft_id} does not contain rule ${rule_id}.')

        clm = clm_init(obj.storage_file)
        rules = clm.result['rules']
        if rule_id < 1 or rule_id > len(rules):
            raise NotFound(f'Rule with id {rule_id} was not found.')
        
        # find a rule with given rule_id
        rule = next((rule for rule in rules if rule['rule_id'] == rule_id), None)
        if not rule:
            raise NotFound(f'Rule with id {rule_id} was not found.')
        
        rule['rule_text'] = clm.get_ruletext(rule_id)
        
        # Initialize image_base64 to None
        image_base64 = None
        
        try:
            # Draw the rule but don't show it
            clm.draw_rule(rule_id, False)
            
            # Save the plot to a bytes buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            image_base64 = base64.b64encode(buf.getvalue()).decode()
            plt.close()  # Clean up the plot
        except Exception as e:
            # Log the error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error generating plot for rule {rule_id}: {str(e)}")
            plt.close('all')  # Make sure to clean up any matplotlib resources
        
        # Return the rule data and the plot image (if generated)
        result = {'rule': rule}
        if image_base64:
            result['plot'] = f"data:image/png;base64,{image_base64}"
        
        return result
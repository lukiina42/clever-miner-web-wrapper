from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from ..models import FourFtResult
from ..serializers.fourft import FourFtMinerSerializer
from ..serializers.rule import RuleDataSerializer
from .. import storage

# Import services
from ..services import (
    DatasetService,
    MiningService, 
    RuleService, 
    ResultService, 
    VisualizationService
)


class FourFtMinerView(APIView):
    """
    API view for handling the collection of FourFtResult resources.
    Supports listing all results and creating new ones.
    """
    
    def post(self, request, *args, **kwargs):
        """
        Create a new FourFtResult instance.
        
        Runs the data mining process using the specified dataset and parameters,
        stores the results.
        """
        serializer = FourFtMinerSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            dataset_id = validated_data['dataset_id']
            
            # Get dataset without permission check
            dataset = DatasetService.get_dataset(dataset_id)
            
            # Process mining data
            clm = MiningService.process_mining_data(validated_data, dataset)

            # Save to db without user association
            result = serializer.save(clm=clm)

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
        List all FourFtResult instances.
        
        Returns a list of all mining results.
        
        Query Parameters:
        - name: Filter results by name (contains)
        - dataset_name: Filter results by dataset name (contains)
        - ordering: Order results by field (created_at, -created_at, updated_at, -updated_at)
          prefix with '-' for descending order
        """
        # Get filter parameters
        name_filter = request.query_params.get('name', None)
        dataset_name_filter = request.query_params.get('dataset_name', None)
        ordering = request.query_params.get('ordering', None)
        
        # Filter results without user restriction
        four_ft_results = ResultService.get_results(
            name=name_filter,
            dataset_name=dataset_name_filter,
            ordering=ordering
        )
        
        serializer = FourFtMinerSerializer(four_ft_results, many=True, context={"request": request})
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)


class FourFtResultDetailView(APIView):
    """
    API endpoint for retrieving, updating, and deleting a specific FourFtResult.
    """
    
    def get(self, request, id=None, four_ft_id=None):
        """
        Retrieve a specific FourFtResult by ID.
        """
        result_id = id or four_ft_id
        
        try:
            # Get result without permission check
            result = ResultService.get_result(result_id)
            
            # Get ordering parameter from query params
            ordering = request.query_params.get('ordering', None)

            # Get serialized data
            serializer = FourFtMinerSerializer(result, context={"request": request})
            data = serializer.data
            
            # Safely access rules if they exist
            if 'rules' in data:
                rules = data['rules']
                
                # Apply ordering if provided
                if ordering and rules:
                    data['rules'] = ResultService.sort_rules_by_field(rules, ordering)

            return Response(data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
    def put(self, request, id, *args, **kwargs):
        """
        Update a specific FourFtResult by ID.
        
        Re-runs the mining process with updated parameters and updates the stored result.
        """
        try:
            # Get existing result without permission check
            instance = ResultService.get_result(id)
            
            # Validate the data
            serializer = FourFtMinerSerializer(instance, data=request.data, partial=False)
            if serializer.is_valid():
                validated_data = serializer.validated_data
                dataset_id = validated_data['dataset_id']
                
                # Get dataset without permission check
                dataset = DatasetService.get_dataset(dataset_id)
                
                # Process mining data
                clm = MiningService.process_mining_data(validated_data, dataset)
                
                # Add rule text to rules
                RuleService.add_rule_text_to_rules(clm)

                # Save updated data to db
                serializer.save(clm=clm)

                return Response(None, status=status.HTTP_200_OK)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def delete(self, request, id=None, four_ft_id=None):
        """
        Delete a specific FourFtResult by ID.
        """
        result_id = id or four_ft_id
        result = get_object_or_404(FourFtResult, id=result_id)
        
        # Delete the file from storage
        if result.storage_file:
            storage.delete_file(result.storage_file)
            result.storage_file.delete()
            
        # Delete the result
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FourFtResultRuleDetailView(RetrieveAPIView):
    """
    API view for retrieving specific rules from a FourFtResult.
    """
    serializer_class = RuleDataSerializer
    
    def get_queryset(self):
        # Return all FourFt results without user filtering
        return FourFtResult.objects.all()

    def get_object(self):
        """
        Retrieve a specific FourFtResult by ID and ensure it has the given rule ID.
        
        Also generates a visual representation of the rule as a base64-encoded image.
        """
        # Extracting values from the URL
        four_ft_id = self.kwargs.get("four_ft_id")
        rule_id = int(self.kwargs.get("rule_id"))
        
        rule_data = RuleService.get_rule_with_details(four_ft_id, rule_id)
        
        if not rule_data:
            raise NotFound(f"Rule with ID {rule_id} not found")
        
        # Generate visualization
        plot = VisualizationService.generate_rule_visualization(rule_data['clm'], rule_data['rule_id'])
        
        # Return the rule data and the plot image (if generated)
        result = {'rule': rule_data['rule']}
        if plot:
            result['plot'] = plot
        
        return result
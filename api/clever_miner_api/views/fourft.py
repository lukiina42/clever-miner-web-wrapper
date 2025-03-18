from cleverminer import cleverminer
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
import io
import base64

from ..models import Dataset, FourFtResult
from ..serializers.dataset import DatasetSerializer
from ..serializers.fourft import FourFtMinerSerializer

import pandas as pd

from ..serializers.rule import RuleDataSerializer
from ..utils.clm_init import clm_init
import matplotlib.pyplot as plt


class FourFtMinerView(APIView):
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
        antecedents = validated_data.get('antecedent', [])
        succedents = validated_data.get('succedent', [])
        ante_min_len = validated_data.get('ante_min_len')
        ante_max_len = validated_data.get('ante_max_len')
        succe_min_len = validated_data.get('succe_min_len')
        succe_max_len = validated_data.get('succe_max_len')
        con_dis_antecedent_type = validated_data.get('con_dis_antecedent_type')
        con_dis_succedent_type = validated_data.get('con_dis_succedent_type')

        # Prepare antecedent and succedent attributes
        antecedent_attributes = [
            {
                'name': antecedent['name'],
                'type': antecedent['type'],
                'minlen': antecedent['min_len'],
                'maxlen': antecedent['max_len']
            }
            for antecedent in antecedents
        ]

        succedent_attributes = [
            {
                'name': succedent['name'],
                'type': succedent['type'],
                'minlen': succedent['min_len'],
                'maxlen': succedent['max_len']
            }
            for succedent in succedents
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

        # Run cleverminer
        clm = cleverminer(
            df=file,
            proc='4ftMiner',
            quantifiers=quantifiers,
            ante={
                'attributes': antecedent_attributes, 'minlen': ante_min_len, 'maxlen': ante_max_len,
                'type': con_dis_antecedent_type
            },
            succ={
                'attributes': succedent_attributes, 'minlen': succe_min_len, 'maxlen': succe_max_len,
                'type': con_dis_succedent_type
            }
        )
        
        return clm
    
    def post(self, request, *args, **kwargs):
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

    def get(self, request, *args, **kwargs):
        '''
        List all the four ft results for the current user
        '''
        # Filter results by the current user
        four_ft_results = FourFtResult.objects.filter(user=request.user)
        serializer = FourFtMinerSerializer(four_ft_results, many=True, context={"request": request})
        data = serializer.data
        return Response(data, status=status.HTTP_200_OK)


class FourFtResultDetailView(APIView):
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
    
    def get(self, request, id, *args, **kwargs):
        try:
            instance = self._get_result_with_permission_check(id, request.user)
            serializer = FourFtMinerSerializer(instance, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

    def put(self, request, id, *args, **kwargs):
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


class FourFtResultRuleDetailView(RetrieveAPIView):
    serializer_class = RuleDataSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filter queryset by the current user
        return FourFtResult.objects.filter(user=self.request.user)

    def get_object(self):
        """
        Retrieve a specific FourFtResult by ID and ensure it has the given rule ID.
        """
        queryset = self.get_queryset()

        # Extracting values from the URL
        four_ft_id = self.kwargs.get("four_ft_id")
        rule_id = int(self.kwargs.get("rule_id"))

        # Filtering by both IDs
        obj = queryset.filter(id=four_ft_id).first()

        if not obj:
            raise NotFound(f'FourFtResult with id ${four_ft_id} was not found.')

        clm = clm_init(obj.s3_key)
        rules = clm.result['rules']
        if rule_id < 1 or rule_id > len(rules):
            raise NotFound(f'Rule with id {rule_id} was not found.')
        
        # find a rule with given rule_id
        rule = next((rule for rule in rules if rule['rule_id'] == rule_id), None)
        if not rule:
            raise NotFound(f'Rule with id {rule_id} was not found.')
        
        rule['rule_text'] = clm.get_ruletext(rule_id)
        
        # Draw the rule but don't show it
        clm.draw_rule(rule_id, False)
        
        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode()
        plt.close()  # Clean up the plot

        # Return both the rule data and the plot image
        return {
            'rule': rule,
            'plot': f"data:image/png;base64,{image_base64}"
        }
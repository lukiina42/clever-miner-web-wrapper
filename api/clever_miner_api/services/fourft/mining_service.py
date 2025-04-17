import pandas as pd
from cleverminer import cleverminer
from rest_framework import serializers

from ..dataset.dataset_service import DatasetService

class MiningService:
    """Service class for mining operations"""
    
    @staticmethod
    def process_mining_data(validated_data, dataset):
        """
        Process mining data and run cleverminer.
        
        Args:
            validated_data: The validated data from the serializer
            dataset: The dataset to use for mining
            
        Returns:
            cleverminer: The CleverMiner instance with mining results
        """
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
            raise serializers.ValidationError({
                "con_dis_condition_type": "Condition type is required when condition literals are provided."
            })

        # Prepare antecedent and succedent attributes
        antecedent_attributes = MiningService._prepare_cedent_attributes(antecedent_literals)
        succedent_attributes = MiningService._prepare_cedent_attributes(succedent_literals)
        condition_attributes = MiningService._prepare_cedent_attributes(condition_literals)

        # Get dataset URL and load the file
        signed_url = DatasetService.get_dataset_url(dataset)
        file = pd.read_csv(signed_url, encoding='cp1250', sep=dataset.delimiter)

        # Prepare quantifiers
        quantifiers = MiningService._prepare_quantifiers(base, confidence, aad, rel_base)

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
    
    @staticmethod
    def _prepare_cedent_attributes(literals):
        """
        Prepare attributes for a cedent.
        
        Args:
            literals: The literals to prepare
            
        Returns:
            list: The prepared attributes
        """
        return [
            {
                'name': literal['name'],
                'type': literal['type'],
                'minlen': literal['min_len'],
                'maxlen': literal['max_len']
            }
            for literal in literals
        ]
    
    @staticmethod
    def _prepare_quantifiers(base, confidence, aad, rel_base):
        """
        Prepare quantifiers for cleverminer.
        
        Args:
            base: The base value
            confidence: The confidence value
            aad: The AAD value
            rel_base: The relative base value
            
        Returns:
            dict: The prepared quantifiers
        """
        quantifiers = {
            'conf': confidence,
            'aad': aad,
            'Base': base,
            'relbase': rel_base
        }

        quantifiers = {key: value for key, value in quantifiers.items() if value is not None}

        if len(quantifiers) == 0:
            quantifiers = {'Base': 0}
            
        return quantifiers 
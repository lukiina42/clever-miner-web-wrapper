from rest_framework import serializers

from .dataset import DatasetSerializer
from .user import UserSerializer
from ..models import Dataset, FourFtResult, Cedent, StorageFile

from ..utils.clm_init import clm_init
from ..utils.s3 import clm_s3_upload, create_presigned_url, download_s3_file, object_s3_delete
from .. import storage
import json

import re

class CamelCaseToSnakeCaseModelSerializer(serializers.ModelSerializer):
    """
    A base serializer that converts camelCase keys in incoming data to snake_case.
    """

    def to_internal_value(self, data):
        # Convert camelCase keys to snake_case
        snake_case_data = {}
        for key, value in data.items():
            snake_case_key = self.camel_to_snake(key)
            snake_case_data[snake_case_key] = value
        return super().to_internal_value(snake_case_data)

    @staticmethod
    def camel_to_snake(name):
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
    
class CamelCaseToSnakeCaseSerializer(serializers.Serializer):
    """
    A base serializer that converts camelCase keys in incoming data to snake_case.
    """

    def to_internal_value(self, data):
        # Convert camelCase keys to snake_case
        snake_case_data = {}
        for key, value in data.items():
            snake_case_key = self.camel_to_snake(key)
            snake_case_data[snake_case_key] = value
        return super().to_internal_value(snake_case_data)

    @staticmethod
    def camel_to_snake(name):
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()


class CedentSerializer(CamelCaseToSnakeCaseModelSerializer):
    class Meta:
        model = Cedent
        fields = ["name", "type", "min_len", "max_len", "id"]


class FourFtMinerSerializer(CamelCaseToSnakeCaseSerializer):
    id=serializers.IntegerField(read_only=True)
    dataset_id = serializers.IntegerField()
    name = serializers.CharField(max_length=256, required=True, allow_null=False)
    s3_key = serializers.CharField(max_length=256, required=False, allow_null=True)
    rules_count = serializers.IntegerField(read_only=True)
    dataset_name = serializers.CharField(read_only=True)
    base = serializers.IntegerField(min_value=1, max_value=1000000, required=False, allow_null=True)
    confidence = serializers.FloatField(max_value=1, required=False, allow_null=True)
    rel_base = serializers.FloatField(max_value=1, required=False, allow_null=True)
    aad = serializers.FloatField(max_value=1, required=False, allow_null=True)
    ante_min_len = serializers.IntegerField(min_value=1, max_value=128)
    ante_max_len = serializers.IntegerField(min_value=1, max_value=128)
    succe_min_len = serializers.IntegerField(min_value=1, max_value=128)
    succe_max_len = serializers.IntegerField(min_value=1, max_value=128)
    con_dis_antecedent_type = serializers.CharField(max_length=256)
    con_dis_succedent_type = serializers.CharField(max_length=256)
    con_dis_condition_type = serializers.CharField(max_length=256, required=False, allow_null=True)
    cond_min_len = serializers.IntegerField(min_value=1, max_value=128, required=False, allow_null=True)
    cond_max_len = serializers.IntegerField(min_value=1, max_value=128, required=False, allow_null=True)
    created_at = serializers.CharField(read_only=True)
    updated_at = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)

    # Used for POST (create) requests
    antecedent = CedentSerializer(many=True, write_only=True)
    succedent = CedentSerializer(many=True, write_only=True)
    condition = CedentSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = FourFtResult
        fields = "__all__"
        
    def _process_clm(self, clm, existing_storage_file=None):
        file_path = None
        """Helper method to process CLM object and upload to S3"""
        if len(clm.rulelist) > 0:
            file_path = storage.upload_clm_file(clm, existing_storage_file)
        return file_path, len(clm.rulelist)
        
    def _create_cedents(self, four_ft_result, antecedents, succedents, conditions=None):
        """Helper method to create cedent objects for antecedents, succedents, and conditions"""
        # Create Cedent instances for antecedents
        Cedent.objects.bulk_create([
            Cedent(
                name=antecedent['name'],
                type=antecedent['type'],
                min_len=antecedent['min_len'],
                max_len=antecedent['max_len'],
                role=Cedent.ANTECEDENT,
                four_ft_result=four_ft_result
            ) for antecedent in antecedents
        ])

        # Create Cedent instances for succedents
        Cedent.objects.bulk_create([
            Cedent(
                name=succedent['name'],
                type=succedent['type'],
                min_len=succedent['min_len'],
                max_len=succedent['max_len'],
                role=Cedent.SUCCEDENT,
                four_ft_result=four_ft_result
            ) for succedent in succedents
        ])
        
        # Create Cedent instances for conditions (if provided)
        if conditions:
            Cedent.objects.bulk_create([
                Cedent(
                    name=condition['name'],
                    type=condition['type'],
                    min_len=condition['min_len'],
                    max_len=condition['max_len'],
                    role=Cedent.CONDITION,
                    four_ft_result=four_ft_result
                ) for condition in conditions
            ])

    def create(self, validated_data):
        clm = validated_data.pop('clm', None)
        user = validated_data.pop('user', None)

        antecedents = validated_data.pop('antecedent', [])
        succedents = validated_data.pop('succedent', [])
        conditions = validated_data.pop('condition', [])
        dataset_id = validated_data.pop('dataset_id')

        try:
            dataset = Dataset.objects.get(id=dataset_id)
        except Dataset.DoesNotExist:
            raise serializers.ValidationError({"dataset_id": f"Dataset with id {dataset_id} not found."})
        
        # Process S3 and CLM
        file_path, rules_count = self._process_clm(clm)
        
        # Update validated data with additional information
        validated_data.update({
            'rules_count': rules_count,
            'dataset_name': dataset.name,
        })
        
        # Create the FourFtResult instance with user
        four_ft_result = FourFtResult.objects.create(dataset=dataset, user=user, **validated_data)

        # Create a StorageFile record
        if file_path:
            storage_file = StorageFile.objects.create(
                file_path=file_path,
                storage_type=storage.get_storage_type()
            )
            four_ft_result.storage_file = storage_file
            four_ft_result.save()

        # Create cedents
        self._create_cedents(four_ft_result, antecedents, succedents, conditions)

        return four_ft_result


    def update(self, instance, validated_data):
        """
        Update an existing FourFtResult instance:
        - Remove all existing Cedents
        - Recreate new Cedents based on updated data
        - Optionally re-run the cleverminer process if needed
        """
        clm = validated_data.pop('clm', None)

        # Extract related data from the validated data
        antecedents = validated_data.pop('antecedent', [])
        succedents = validated_data.pop('succedent', [])
        conditions = validated_data.pop('condition', [])  # Get optional condition literals
        dataset_id = validated_data.pop('dataset_id', instance.dataset.id)  # Keep existing dataset if not changed

        # Update fields of the instance
        for attr, value in validated_data.items():
            if hasattr(instance, attr):
                 setattr(instance, attr, value)

        # Fetch dataset if changed
        if dataset_id != instance.dataset.id:
            try:
                dataset = Dataset.objects.get(id=dataset_id)
                instance.dataset = dataset
            except Dataset.DoesNotExist:
                raise serializers.ValidationError({"dataset_id": f"Dataset with id {dataset_id} not found."})

        # Remove all existing cedents for the current result
        Cedent.objects.filter(four_ft_result=instance).delete()

        # Create new cedents
        self._create_cedents(instance, antecedents, succedents, conditions)
        
        # Handle storage file update/deletion
        if instance.storage_file:
            storage.delete_file(instance.storage_file)
            instance.storage_file = None # Remove reference before potentially creating a new one

        # Process CLM and get the new file path (if any)
        file_path, rules_count = self._process_clm(clm, instance.storage_file)
        
        # Update instance with rules count
        instance.rules_count = rules_count
        
        # Update StorageFile record
        if instance.storage_file:
            instance.storage_file.file_path = file_path
            instance.storage_file.storage_type = storage.get_storage_type()
            instance.storage_file.save()
        else:
            storage_file = StorageFile.objects.create(
                file_path=file_path,
                storage_type=storage.get_storage_type()
            )
            instance.storage_file = storage_file
        
        # Save updated instance
        instance.save()

        return instance

    def to_representation(self, instance):
        """
        Customize the GET response to separate antecedent and succedent.
        """

        representation = super().to_representation(instance)
        
        request = self.context.get("request", None)
        request_params = request.parser_context["kwargs"]
        
        is_detail_request = False
        if request_params.get("id") is not None or request_params.get("four_ft_id") is not None:
            is_detail_request = True
            
        antecedents = instance.cedents.filter(role=Cedent.ANTECEDENT)
        succedents = instance.cedents.filter(role=Cedent.SUCCEDENT)
        conditions = instance.cedents.filter(role=Cedent.CONDITION)

        antecedents = CedentSerializer(antecedents, many=True).data
        succedents = CedentSerializer(succedents, many=True).data
        conditions = CedentSerializer(conditions, many=True).data

        representation["antecedent"] = CedentSerializer(antecedents, many=True).data
        representation["succedent"] = CedentSerializer(succedents, many=True).data
        representation["condition"] = CedentSerializer(conditions, many=True).data

        storage_file = instance.storage_file

        representation['rules'] = []
        if is_detail_request and storage_file is not None:
            clm = clm_init(storage_file)
            rules = clm.result['rules']
            for rule in rules:
                rule['rule_text'] = clm.get_ruletext(rule['rule_id']) 
            representation['rules'] = rules
            
        if is_detail_request:
            dataset = Dataset.objects.get(id=instance.dataset_id)
            representation['dataset'] = DatasetSerializer(dataset).data
            
        return representation
    
    

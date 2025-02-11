from rest_framework import serializers
from ..models import Dataset, FourFtResult, Cedent
from cleverminer import cleverminer

from ..utils.s3 import clm_s3_upload, create_presigned_url

from django.conf import settings

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
        fields = ["name", "type", "min_len", "max_len"]


class FourFtMinerSerializer(CamelCaseToSnakeCaseSerializer):
    id=serializers.IntegerField(read_only=True)
    dataset_id = serializers.IntegerField()
    s3_key = serializers.CharField(max_length=256, required=False, allow_null=True)
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

    # Used for POST (create) requests
    antecedent = CedentSerializer(many=True, write_only=True)
    succedent = CedentSerializer(many=True, write_only=True)

    class Meta:
        model = FourFtResult
        fields = "__all__"

    def create(self, validated_data):
        clm = validated_data.pop('clm', None)

        antecedents = validated_data.pop('antecedent', [])
        succedents = validated_data.pop('succedent', [])
        dataset_id = validated_data.pop('dataset_id')

        try:
            dataset = Dataset.objects.get(id=dataset_id)
        except Dataset.DoesNotExist:
            raise serializers.ValidationError({"dataset_id": f"Dataset with id {dataset_id} not found."})

        s3_key = None
        if len(clm.rulelist) > 0:
            s3_key = clm_s3_upload(clm)

        validated_data.update({'s3_key': s3_key})

        # Create the FourFtResult instance
        four_ft_result = FourFtResult.objects.create(dataset=dataset, **validated_data)

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

        return four_ft_result

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

        antecedents = CedentSerializer(antecedents, many=True).data
        succedents = CedentSerializer(succedents, many=True).data

        representation["antecedent"] = CedentSerializer(antecedents, many=True).data
        representation["succedent"] = CedentSerializer(succedents, many=True).data
        
        # TODO when it is not needed to instantiate clever miner first in order to load
        # if is_detail_request:
        #     presigned_url = create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, representation["s3_key"])
        # 
        #     clm = cleverminer().load(presigned_url)
        #     
        #     print(len(clm.rulelist))
            
        return representation
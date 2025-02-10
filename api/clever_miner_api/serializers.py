from rest_framework import serializers
from .models import Dataset, FourFtResult, Cedent
from django.conf import settings

from .utils.s3 import create_presigned_url, get_boto_s3_client, dataset_s3_upload, four_ft_result_s3_upload

import pandas as pd

import re


def get_delimiter(value):
    match value.lower():
        case 'tab':
            return '\t'
        case 'space':
            return ' '
        case 'comma':
            return ','
        case 'semicolon':
            return ';'
        case 'pipe':
            return '|'
        case 'slash':
            return '/'
        case _:
            return value


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

class DatasetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=True)
    delimiter = serializers.CharField(max_length=16)

    class Meta:
        model = Dataset
        fields = ['id', 's3_key', 'file', 'created_at', 'name', 'delimiter', 'rows_count', 'columns_count']
        read_only_fields = ['s3_key', 'created_at', 'name', 'rows_count', 'columns_count']

    def create(self, validated_data):
        file = validated_data.pop('file')

        if not file or file.size == 0:
            raise serializers.ValidationError("Uploaded file is empty or invalid.")

        delimiter_name = validated_data.get('delimiter')

        delimiter = get_delimiter(delimiter_name)

        df = pd.read_csv(file, encoding='cp1250', sep=delimiter)

        rows_count = len(df.axes[0])
        columns_count = len(df.axes[1])

        # Upload the file to S3
        s3_key = dataset_s3_upload(file)

        # Save the dataset information in the database
        dataset = Dataset(name=file.name, s3_key=s3_key, delimiter=delimiter, rows_count=rows_count,
                          columns_count=columns_count)
        dataset.save()

        return dataset

    def to_representation(self, obj):
        representation = super().to_representation(obj)

        # Cache the result of get_url
        presigned_url = create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, obj.s3_key)

        file = pd.read_csv(presigned_url, encoding='cp1250', sep=obj.delimiter)
        representation['url'] = presigned_url
        columns = list(file.columns)
        # map columns and trim spaces around the header names
        representation['header_names'] = list(map(lambda x: x.strip(), columns))

        return representation

    def get_url(self, obj):
        return create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, obj.s3_key)


class AnteSucceSerializer(CamelCaseToSnakeCaseSerializer):
    name = serializers.CharField(max_length=256)
    type = serializers.CharField(max_length=256)
    min_len = serializers.IntegerField(min_value=1)
    max_len = serializers.IntegerField(min_value=1)


class FourFtMinerSerializer(CamelCaseToSnakeCaseSerializer):
    dataset_id = serializers.IntegerField()
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
    antecedent = AnteSucceSerializer(many=True)
    succedent = AnteSucceSerializer(many=True)

    def create(self, validated_data):
        clm = validated_data.pop('clm', None)

        antecedents = validated_data.pop('antecedent', [])
        succedents = validated_data.pop('succedent', [])
        dataset_id = validated_data.pop('dataset_id')

        try:
            dataset = Dataset.objects.get(id=dataset_id)
        except Dataset.DoesNotExist:
            raise serializers.ValidationError({"dataset_id": f"Dataset with id {dataset_id} not found."})

        # Create the FourFtResult instance
        four_ft_result = FourFtResult.objects.create(dataset=dataset, **validated_data)

        if len(clm.rulelist) > 0:
            four_ft_result_s3_upload(clm, four_ft_result.id)

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

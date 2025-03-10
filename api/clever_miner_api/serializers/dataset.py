from rest_framework import serializers
from ..models import Dataset, FourFtResult, Cedent
from django.conf import settings

from ..utils.s3 import create_presigned_url, dataset_s3_upload

import pandas as pd

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

        file = pd.read_csv(presigned_url, encoding='cp1250', sep=obj.delimiter, engine='python')
        representation['url'] = presigned_url
        columns = list(file.columns)
        # map columns and trim spaces around the header names
        representation['header_names'] = list(map(lambda x: x.strip(), columns))

        return representation

    def get_url(self, obj):
        return create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, obj.s3_key)
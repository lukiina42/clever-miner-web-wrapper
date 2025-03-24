from rest_framework import serializers
from ..models import Dataset, FourFtResult, Cedent, StorageFile
from django.conf import settings
from django.contrib.auth.models import User
from .user import UserSerializer
from .. import storage

from ..utils.s3 import create_presigned_url, dataset_s3_upload

import pandas as pd
import io

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
    user = UserSerializer(read_only=True)

    class Meta:
        model = Dataset
        fields = ['id', 'file', 'created_at', 'name', 'delimiter', 'rows_count', 'columns_count', 'user', 'storage_file']
        read_only_fields = ['created_at', 'name', 'rows_count', 'columns_count', 'user', 'storage_file']

    def create(self, validated_data):
        file = validated_data.pop('file')
        user = validated_data.pop('user', None)  # Get the user from validated_data

        if not file or file.size == 0:
            raise serializers.ValidationError("Uploaded file is empty or invalid.")

        delimiter_name = validated_data.get('delimiter')
        delimiter = get_delimiter(delimiter_name)
        df = pd.read_csv(file, encoding='cp1250', sep=delimiter)

        rows_count = len(df.axes[0])
        columns_count = len(df.axes[1])

        # Upload the file to storage
        file_path = storage.upload_dataset_file(file)
        
        if settings.USE_S3_STORAGE:
            storage_type = StorageFile.S3
        else:
            storage_type = StorageFile.LOCAL
            
        storage_file = StorageFile.objects.create(file_path=file_path, storage_type=storage_type)

        # Save the dataset information in the database
        dataset = Dataset(
            name=file.name, 
            storage_file=storage_file,
            delimiter=delimiter, 
            rows_count=rows_count,
            columns_count=columns_count,
            user=user  # Associate with the user
        )
        dataset.save()

        return dataset

    def to_representation(self, obj):
        representation = super().to_representation(obj)

        # Get the file url from the appropriate storage
        file_url = storage.create_file_url(obj.storage_file)
        representation['url'] = file_url
        
        try:
            file = pd.read_csv(representation['url'], encoding='cp1250', sep=obj.delimiter, engine='python')
            columns = list(file.columns)
                # map columns and trim spaces around the header names
            representation['header_names'] = list(map(lambda x: x.strip(), columns))
                
        except Exception as e:
            print(f"Error reading file headers: {str(e)}")
            representation['header_names'] = []

        return representation

    def get_url(self, obj):
        return storage.create_file_url(obj.storage_file)
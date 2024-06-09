from rest_framework import serializers
from .models import DataSet
from django.conf import settings
import boto3


class DatasetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=True)

    class Meta:
        model = DataSet
        fields = ['id', 'name', 's3_key', 'file']
        read_only_fields = ['s3_key']

    def create(self, validated_data):
        file = validated_data.pop('file')
        name = validated_data.get('name')

        # Upload the file to S3
        s3 = boto3.client('s3')
        bucket_name = settings.AWS_BUCKET_NAME
        s3_key = f'datasets/{file.name}'

        s3.upload_fileobj(file, bucket_name, s3_key)

        # Save the dataset information in the database
        dataset = DataSet(name=name, s3_key=s3_key)
        dataset.save()

        return dataset

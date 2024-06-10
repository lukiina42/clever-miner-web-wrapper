from rest_framework import serializers
from .models import Dataset
from django.conf import settings
import boto3

from .utils.rand_string import generate_random_string
from .utils.s3 import create_presigned_url, get_boto_s3_client


class DatasetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=True)
    url = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ['id', 's3_key', 'file', 'created_at', 'name', 'url']
        read_only_fields = ['s3_key', 'created_at', 'name', 'url']

    def create(self, validated_data):
        file = validated_data.pop('file')

        # Upload the file to S3
        s3 = get_boto_s3_client()
        random_string = generate_random_string(32)
        s3_key = f'datasets/{random_string}'

        s3.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_key, ExtraArgs={
            'ContentType': file.content_type,
        }, )

        # Save the dataset information in the database
        dataset = Dataset(name=file.name, s3_key=s3_key)
        dataset.save()

        return dataset

    def get_url(self, obj):
        return create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, obj.s3_key)

class FourFtMinerSerializer(serializers.Serializer):
    dataset_id = serializers.IntegerField()
    base = serializers.IntegerField(min_value=1, max_value=1000000)
    confidence = serializers.FloatField(min_value=0.1, max_value=1)
    antecedentName = serializers.CharField(max_length=256)
    succedentName = serializers.CharField(max_length=256)

from rest_framework import serializers
from .models import Dataset
from django.conf import settings
import boto3

from .utils.rand_string import generate_random_string
from .utils.s3 import create_presigned_url, get_boto_s3_client

import pandas as pd


class DatasetSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True, required=True)
    # url = serializers.SerializerMethodField()
    # header_names = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ['id', 's3_key', 'file', 'created_at', 'name']
        read_only_fields = ['s3_key', 'created_at', 'name']

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

    def to_representation(self, obj):
        representation = super().to_representation(obj)

        # Cache the result of get_url
        presigned_url = create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, obj.s3_key)

        file = pd.read_csv(presigned_url)
        representation['url'] = presigned_url
        columns = list(file.columns)
        # map columns and trim spaces around the header names
        representation['header_names'] = list(map(lambda x: x.strip(), columns))

        return representation

    def get_url(self, obj):
        return create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, obj.s3_key)
    

class AnteSucceSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=256)
    type = serializers.CharField(max_length=256)
    minLen = serializers.IntegerField(min_value=1)
    maxLen = serializers.IntegerField(min_value=1)

class FourFtMinerSerializer(serializers.Serializer):
    dataset_id = serializers.IntegerField()
    base = serializers.IntegerField(min_value=1, max_value=1000000, required=False, allow_null=True)
    confidence = serializers.FloatField(min_value=0.1, max_value=1, required=False, allow_null=True)
    relbase = serializers.FloatField(min_value=0.1, max_value=1, required=False, allow_null=True)
    aad = serializers.FloatField(min_value=0.1, max_value=1, required=False, allow_null=True)
    anteMinLen = serializers.IntegerField(min_value=1, max_value=128)
    anteMaxLen = serializers.IntegerField(min_value=1, max_value=128)
    succeMinLen = serializers.IntegerField(min_value=1, max_value=128)
    succeMaxLen = serializers.IntegerField(min_value=1, max_value=128)
    conDisAntecedentType = serializers.CharField(max_length=256)
    conDisSuccedentType = serializers.CharField(max_length=256)
    antecedent = AnteSucceSerializer(many=True)
    succedent = AnteSucceSerializer(many=True)

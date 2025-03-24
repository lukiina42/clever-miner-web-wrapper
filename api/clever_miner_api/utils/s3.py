import logging
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config

from django.conf import settings

from pathlib import Path

from ..utils.rand_string import generate_random_string
from ..utils.const import get_saved_result_path


def get_boto_s3_client():
    return boto3.client('s3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        config=Config(signature_version='s3v4'),
                        region_name=settings.AWS_S3_REGION_NAME
                        )


def   create_presigned_url(bucket_name: str, object_name: str, expiration=24000):
    """Generate a presigned URL to share an S3 object

    :param bucket_name: string
    :param object_name: string
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """

    # Generate a presigned URL for the S3 object
    s3_client = get_boto_s3_client()
    try:
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket_name,
                                                            'Key': object_name},
                                                    ExpiresIn=expiration)
    except ClientError as e:
        logging.error(e)
        return None

    # The response contains the presigned URL
    return response

def dataset_s3_upload(file):
    s3 = get_boto_s3_client()

    random_string = generate_random_string(32)
    s3_key = f'datasets/{random_string}'

    file.seek(0)

    s3.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, s3_key, ExtraArgs={
        'ContentType': file.content_type,
    }, )
    
    return s3_key

def clm_s3_upload(clm, s3_key: str = None):
    if s3_key is None:  
        key = f'results/{generate_random_string(32)}'
    else:
        key = s3_key

    result_path = get_saved_result_path(key)

    clm.save(result_path)

    file_path = "../../" + result_path
    path = Path(__file__).parent / file_path
    with path.open("rb") as saved_file:  # Ensure binary mode
        s3 = get_boto_s3_client()
        s3_key = key

        saved_file.seek(0)

        s3.upload_fileobj(saved_file, settings.AWS_STORAGE_BUCKET_NAME, s3_key, ExtraArgs={
            'ContentType': 'application/octet-stream',
        }, )

    if path.exists():
        path.unlink()
    
    return s3_key

def download_s3_file(s3_key, save_path):
    s3 = get_boto_s3_client()
    s3.download_file(settings.AWS_STORAGE_BUCKET_NAME, s3_key, save_path)


def object_s3_delete(s3_key):
    s3 = get_boto_s3_client()

    s3.delete_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME,Key=s3_key)

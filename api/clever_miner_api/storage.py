import os
from django.conf import settings
import logging
from .models import StorageFile

# Import storage utilities
from .utils.s3 import (
    clm_s3_upload, 
    create_presigned_url, 
    download_s3_file, 
    object_s3_delete,
    dataset_s3_upload
)
from .utils.local_storage import (
    clm_local_upload, 
    create_local_url, 
    download_local_file, 
    object_local_delete,
    dataset_local_upload
)

logger = logging.getLogger(__name__)

def get_storage_type():
    """
    Determine which storage type to use based on environment variable
    
    Returns:
        str: Either StorageFile.LOCAL or StorageFile.S3
    """
    use_s3 = os.getenv('USE_S3_STORAGE', 'true').lower() == 'true'
    return StorageFile.S3 if use_s3 else StorageFile.LOCAL

def upload_dataset_file(file):
    """
    Upload a dataset file to the appropriate storage
    
    Args:
        file: Django UploadedFile object
        
    Returns:
        file_path: Path of the saved file
    """
    storage_type = get_storage_type()
    
    if storage_type == StorageFile.S3:
        file_path = dataset_s3_upload(file)
    else:
        file_path = dataset_local_upload(file)
    
    return file_path

def upload_clm_file(clm, existing_storage_file=None):
    """
    Upload a cleverminer result to the appropriate storage
    
    Args:
        clm: Cleverminer object
        existing_storage_file: Optional StorageFile to replace
        
    Returns:
        StorageFile: Storage file object
    """
    storage_type = get_storage_type()
    existing_path = None
    
    # If we have an existing file, get its path
    if existing_storage_file:
        existing_path = existing_storage_file.file_path
        
    if storage_type == StorageFile.S3:
        file_path = clm_s3_upload(clm, existing_path)
    else:
        file_path = clm_local_upload(clm, existing_path)
        
    return file_path

def download_file(storage_file, save_path: str):
    """
    Download a file from the appropriate storage
    
    Args:
        storage_file: storage file entity
        save_path: path to save the file
        
    Returns:
        None
    """
    file_path = storage_file.file_path
    if storage_file.storage_type == StorageFile.S3:
        return download_s3_file(file_path, save_path)
    else:
        return download_local_file(file_path, save_path)

def delete_file(storage_file):
    """
    Delete a file from the appropriate storage
    
    Args:
        storage_file: StorageFile object
        
    Returns:
        bool: True if successful
    """
    if storage_file.storage_type == StorageFile.S3:
        result = object_s3_delete(storage_file.file_path)
    else:
        result = object_local_delete(storage_file.file_path)
        
    return result

def create_file_url(storage_file):
    """
    Create a URL for a file in the appropriate storage
    
    Args:
        storage_file: StorageFile object
        
    Returns:
        str: URL
    """
    if storage_file.storage_type == StorageFile.S3:
        return create_presigned_url(settings.AWS_STORAGE_BUCKET_NAME, storage_file.file_path)
    else:
        return create_local_url(storage_file.file_path) 
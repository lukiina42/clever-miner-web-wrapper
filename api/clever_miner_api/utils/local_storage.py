import os
import json
import logging
import shutil
from pathlib import Path
from django.conf import settings
from django.core.files.storage import default_storage

from ..utils.const import get_saved_result_path
from ..utils.rand_string import generate_random_string

logger = logging.getLogger(__name__)

def ensure_media_dir_exists():
    """Ensure the media directory exists"""
    media_dir = os.path.join(settings.BASE_DIR, 'media')
    os.makedirs(media_dir, exist_ok=True)
    return media_dir

def dataset_local_upload(file):
    """
    Upload a dataset file to local storage
    
    Args:
        file: Django UploadedFile object
    
    Returns:
        str: File path
    """
    ensure_media_dir_exists()
    file_path = f"datasets/{file.name}"
    path = default_storage.save(file_path, file)
    return path

def clm_local_upload(clm, existing_file_path=None):
    """
    Upload cleverminer result to local storage
    
    Args:
        clm: Cleverminer object
        existing_file_path: Optional path to replace existing file
    
    Returns:
        str: File path
    """
    ensure_media_dir_exists()
    
    # Delete existing file if it exists
    if existing_file_path and default_storage.exists(existing_file_path):
        default_storage.delete(existing_file_path)
    
    file_name = generate_random_string(32)
    result_path = get_saved_result_path(file_name)

    clm.save(result_path)

    file_path = "../../" + result_path
    path = Path(__file__).parent / file_path
    with path.open("rb") as saved_file:  # Ensure binary mode
        saved_file.seek(0)

        file_path = f"four_ft_results/{file_name}"
        default_storage.save(file_path, saved_file)

    if path.exists():
        path.unlink()
    
    return file_path

def download_local_file(file_path, save_path):
    """
    Download a file from local storage
    """
    # Remove storage prefix if present
    if file_path.startswith('local:'):
        file_path = file_path[6:]  # Remove 'local:' prefix
    
    if not default_storage.exists(file_path):
        raise FileNotFoundError(f"File {file_path} not found in local storage")
    
    # Create directory structure if it doesn't exist
    save_dir = os.path.dirname(save_path)
    if save_dir:
        os.makedirs(save_dir, exist_ok=True)
    
    # Option 1: Copy the file directly if using FileSystemStorage
    storage_path = default_storage.path(file_path)
    if os.path.exists(storage_path):
        shutil.copy2(storage_path, save_path)
        return None
    
    # Option 2: Read and write if direct path not available
    with default_storage.open(file_path, 'rb') as source_file:
        content = source_file.read()
        with open(save_path, 'wb') as destination_file:
            destination_file.write(content)
        return None
    

def object_local_delete(file_path):
    """
    Delete a file from local storage
    
    Args:
        file_path: Path to the file
    
    Returns:
        bool: True if successful
    """
    # Remove storage prefix if present
    if file_path.startswith('local:'):
        file_path = file_path[6:]  # Remove 'local:' prefix
        
    if default_storage.exists(file_path):
        default_storage.delete(file_path)
        return True
    return False

def create_local_url(file_path):
    """
    Create a URL for a local file
    
    Args:
        file_path: Path to the file
    
    Returns:
        str: URL
    """
    # Remove storage prefix if present
    if file_path.startswith('local:'):
        file_path = file_path[6:]  # Remove 'local:' prefix
        
    if not default_storage.exists(file_path):
        raise FileNotFoundError(f"File {file_path} not found in local storage")
    
    base_url = settings.BASE_URL
    
    # For production, use the configured URL
    return f"{base_url}{default_storage.url(file_path)}"
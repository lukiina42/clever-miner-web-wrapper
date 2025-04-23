import os
import tempfile
import pandas as pd
from io import StringIO
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from ..models import Dataset, StorageFile
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch


class DatasetApiTests(TestCase):
    """Integration tests for the Dataset API endpoints"""

    def setUp(self):
        """Set up test data and authenticate the client"""
        # Create a test user
        self.username = 'testuser'
        self.password = 'testpassword'
        self.user = User.objects.create_user(
            username=self.username,
            email='test@example.com',
            password=self.password
        )
        
        # Create another test user
        self.other_username = 'otheruser'
        self.other_password = 'otherpassword'
        self.other_user = User.objects.create_user(
            username=self.other_username,
            email='other@example.com',
            password=self.other_password
        )
        
        # Set up the API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Create a test CSV file
        self.csv_content = "A,B,C\n1,2,3\n4,5,6\n7,8,9"
        self.csv_file = SimpleUploadedFile(
            name="test_data.csv",
            content=self.csv_content.encode(),
            content_type="text/csv"
        )
        
        # Endpoint URL - note the complete path including clever-miner
        self.dataset_url = "/clever-miner/dataset"
        
        # Create some test datasets for the GET tests
        self.create_test_datasets()
        
        # Mock file URL for tests
        self.file_url_patcher = patch('clever_miner_api.storage.create_file_url')
        self.mock_file_url = self.file_url_patcher.start()
        self.mock_file_url.return_value = 'http://testserver/media/test-file-url'
        
        # Create a temporary directory for test files
        if not os.path.exists(settings.MEDIA_ROOT):
            os.makedirs(settings.MEDIA_ROOT)
    
    def create_test_datasets(self):
        """Create some test datasets in the database"""
        # Storage type
        storage_type = StorageFile.LOCAL if not settings.USE_S3_STORAGE else StorageFile.S3
        
        # Create 3 datasets for the main test user
        for i in range(3):
            storage_file = StorageFile.objects.create(
                file_path=f"datasets/test_file_{i}.csv",
                storage_type=storage_type
            )
            
            Dataset.objects.create(
                name=f"Test Dataset {i}",
                delimiter=",",
                storage_file=storage_file,
                rows_count=3,
                columns_count=3,
                user=self.user
            )
        
        # Create 2 datasets for the other user
        for i in range(2):
            storage_file = StorageFile.objects.create(
                file_path=f"datasets/other_file_{i}.csv",
                storage_type=storage_type
            )
            
            Dataset.objects.create(
                name=f"Other Dataset {i}",
                delimiter=",",
                storage_file=storage_file,
                rows_count=3,
                columns_count=3,
                user=self.other_user
            )
    
    @patch('clever_miner_api.serializers.dataset.pd.read_csv')
    def test_get_all_datasets(self, mock_read_csv):
        """Test retrieving all datasets for the authenticated user"""
        # Mock the read_csv function to return a dataframe with test columns
        mock_df = pd.DataFrame(data={'A': [1, 2], 'B': [3, 4], 'C': [5, 6]})
        mock_read_csv.return_value = mock_df
        
        # Make the request
        response = self.client.get(self.dataset_url)
        
        # Check response status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that only datasets for the authenticated user are returned
        self.assertEqual(len(response.data), 3)
        
        # Check that the dataset names are correct
        dataset_names = [dataset['name'] for dataset in response.data]
        expected_names = ["Test Dataset 0", "Test Dataset 1", "Test Dataset 2"]
        self.assertCountEqual(dataset_names, expected_names)
    
    @patch('clever_miner_api.serializers.dataset.pd.read_csv')
    def test_get_datasets_with_name_filter(self, mock_read_csv):
        """Test retrieving datasets with a name filter"""
        # Mock the read_csv function to return a dataframe with test columns
        mock_df = pd.DataFrame(data={'A': [1, 2], 'B': [3, 4], 'C': [5, 6]})
        mock_read_csv.return_value = mock_df
        
        # Make a request with a name filter
        response = self.client.get(f"{self.dataset_url}?name=Test Dataset 1")
        
        # Check response status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that only the matching dataset is returned
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Test Dataset 1")
    
    @patch('clever_miner_api.serializers.dataset.pd.read_csv')
    def test_get_datasets_with_ordering(self, mock_read_csv):
        """Test retrieving datasets with ordering"""
        # Mock the read_csv function to return a dataframe with test columns
        mock_df = pd.DataFrame(data={'A': [1, 2], 'B': [3, 4], 'C': [5, 6]})
        mock_read_csv.return_value = mock_df
        
        # Make a request with ascending ordering by name
        response = self.client.get(f"{self.dataset_url}?ordering=name")
        
        # Check response status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that datasets are ordered correctly
        dataset_names = [dataset['name'] for dataset in response.data]
        expected_names = ["Test Dataset 0", "Test Dataset 1", "Test Dataset 2"]
        self.assertEqual(dataset_names, expected_names)
        
        # Make a request with descending ordering by name
        response = self.client.get(f"{self.dataset_url}?ordering=-name")
        
        # Check response status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify that datasets are ordered correctly
        dataset_names = [dataset['name'] for dataset in response.data]
        expected_names = ["Test Dataset 2", "Test Dataset 1", "Test Dataset 0"]
        self.assertEqual(dataset_names, expected_names)
    
    def test_get_datasets_without_authentication(self):
        """Test that unauthenticated requests are rejected"""
        # Create a new client without authentication
        unauthenticated_client = APIClient()
        
        # Make the request
        response = unauthenticated_client.get(self.dataset_url)
        
        # Check response status code (should be 401 Unauthorized)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    @patch('clever_miner_api.serializers.dataset.pd.read_csv')
    def test_get_datasets_data_separation(self, mock_read_csv):
        """Test that users can only see their own datasets"""
        # Mock the read_csv function to return a dataframe with test columns
        mock_df = pd.DataFrame(data={'A': [1, 2], 'B': [3, 4], 'C': [5, 6]})
        mock_read_csv.return_value = mock_df
        
        # Make a request with the main test user
        response = self.client.get(self.dataset_url)
        
        # Check that only the main user's datasets are returned
        self.assertEqual(len(response.data), 3)
        for dataset in response.data:
            self.assertTrue(dataset['name'].startswith("Test Dataset"))
        
        # Switch to the other user
        self.client.force_authenticate(user=self.other_user)
        
        # Make a request with the other user
        response = self.client.get(self.dataset_url)
        
        # Check that only the other user's datasets are returned
        self.assertEqual(len(response.data), 2)
        for dataset in response.data:
            self.assertTrue(dataset['name'].startswith("Other Dataset"))
    
    @patch('clever_miner_api.serializers.dataset.pd.read_csv')
    def test_create_dataset_with_valid_data(self, mock_read_csv):
        """Test creating a dataset with valid data"""
        # Mock the read_csv function to return a dataframe with test columns
        mock_df = pd.DataFrame(data={'A': [1, 2, 3], 'B': [4, 5, 6], 'C': [7, 8, 9]})
        mock_read_csv.return_value = mock_df
        
        # Mock the header_names
        mock_read_csv.return_value.columns = ['A', 'B', 'C']
        
        # Prepare the request data
        data = {
            'file': self.csv_file,
            'delimiter': 'comma'
        }
        
        # Make the request
        response = self.client.post(self.dataset_url, data, format='multipart')
        
        # Check response status code
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check if dataset was created in the database
        # We already have 5 datasets from setUp (3 for main user, 2 for other user)
        self.assertEqual(Dataset.objects.count(), 6)
        
        # Verify the dataset properties
        dataset = Dataset.objects.latest('id')
        self.assertEqual(dataset.name, "test_data.csv")
        self.assertEqual(dataset.delimiter, ",")
        self.assertEqual(dataset.rows_count, 3)  # 3 data rows in our test file
        self.assertEqual(dataset.columns_count, 3)  # 3 columns (A, B, C)
        self.assertEqual(dataset.user, self.user)
        
        # Verify storage file was created
        self.assertIsNotNone(dataset.storage_file)
        
        # Check response data
        self.assertEqual(response.data['name'], "test_data.csv")
        self.assertEqual(response.data['rows_count'], 3)
        self.assertEqual(response.data['columns_count'], 3)
        self.assertEqual(response.data['delimiter'], ",")
        self.assertIn('url', response.data)
    
    def test_create_dataset_without_authentication(self):
        """Test that unauthenticated requests are rejected"""
        # Create a new client without authentication
        unauthenticated_client = APIClient()
        
        # Prepare the request data
        data = {
            'file': self.csv_file,
            'delimiter': 'comma'
        }
        
        # Make the request
        response = unauthenticated_client.post(self.dataset_url, data, format='multipart')
        
        # Check response status code (should be 401 Unauthorized)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Verify no additional dataset was created
        self.assertEqual(Dataset.objects.count(), 5)  # 5 from setUp
    
    def test_create_dataset_with_empty_file(self):
        """Test creating a dataset with an empty file"""
        # Prepare an empty file
        empty_file = SimpleUploadedFile(
            name="empty.csv",
            content=b"",
            content_type="text/csv"
        )
        
        # Prepare the request data
        data = {
            'file': empty_file,
            'delimiter': 'comma'
        }
        
        # Make the request
        response = self.client.post(self.dataset_url, data, format='multipart')
        
        # Check response status code (should be 400 Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify no additional dataset was created
        self.assertEqual(Dataset.objects.count(), 5)  # 5 from setUp
    
    def test_create_dataset_with_missing_file(self):
        """Test creating a dataset without a file"""
        # Prepare the request data without a file
        data = {
            'delimiter': 'comma'
        }
        
        # Make the request
        response = self.client.post(self.dataset_url, data, format='multipart')
        
        # Check response status code (should be 400 Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify no additional dataset was created
        self.assertEqual(Dataset.objects.count(), 5)  # 5 from setUp
    
    @patch('clever_miner_api.serializers.dataset.pd.read_csv')
    def test_create_dataset_with_different_delimiters(self, mock_read_csv):
        """Test creating datasets with different delimiters"""
        # Test cases with different delimiters
        test_cases = [
            {
                'content': "A;B;C\n1;2;3\n4;5;6",
                'delimiter': 'semicolon',
                'expected_delimiter': ";",
                'expected_columns': ['A', 'B', 'C']
            },
            {
                'content': "A\tB\tC\n1\t2\t3\n4\t5\t6",
                'delimiter': 'tab',
                'expected_delimiter': "\t",
                'expected_columns': ['A', 'B', 'C']
            },
            {
                'content': "A|B|C\n1|2|3\n4|5|6",
                'delimiter': 'pipe',
                'expected_delimiter': "|",
                'expected_columns': ['A', 'B', 'C']
            }
        ]
        
        for i, test_case in enumerate(test_cases):
            # Mock the read_csv function to return a dataframe with test columns
            mock_df = pd.DataFrame(data={'A': [1, 2], 'B': [3, 4], 'C': [5, 6]})
            mock_read_csv.return_value = mock_df
            mock_read_csv.return_value.columns = ['A', 'B', 'C']
            
            # Create a CSV file with the specified content and delimiter
            csv_file = SimpleUploadedFile(
                name=f"test_data_{i}.csv",
                content=test_case['content'].encode(),
                content_type="text/csv"
            )
            
            # Prepare the request data
            data = {
                'file': csv_file,
                'delimiter': test_case['delimiter']
            }
            
            # Make the request
            response = self.client.post(self.dataset_url, data, format='multipart')
            
            # Check response status code
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            
            # Verify the dataset properties
            dataset = Dataset.objects.latest('id')
            self.assertEqual(dataset.delimiter, test_case['expected_delimiter'])
    
    def tearDown(self):
        """Clean up after each test"""
        # Stop file URL patch
        self.file_url_patcher.stop()
        
        # Delete all datasets and associated files
        for dataset in Dataset.objects.all():
            if dataset.storage_file:
                # If we're using local storage, delete the file
                if not settings.USE_S3_STORAGE:
                    file_path = os.path.join(settings.MEDIA_ROOT, dataset.storage_file.file_path)
                    if os.path.exists(file_path):
                        os.remove(file_path) 
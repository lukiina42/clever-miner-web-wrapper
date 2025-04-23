from django.test import SimpleTestCase
from unittest.mock import patch, MagicMock
import os
import shutil
import pandas as pd
import pickle
from ..utils.clm_init import clm_init

class TestClmInit(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Define paths
        cls.test_dir = os.path.dirname(os.path.abspath(__file__))
        cls.data_dir = os.path.join(cls.test_dir, 'data')
        cls.utils_dir = os.path.join(os.path.dirname(cls.test_dir), 'utils')
        
        # Create test data directory if it doesn't exist
        os.makedirs(cls.data_dir, exist_ok=True)
        
        # Create test pickle file
        cls.test_pickle_path = os.path.join(cls.data_dir, 'test_clm.pkl')
        cls.create_test_pickle()

    @classmethod
    def create_test_pickle(cls):
        # Create a sample cleverminer object for testing
        test_data = {
            'test_key': 'test_value',
            'rules': ['rule1', 'rule2']
        }
        with open(cls.test_pickle_path, 'wb') as f:
            pickle.dump(test_data, f)

    def setUp(self):
        # Create a temporary empty.txt file in the utils directory
        self.empty_file_path = os.path.join(self.utils_dir, 'empty.txt')
        with open(self.empty_file_path, 'w') as f:
            f.write('AgeStatus income\n')  # Header row
            f.write('young high\n')  # Sample data

    def tearDown(self):
        # Clean up the temporary file after tests
        if os.path.exists(self.empty_file_path):
            os.remove(self.empty_file_path)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # Clean up test data directory
        if os.path.exists(cls.data_dir):
            shutil.rmtree(cls.data_dir)

    @patch('clever_miner_api.utils.clm_init.download_file')
    @patch('clever_miner_api.utils.clm_init.remove_file')
    @patch('clever_miner_api.utils.clm_init.cleverminer')
    def test_clm_init_success(self, mock_cleverminer, mock_remove_file, mock_download):
        # Arrange
        storage_file = MagicMock()
        mock_clm_instance = MagicMock()
        mock_cleverminer.return_value = mock_clm_instance

        # Mock download to copy our test pickle file
        def mock_download_implementation(storage_file, local_path):
            shutil.copy(self.test_pickle_path, local_path)
        mock_download.side_effect = mock_download_implementation

        # Act
        result = clm_init(storage_file)

        # Assert
        mock_download.assert_called_once_with(storage_file, 'temp_clm_file.pkl')
        mock_clm_instance.load.assert_called_once_with('temp_clm_file.pkl')
        mock_remove_file.assert_called_once_with('../../temp_clm_file.pkl')
        self.assertEqual(result, mock_clm_instance)

    @patch('clever_miner_api.utils.clm_init.download_file')
    def test_clm_init_download_failure(self, mock_download):
        # Arrange
        storage_file = MagicMock()
        
        mock_download.side_effect = Exception('Failed to download')

        # Act & Assert
        with self.assertRaises(Exception):
            clm_init(storage_file) 
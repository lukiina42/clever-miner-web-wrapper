from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from pathlib import Path
import pickle
from ..models import Dataset, FourFtResult, StorageFile

User = get_user_model()

@patch('clever_miner_api.utils.clm_init.cleverminer')
class TestFourFtViews(TestCase):
    def setUp(self):
        """Set up test data."""
        # Get test directory path
        self.test_dir = Path(__file__).parent
        
        # Create test data directory in media_test
        self.data_dir = Path('media_test') / 'test_data'
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Create test files
        self.dataset_file = self.data_dir / 'dataset.csv'
        self.dataset_file.write_text('id,name,age\n1,John,30\n2,Jane,25\n')
        
        # Create a test pickle file with mock CLM data
        self.result_file = self.data_dir / 'result.pkl'
        mock_clm_data = {
            'result': {
                'rules': [
                    {'rule_id': 1, 'params': {'base': 10, 'conf': 0.8}},
                    {'rule_id': 2, 'params': {'base': 15, 'conf': 0.9}}
                ]
            }
        }
        with open(self.result_file, 'wb') as f:
            pickle.dump(mock_clm_data, f)
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test storage files
        self.dataset_storage = StorageFile.objects.create(
            file_path=str(self.dataset_file),
            storage_type='local'
        )
        
        self.result_storage = StorageFile.objects.create(
            file_path=str(self.result_file),
            storage_type='local'
        )
        
        # Create test dataset
        self.dataset = Dataset.objects.create(
            name='Test Dataset',
            user=self.user,
            columns_count=3,
            rows_count=2,
            delimiter=',',
            storage_file=self.dataset_storage
        )
        
        # Create test FourFt result
        self.four_ft_result = FourFtResult.objects.create(
            name='Test Result',
            dataset=self.dataset,
            dataset_name=self.dataset.name,
            user=self.user,
            storage_file=self.result_storage,
            rules_count=10,
            ante_min_len=1,
            ante_max_len=3,
            succe_min_len=1,
            succe_max_len=3,
            con_dis_antecedent_type='conjunction',
            con_dis_succedent_type='conjunction'
        )
        
        # Set up the client and authenticate
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def tearDown(self):
        """Clean up test files."""
        # Clean up test data directory
        if self.data_dir.exists():
            for file in self.data_dir.iterdir():
                file.unlink()
            self.data_dir.rmdir()
        
    @patch('clever_miner_api.services.DatasetService.get_dataset_with_permission_check')
    @patch('clever_miner_api.services.MiningService.process_mining_data')
    def test_create_fourft_result(self, mock_process_mining, mock_get_dataset, mock_cleverminer):
        """Test creating a new FourFt mining result"""
        # Mock the dataset service
        mock_get_dataset.return_value = self.dataset
        
        # Create a mock CLM result file
        mock_result_file = self.data_dir / 'test_result.pkl'
        mock_clm_data = {
            'result': {
                'rules': [
                    {'rule_id': 1, 'params': {'base': 10, 'conf': 0.8}},
                    {'rule_id': 2, 'params': {'base': 15, 'conf': 0.9}}
                ]
            }
        }
        with open(mock_result_file, 'wb') as f:
            pickle.dump(mock_clm_data, f)
        
        # Mock the mining service
        mock_clm = MagicMock()
        mock_clm.result = mock_clm_data['result']
        mock_process_mining.return_value = mock_clm
        
        # Test data
        data = {
            'name': 'New Test Result',
            'datasetId': self.dataset.id,
            'anteMinLen': 1,
            'anteMaxLen': 3,
            'succeMinLen': 1,
            'succeMaxLen': 3,
            'conDisAntecedentType': 'conjunction',
            'conDisSuccedentType': 'conjunction',
            'antecedent': [{'name': 'age', 'type': 'interval', 'minLen': 1, 'maxLen': 1}],
            'succedent': [{'name': 'income', 'type': 'interval', 'minLen': 1, 'maxLen': 1}]
        }
        
        response = self.client.post('/clever-miner/fourftminer', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        
    @patch('clever_miner_api.utils.clm_init.clm_init')
    @patch('clever_miner_api.services.ResultService.filter_results')
    def test_get_fourft_results(self, mock_filter_results, mock_clm_init, mock_cleverminer):
        """Test retrieving FourFt mining results"""
        # Mock the clm_init function
        mock_clm = MagicMock()
        mock_clm.result = {
            'rules': [
                {'rule_id': 1, 'params': {'base': 10, 'conf': 0.8}},
                {'rule_id': 2, 'params': {'base': 15, 'conf': 0.9}}
            ]
        }
        mock_clm.get_ruletext.return_value = "Test rule text"
        mock_clm_init.return_value = mock_clm
        
        # Mock the cleverminer function
        mock_cleverminer_instance = MagicMock()
        mock_cleverminer_instance.result = mock_clm.result
        mock_cleverminer.return_value = mock_cleverminer_instance
        
        # Mock the filter_results function
        mock_filter_results.return_value = FourFtResult.objects.filter(id=self.four_ft_result.id)
        
        response = self.client.get('/clever-miner/fourftminer')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Should return our one test result
        
    @patch('clever_miner_api.utils.clm_init.clm_init')
    @patch('django.shortcuts.get_object_or_404')
    @patch('clever_miner_api.storage.download_file')
    @patch('clever_miner_api.storage.download_local_file')
    @patch('clever_miner_api.serializers.dataset.DatasetSerializer.to_representation')
    @patch('clever_miner_api.serializers.fourft.FourFtMinerSerializer.to_representation')
    def test_get_fourft_result_detail(self, mock_fourft_representation, mock_dataset_representation, mock_download_local, mock_download_file, mock_get_object_or_404, mock_clm_init, mock_cleverminer):
        """Test retrieving a specific FourFt mining result"""
        # Create mock rules data
        mock_rules = [
            {
                'rule_id': 1, 
                'params': {'base': 10, 'conf': 0.8},
                'rule_text': 'Rule text for rule 1'
            },
            {
                'rule_id': 2, 
                'params': {'base': 15, 'conf': 0.9},
                'rule_text': 'Rule text for rule 2'
            }
        ]
        
        # Mock the clm_init function
        mock_clm = MagicMock()
        mock_clm.result = {'rules': mock_rules}
        mock_clm.get_ruletext.side_effect = lambda rule_id: f"Rule text for rule {rule_id}"
        mock_clm_init.return_value = mock_clm
        
        # Mock the cleverminer function
        mock_cleverminer_instance = MagicMock()
        mock_cleverminer_instance.result = {'rules': mock_rules}
        mock_cleverminer.return_value = mock_cleverminer_instance
        
        # Mock get_object_or_404
        mock_get_object_or_404.return_value = self.four_ft_result
        
        # Mock the download_file to return a dummy path
        mock_download_file.return_value = "/dummy/path/result.pkl"
        
        # Mock the download_local_file to do nothing
        mock_download_local.return_value = None
        
        # Mock dataset representation
        mock_dataset_representation.return_value = {
            'id': self.dataset.id,
            'name': self.dataset.name,
            'url': 'http://example.com/dataset',
            'header_names': ['A', 'B', 'C']
        }
        
        # Mock FourFtMiner representation
        mock_fourft_representation.return_value = {
            'id': self.four_ft_result.id,
            'name': 'Test Result',
            'rules': mock_rules,
            'dataset': mock_dataset_representation.return_value
        }
        
        response = self.client.get(f'/clever-miner/fourftminer/{self.four_ft_result.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Result')
        self.assertIn('rules', response.data)
        self.assertEqual(len(response.data['rules']), 2)
        # Verify that rule_text was added to each rule
        for rule in response.data['rules']:
            self.assertIn('rule_text', rule)
            self.assertTrue(rule['rule_text'].startswith('Rule text for rule'))
        # Verify that dataset was included
        self.assertIn('dataset', response.data)
    
    @patch('clever_miner_api.utils.clm_init.clm_init')
    @patch('django.shortcuts.get_object_or_404')
    def test_delete_fourft_result(self, mock_get_object_or_404, mock_clm_init, mock_cleverminer):
        """Test deleting a FourFt mining result"""
        # Mock the clm_init function
        mock_clm = MagicMock()
        mock_clm.result = {
            'rules': [
                {'rule_id': 1, 'params': {'base': 10, 'conf': 0.8}},
                {'rule_id': 2, 'params': {'base': 15, 'conf': 0.9}}
            ]
        }
        mock_clm.get_ruletext.return_value = "Test rule text"
        mock_clm_init.return_value = mock_clm
        
        # Mock the cleverminer function
        mock_cleverminer_instance = MagicMock()
        mock_cleverminer_instance.result = mock_clm.result
        mock_cleverminer.return_value = mock_cleverminer_instance
        
        # Mock get_object_or_404
        mock_get_object_or_404.return_value = self.four_ft_result
        
        response = self.client.delete(f'/clever-miner/fourftminer/{self.four_ft_result.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FourFtResult.objects.filter(id=self.four_ft_result.id).exists())
        
    def test_unauthorized_access(self, mock_cleverminer):
        """Test unauthorized access to FourFt endpoints"""
        # Create another user
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        
        # Switch to the other user
        self.client.force_authenticate(user=other_user)
        
        # Try to access the result
        response = self.client.get(f'/clever-miner/fourftminer/{self.four_ft_result.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], "You do not have permission to access this result")
# CleverMiner API Tests

This directory contains the test suite for the CleverMiner API. The tests are organized by functionality and use Django's testing framework.

## Test Organization

Tests are organized into files based on the components they test:

- `test_dataset_api.py`: Integration tests for Dataset collection API (GET, POST)
- `test_dataset_detail_api.py`: Integration tests for Dataset detail API (GET, DELETE)
- `test_clm_init.py`: Unit tests for the CLM initialization utility
- `test_settings.py`: Custom Django settings for testing

## Running Tests

To run all tests:

```bash
python manage.py test clever_miner_api.tests --settings=clever_miner_api.tests.test_settings
```

To run a specific test file:

```bash
python manage.py test clever_miner_api.tests.test_dataset_api --settings=clever_miner_api.tests.test_settings
```

To run a specific test method:

```bash
python manage.py test clever_miner_api.tests.test_dataset_api.DatasetAPITest.test_create_dataset --settings=clever_miner_api.tests.test_settings
```

## Test Environment

The tests use:
- An SQLite in-memory database for fast testing and isolation
- Django's test client for simulating HTTP requests
- Mock objects to replace external services and file operations
- Custom settings (in `test_settings.py`) to configure the test environment

## Test Descriptions

### Dataset API Tests (`test_dataset_api.py`)

| Test Method | Description |
|-------------|-------------|
| `test_list_datasets_unauthorized` | Verifies unauthorized access to datasets list is properly rejected |
| `test_list_datasets_empty` | Tests listing datasets when user has no datasets |
| `test_list_datasets` | Tests listing datasets for a user with existing datasets |
| `test_list_datasets_with_name_filter` | Tests filtering datasets by name |
| `test_list_datasets_with_ordering` | Tests ordering datasets by creation date |
| `test_create_dataset_unauthorized` | Verifies unauthorized dataset creation is rejected |
| `test_create_dataset` | Tests successful dataset creation with valid data |
| `test_create_dataset_with_various_files` | Tests dataset creation with different file formats and delimiters |
| `test_create_dataset_with_invalid_data` | Tests validation errors on invalid dataset creation requests |
| `test_datasets_are_user_separated` | Verifies datasets are properly isolated between different users |

### Dataset Detail API Tests (`test_dataset_detail_api.py`)

| Test Method | Description |
|-------------|-------------|
| `test_get_dataset_unauthorized` | Verifies unauthorized access to a dataset is rejected |
| `test_get_dataset_not_found` | Tests 404 response for non-existent dataset |
| `test_get_dataset_not_owned` | Tests permission denied for accessing another user's dataset |
| `test_get_dataset` | Tests successful retrieval of a user's dataset |
| `test_delete_dataset_unauthorized` | Verifies unauthorized dataset deletion is rejected |
| `test_delete_dataset_not_found` | Tests 404 response when deleting a non-existent dataset |
| `test_delete_dataset_not_owned` | Tests permission denied when deleting another user's dataset |
| `test_delete_dataset` | Tests successful dataset deletion |
| `test_delete_dataset_with_results` | Tests deletion of a dataset with associated mining results |

### CLM Initialization Tests (`test_clm_init.py`)

| Test Method | Description |
|-------------|-------------|
| `test_clm_init` | Tests the initialization of the CLM object with a storage file |
| `test_clm_init_with_exception` | Tests error handling during CLM initialization |

## Mocking Strategy

The tests use Django's `patch` decorator to mock external dependencies:

- File operations are mocked to avoid actual file I/O
- Storage operations are mocked to avoid actual AWS S3 or other storage interactions
- Pandas and CLM operations are mocked to speed up tests and avoid dependencies

Example from `test_clm_init.py`:
```python
@patch('clever_miner_api.utils.clm_init.download_file')
@patch('clever_miner_api.utils.clm_init.os.remove')
def test_clm_init(self, mock_remove, mock_download):
    # Test implementation with mocked dependencies
```

## Test Data

Test data is created dynamically during test setup using Django's `TestCase` framework. Each test class has a `setUp` method that:

1. Creates test users
2. Creates test datasets when needed
3. Prepares request data for POST/PUT operations

## Clean-up Procedures

Tests automatically clean up data after execution through:

1. Django's transaction rollback after each test method
2. Explicit cleanup in `tearDown` methods when needed for non-database resources 
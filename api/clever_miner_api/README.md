# CleverMiner API

This directory contains the Django REST API for the CleverMiner application, providing data mining capabilities through a modern web interface.

## Testing Strategy

The CleverMiner API implements a comprehensive testing strategy to ensure reliability, security, and functionality:

### Test Types

- **Integration Tests**: Verify that API endpoints work correctly, including authentication, validation, and data processing
- **Unit Tests**: Test individual utility functions and services in isolation
- **Security Tests**: Verify authorization and authentication requirements

### Testing Directories

- `tests/`: Contains all test files and test utilities
  - See the README.md in the tests directory for detailed information about specific tests

### Test Isolation

Tests are designed to run in isolation using:
- In-memory SQLite database for speed and isolation
- Django's test client for HTTP API testing
- Mocked external dependencies to prevent side effects
- Custom test settings to override production configurations

### Running Tests

To run all tests:

```bash
python manage.py test clever_miner_api.tests --settings=clever_miner_api.tests.test_settings
```

To run a specific test file:

```bash
python manage.py test clever_miner_api.tests.test_dataset_api --settings=clever_miner_api.tests.test_settings
```

### Testing Principles

1. **Comprehensive Coverage**: Tests should cover all API endpoints and utility functions
2. **Data Isolation**: Tests should clean up after themselves and not depend on external state
3. **Authentication Testing**: All endpoints should be tested with both authenticated and unauthenticated requests
4. **Edge Cases**: Tests should cover edge cases such as invalid inputs, missing data, and error conditions
5. **Mocking External Systems**: External dependencies like storage systems should be mocked

## API Components

- `models/`: Django ORM models 
- `views/`: API endpoint handlers
- `serializers/`: Data validation and transformation
- `services/`: Business logic separated from views
- `utils/`: Utility functions and helpers
- `tests/`: Test suite 
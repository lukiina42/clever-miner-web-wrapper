# Test settings for clever_miner_api

import os
from django.test.runner import DiscoverRunner

# Use the default settings
from api.settings import *

# Use in-memory SQLite database for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable S3 storage for testing
USE_S3_STORAGE = False

# Set media root for testing
MEDIA_ROOT = os.path.join(BASE_DIR, 'media_test')

# Create a test runner that uses these settings
class NoLoggingTestRunner(DiscoverRunner):
    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        # Turn off logging
        import logging
        logging.disable(logging.CRITICAL) 
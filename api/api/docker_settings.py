"""
Docker-specific Django settings for the project.
This file is used when running the application in Docker.
"""

import os
from .settings import *

# Database settings for Docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DATABASE_NAME', 'postgres'),
        'USER': os.environ.get('DATABASE_USER', 'apiserver'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', '2412'),
        'HOST': os.environ.get('DATABASE_HOST', 'db'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
    }
}

# CORS settings for Docker
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    os.environ.get('FRONTEND_URL', 'http://localhost:3000'),
]

# Update FRONTEND_URL to reflect Docker setup
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# Set up static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Debug mode
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# Set Allowed Hosts
ALLOWED_HOSTS = ['*']  # In production, you should limit this

# Make sure the OAuth settings are loaded from environment variables
GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', GOOGLE_OAUTH_CLIENT_ID)
GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', GOOGLE_OAUTH_CLIENT_SECRET)
GOOGLE_OAUTH_CALLBACK_URL = os.environ.get('GOOGLE_OAUTH_CALLBACK_URL', GOOGLE_OAUTH_CALLBACK_URL)

# Update socialaccount provider settings
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APPS": [
            {
                "client_id": GOOGLE_OAUTH_CLIENT_ID,
                "secret": GOOGLE_OAUTH_CLIENT_SECRET,
                "key": "",
            },
        ],
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {
            "access_type": "online",
        },
    }
}

# Media files settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media') 
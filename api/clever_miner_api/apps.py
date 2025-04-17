import os
# Set matplotlib backend to non-interactive Agg to avoid threading issues
import matplotlib
matplotlib.use('Agg')

from django.apps import AppConfig


class CleverMinerApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'clever_miner_api'

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from .views.dataset import DatasetApiView, DatasetDetailView
from .views.fourft import FourFtMinerView, FourFtResultDetailView, FourFtResultRuleDetailView
from .views.health import HealthCheckView

urlpatterns = [
    path('dataset', DatasetApiView.as_view()),
    path('dataset/<int:id>/', DatasetDetailView.as_view()),
    path('fourftminer', FourFtMinerView.as_view()),
    path('fourftminer/<int:id>/', FourFtResultDetailView.as_view()),
    path('fourftminer/<int:four_ft_id>/rules/<int:rule_id>', FourFtResultRuleDetailView.as_view()),
    
    # Health check endpoint
    path('health/', HealthCheckView.as_view(), name='health_check'),
]

# Serve media files in development
if not settings.USE_S3_STORAGE and settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
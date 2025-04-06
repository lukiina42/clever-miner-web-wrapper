from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from .views.dataset import DatasetApiView, DatasetDetailView
from .views.fourft import FourFtMinerView, FourFtResultDetailView, FourFtResultRuleDetailView
from .views.auth import GoogleLoginView, GoogleCallbackView
from .views.health import HealthCheckView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('dataset', DatasetApiView.as_view()),
    path('dataset/<int:id>/', DatasetDetailView.as_view()),
    path('fourftminer', FourFtMinerView.as_view()),
    path('fourftminer/<int:id>/', FourFtResultDetailView.as_view()),
    path('fourftminer/<int:four_ft_id>/rules/<int:rule_id>', FourFtResultRuleDetailView.as_view()),
    
    # OAuth URLs
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google_callback'),
    
    # JWT Token URLs
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Health check endpoint
    path('health/', HealthCheckView.as_view(), name='health_check'),
]

# Serve media files in development
if not settings.USE_S3_STORAGE and settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.urls import path, include

from .views.dataset import DatasetApiView
from .views.fourft import FourFtMinerView, FourFtResultDetailView, FourFtResultRuleDetailView
from .views.auth import GoogleLoginView, GoogleCallbackView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('dataset', DatasetApiView.as_view()),
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
]
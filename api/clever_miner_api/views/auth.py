from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.urls import reverse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import requests
from rest_framework_simplejwt.tokens import RefreshToken
import logging
import json

logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleLoginView(APIView):
    """
    Endpoint for Google OAuth authentication
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'No authorization code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Exchange the authorization code for tokens
        token_url = 'https://oauth2.googleapis.com/token'
        redirect_uri = settings.GOOGLE_OAUTH_CALLBACK_URL
        client_id = settings.GOOGLE_OAUTH_CLIENT_ID
        client_secret = settings.GOOGLE_OAUTH_CLIENT_SECRET
        
        # Log the data we're sending to Google
        logger.info(f"Exchanging code for token with redirect_uri: {redirect_uri}")
        
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        # Get tokens from Google
        try:
            token_response = requests.post(token_url, data=data)
            
            if not token_response.ok:
                error_data = token_response.json() if token_response.headers.get('content-type', '').startswith('application/json') else {'error': 'unknown_error'}
                logger.error(f"Error from Google: {error_data}")
                return Response(error_data, status=token_response.status_code)
                
            token_response.raise_for_status()  # Raise exception for 4XX/5XX responses
            tokens = token_response.json()
        except requests.exceptions.RequestException as e:
            error_detail = {}
            try:
                if hasattr(e, 'response') and e.response is not None:
                    error_detail = e.response.json()
            except:
                pass
                
            logger.error(f"Error exchanging code: {str(e)}, Response: {error_detail}")
            
            return Response({
                'error': error_detail.get('error', 'token_exchange_error'),
                'error_description': error_detail.get('error_description', str(e))
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Get user info from Google
        try:
            user_info_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {tokens["access_token"]}'}
            )
            user_info_response.raise_for_status()
            user_info = user_info_response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting user info: {str(e)}")
            return Response(
                {'error': 'Failed to get user info', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create or get user
        try:
            email = user_info['email']
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': user_info.get('given_name', ''),
                    'last_name': user_info.get('family_name', ''),
                }
            )
            
            # Create social account if it doesn't exist
            from allauth.socialaccount.models import SocialAccount
            if not SocialAccount.objects.filter(user=user, provider='google').exists():
                SocialAccount.objects.create(
                    user=user,
                    provider='google',
                    uid=user_info['sub'],
                    extra_data=user_info
                )
                
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response(
                {'error': 'Failed to create or authenticate user', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GoogleCallbackView(APIView):
    """
    Callback endpoint for Google OAuth
    """
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        code = request.GET.get('code')
        if not code:
            return Response(
                {'error': 'No authorization code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Redirect to frontend with the code
        # The frontend will then send the code to the backend for token exchange
        frontend_url = settings.FRONTEND_URL
        return HttpResponseRedirect(
            f"{frontend_url}/oauth-callback?code={code}"
        ) 
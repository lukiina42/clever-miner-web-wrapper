from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserDetailsSerializer(serializers.ModelSerializer):
    """
    User model serializer for authentication responses
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')
        read_only_fields = ('email',) 
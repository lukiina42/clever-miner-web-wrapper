from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from rest_framework.permissions import AllowAny


class HealthCheckView(APIView):
    """
    Health check endpoint for the API.
    This endpoint provides a simple way to check if the API is running and can connect to the database.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Check the health of the API.
        Returns a 200 OK response if the API is healthy, or a 500 Internal Server Error if not.
        """
        # Check the database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = cursor.fetchone()[0] == 1
        except Exception as e:
            db_status = False
            error_message = str(e)
            return Response(
                {"status": "error", "database": "unhealthy", "error": error_message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # If everything is OK, return a success response
        return Response(
            {"status": "healthy", "database": "connected"},
            status=status.HTTP_200_OK
        ) 
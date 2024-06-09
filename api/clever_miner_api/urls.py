from django.urls import path
from .views import (DatasetApiView)

urlpatterns = [
    path('dataset', DatasetApiView.as_view()),
]
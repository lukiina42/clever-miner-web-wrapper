from django.urls import path
from .views import (DatasetApiView, FourFtMinerView)

urlpatterns = [
    path('dataset', DatasetApiView.as_view()),
    path('fourftminer', FourFtMinerView.as_view())
]
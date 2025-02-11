from django.urls import path

from .views.dataset import DatasetApiView
from .views.fourft import FourFtMinerView, FourFtResultDetailView, FourFtResultRuleDetailView

urlpatterns = [
    path('dataset', DatasetApiView.as_view()),
    path('fourftminer', FourFtMinerView.as_view()),
    path('fourftminer/<int:id>/', FourFtResultDetailView.as_view()),
    path('fourftminer/<int:four_ft_id>/rules/<int:rule_id>', FourFtResultRuleDetailView.as_view()),
]
from django.urls import path
from .views import SavingListCreateView, SavingDetailView

urlpatterns = [
    path('', SavingListCreateView.as_view(), name='saving-list-create'),
    path('<int:pk>/', SavingDetailView.as_view(), name='saving-detail'),
]

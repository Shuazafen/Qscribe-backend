from django.urls import path
from .views import PetListView, PetDetailView

urlpatterns = [
    path('', PetListView.as_view(), name='pet-list'),
    path('<int:pk>/', PetDetailView.as_view(), name='pet-detail'),
]

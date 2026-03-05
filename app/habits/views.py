from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from app.users.permissions import IsTier1, IsOwner
from .models import Habit
from .serializers import HabitSerializer


class HabitListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/habits/  — List user's habits (Tier 1+)
    POST /api/habits/  — Create a habit (Tier 1+)
    """
    serializer_class = HabitSerializer
    permission_classes = [IsTier1]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HabitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/habits/<pk>/  — Retrieve a habit (Tier 1+, owner only)
    PUT    /api/habits/<pk>/  — Update a habit (Tier 1+, owner only)
    DELETE /api/habits/<pk>/  — Delete a habit (Tier 1+, owner only)
    """
    serializer_class = HabitSerializer
    permission_classes = [IsTier1, IsOwner]

    def get_queryset(self):
        # Scoped to the requesting user so others get 404, not 403
        return Habit.objects.filter(user=self.request.user)

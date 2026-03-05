from rest_framework import generics
from app.users.permissions import IsTier1, IsOwner
from .models import Saving
from .serializers import SavingSerializer


class SavingListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/savings/  — List user's savings goals (Tier 1+)
    POST /api/savings/  — Create a savings goal (Tier 1+)
    """
    serializer_class = SavingSerializer
    permission_classes = [IsTier1]

    def get_queryset(self):
        return Saving.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class SavingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/savings/<pk>/  — Retrieve a saving (Tier 1+, owner only)
    PUT    /api/savings/<pk>/  — Update a saving (Tier 1+, owner only)
    DELETE /api/savings/<pk>/  — Delete a saving (Tier 1+, owner only)
    """
    serializer_class = SavingSerializer
    permission_classes = [IsTier1, IsOwner]

    def get_queryset(self):
        return Saving.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

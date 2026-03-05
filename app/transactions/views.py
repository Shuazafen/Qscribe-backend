from rest_framework import generics
from app.users.permissions import IsTier2, IsOwner
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/transactions/  — List user's transactions (Tier 2+)
    POST /api/transactions/  — Create a transaction (Tier 2+)
                               Tier 2: capped at ₦300,000 per deposit
                               Tier 3: limitless
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsTier2]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class TransactionDetailView(generics.RetrieveAPIView):
    """
    GET /api/transactions/<pk>/  — Retrieve a transaction (Tier 2+, owner only)
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsTier2, IsOwner]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

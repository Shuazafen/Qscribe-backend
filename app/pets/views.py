from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from app.users.permissions import IsTier1
from .models import Pet
from .serializers import PetSerializer


class PetListView(generics.ListAPIView):
    """
    GET /api/pets/
    - Tier 1 & 2: Returns only common pets (is_rare=False)
    - Tier 3: Returns ALL pets including rare ones
    """
    serializer_class = PetSerializer
    permission_classes = [IsTier1]

    def get_queryset(self):
        user = self.request.user
        if user.tier >= 3:
            return Pet.objects.all()
        return Pet.objects.filter(is_rare=False)


class PetDetailView(generics.RetrieveAPIView):
    """
    GET /api/pets/<pk>/
    - Tier 1 & 2: Can only access common pets. Returns 403 for rare pets.
    - Tier 3: Can access all pets.
    """
    serializer_class = PetSerializer
    permission_classes = [IsTier1]
    queryset = Pet.objects.all()

    def get_object(self):
        obj = super().get_object()
        if obj.is_rare and self.request.user.tier < 3:
            raise PermissionDenied(
                "This is a rare pet exclusive to Tier 3 members. Upgrade to Tier 3 to unlock rare pets."
            )
        return obj

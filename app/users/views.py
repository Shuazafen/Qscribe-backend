from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from app.users.permissions import IsTier1, IsTier2
from .models import User
from .serializer import UserSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/user/profile/  — View authenticated user's profile
    PATCH /api/user/profile/  — Update profile fields
    """
    serializer_class = UserSerializer
    permission_classes = [IsTier1]

    def get_object(self):
        return self.request.user


class UpgradeToTier2View(APIView):
    """
    POST /api/user/upgrade/tier2/
    Tier 1 user submits NIN + facial recognition image to upgrade to Tier 2.
    """
    permission_classes = [IsTier1]

    def post(self, request):
        user = request.user

        if user.tier >= 2:
            return Response(
                {"detail": "You are already Tier 2 or above."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nin = request.data.get('nin')
        facial_image = request.FILES.get('facial_recognition_image')

        errors = {}
        if not nin:
            errors['nin'] = "NIN is required to upgrade to Tier 2."
        if not facial_image:
            errors['facial_recognition_image'] = "A facial recognition image is required to upgrade to Tier 2."

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user.nin = nin
        user.facial_recognition_image = facial_image
        user.tier = 2
        user.save()

        return Response(
            {
                "detail": "Congratulations! You have been upgraded to Tier 2.",
                "tier": user.tier,
            },
            status=status.HTTP_200_OK,
        )


class UpgradeToTier3View(APIView):
    """
    POST /api/user/upgrade/tier3/
    Tier 2 user submits BVN + address to upgrade to Tier 3.
    Tier 3 unlocks: limitless deposits, rare pets, 3% savings interest rate.
    """
    permission_classes = [IsTier2]

    def post(self, request):
        user = request.user

        if user.tier >= 3:
            return Response(
                {"detail": "You are already Tier 3."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bvn = request.data.get('bvn')
        address = request.data.get('address')

        errors = {}
        if not bvn:
            errors['bvn'] = "BVN is required to upgrade to Tier 3."
        if not address:
            errors['address'] = "Address is required to upgrade to Tier 3."

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user.bvn = bvn
        user.address = address
        user.tier = 3
        user.save()

        return Response(
            {
                "detail": (
                    "Congratulations! You have been upgraded to Tier 3. "
                    "You now have limitless deposits, access to rare pets, "
                    "and a 3% monthly interest rate on your savings."
                ),
                "tier": user.tier,
            },
            status=status.HTTP_200_OK,
        )

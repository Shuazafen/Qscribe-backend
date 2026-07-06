import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from app.users.permissions import IsTier1, IsTier2
from .models import User
from .serializer import UserSerializer, UserRegistrationSerializer, LoginSerializer
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger('app.users.views')

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [] # Allow anyone to register


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
        logger.info(
            "[UpgradeTier2] Request received | user=%s (id=%s) current_tier=%s",
            user.username, user.pk, user.tier,
        )

        if user.tier >= 2:
            logger.warning(
                "[UpgradeTier2] Rejected — already Tier 2+ | user=%s (id=%s) tier=%s",
                user.username, user.pk, user.tier,
            )
            return Response(
                {"detail": "You are already Tier 2 or above."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nin = request.data.get('nin')
        facial_image = request.FILES.get('facial_recognition_image')

        logger.debug(
            "[UpgradeTier2] Fields received | user=%s (id=%s) nin_provided=%s facial_image_provided=%s",
            user.username, user.pk, bool(nin), bool(facial_image),
        )

        errors = {}
        if not nin:
            errors['nin'] = "NIN is required to upgrade to Tier 2."
        if not facial_image:
            errors['facial_recognition_image'] = "A facial recognition image is required to upgrade to Tier 2."

        if errors:
            logger.warning(
                "[UpgradeTier2] Validation failed | user=%s (id=%s) missing_fields=%s",
                user.username, user.pk, list(errors.keys()),
            )
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user.nin = nin
        user.facial_recognition_image = facial_image
        user.tier = 2
        user.save()

        logger.info(
            "[UpgradeTier2] Success — upgraded to Tier 2 | user=%s (id=%s) nin=%s",
            user.username, user.pk, nin,
        )
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
        logger.info(
            "[UpgradeTier3] Request received | user=%s (id=%s) current_tier=%s",
            user.username, user.pk, user.tier,
        )

        if user.tier >= 3:
            logger.warning(
                "[UpgradeTier3] Rejected — already Tier 3 | user=%s (id=%s)",
                user.username, user.pk,
            )
            return Response(
                {"detail": "You are already Tier 3."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bvn = request.data.get('bvn')
        address = request.data.get('address')

        logger.debug(
            "[UpgradeTier3] Fields received | user=%s (id=%s) bvn_provided=%s address_provided=%s",
            user.username, user.pk, bool(bvn), bool(address),
        )

        errors = {}
        if not bvn:
            errors['bvn'] = "BVN is required to upgrade to Tier 3."
        if not address:
            errors['address'] = "Address is required to upgrade to Tier 3."

        if errors:
            logger.warning(
                "[UpgradeTier3] Validation failed | user=%s (id=%s) missing_fields=%s",
                user.username, user.pk, list(errors.keys()),
            )
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user.bvn = bvn
        user.address = address
        user.tier = 3
        user.save()

        logger.info(
            "[UpgradeTier3] Success — upgraded to Tier 3 | user=%s (id=%s)",
            user.username, user.pk,
        )
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


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

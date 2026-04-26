from django.urls import path
from .views import (
    UserProfileView,
    UpgradeToTier2View,
    UpgradeToTier3View,
    RegisterView,
    TokenObtainPairView,
    TokenRefreshView,
    LoginView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('upgrade/tier2/', UpgradeToTier2View.as_view(), name='upgrade-tier2'),
    path('upgrade/tier3/', UpgradeToTier3View.as_view(), name='upgrade-tier3'),
    path('login/', LoginView.as_view(), name='user-Login')
]

from django.urls import path
from .views import UserProfileView, UpgradeToTier2View, UpgradeToTier3View

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('upgrade/tier2/', UpgradeToTier2View.as_view(), name='upgrade-tier2'),
    path('upgrade/tier3/', UpgradeToTier3View.as_view(), name='upgrade-tier3'),
]

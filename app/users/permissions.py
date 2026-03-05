from rest_framework.permissions import BasePermission


class IsTier1(BasePermission):
    """Allow access to authenticated users with any tier (tier >= 1)."""
    message = "You must be a registered (Tier 1) user to access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.tier >= 1
        )


class IsTier2(BasePermission):
    """Allow access only to Tier 2 and above users."""
    message = "You must upgrade to Tier 2 to access this resource. Please provide your NIN and facial image."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.tier >= 2
        )


class IsTier3(BasePermission):
    """Allow access only to Tier 3 users."""
    message = "You must upgrade to Tier 3 to access this resource. Please provide your BVN and address."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.tier >= 3
        )


class IsOwner(BasePermission):
    """Allow access only to the owner of the object."""
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

from decimal import Decimal
from django.conf import settings
from .models import Saving

def calculate_auto_save_amount(user):
    """Calculate suggested saving target based on user's monthly income.
    Uses user's auto_save_percentage if set, otherwise DEFAULT_AUTO_SAVE_PERCENTAGE.
    Returns Decimal rounded to 2 places.
    """
    if not getattr(user, 'monthly_income', None):
        return None
    percentage = getattr(user, 'auto_save_percentage', None)
    if not percentage:
        percentage = getattr(settings, 'DEFAULT_AUTO_SAVE_PERCENTAGE', 10.0)
    amount = (user.monthly_income * Decimal(str(percentage)) / Decimal('100')).quantize(Decimal('0.01'))
    return amount

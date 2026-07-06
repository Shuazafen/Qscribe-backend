from decimal import Decimal
import logging
from django.conf import settings
from .models import Saving

logger = logging.getLogger('app.savings.services')


def calculate_auto_save_amount(user):
    """Calculate suggested saving target based on user's monthly income.
    Uses user's auto_save_percentage if set, otherwise DEFAULT_AUTO_SAVE_PERCENTAGE.
    Returns Decimal rounded to 2 places.
    """
    logger.debug(
        "[AutoSave] Calculating auto-save amount | user=%s (id=%s) tier=%s "
        "monthly_income=%s auto_save_percentage=%s",
        user.username, user.pk, user.tier,
        getattr(user, 'monthly_income', None),
        getattr(user, 'auto_save_percentage', None),
    )

    if not getattr(user, 'monthly_income', None):
        logger.info(
            "[AutoSave] Skipped — no monthly_income set | user=%s (id=%s)",
            user.username, user.pk,
        )
        return None

    percentage = getattr(user, 'auto_save_percentage', None)
    source = "user-defined"
    if not percentage:
        percentage = getattr(settings, 'DEFAULT_AUTO_SAVE_PERCENTAGE', 10.0)
        source = "default (settings.DEFAULT_AUTO_SAVE_PERCENTAGE)"

    amount = (
        user.monthly_income * Decimal(str(percentage)) / Decimal('100')
    ).quantize(Decimal('0.01'))

    logger.info(
        "[AutoSave] Calculated | user=%s (id=%s) income=%s percentage=%s%% "
        "(%s) → amount=%s",
        user.username, user.pk, user.monthly_income, percentage, source, amount,
    )
    return amount

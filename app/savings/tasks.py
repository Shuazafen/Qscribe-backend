from celery import shared_task
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


@shared_task
def apply_tier3_interest():
    """
    Celery periodic task: applies monthly interest to current_amount
    for all Tier 3 users' active (incomplete) saving goals.
    Runs monthly (configure in CELERY_BEAT_SCHEDULE in settings).
    """
    interest_rate = Decimal(str(getattr(settings, 'TIER3_SAVING_INTEREST_RATE', 3.0))) / Decimal('100')
    tier3_users = User.objects.filter(tier=3)

    updated_count = 0
    for user in tier3_users:
        savings = user.savings.filter(current_amount__lt=models.F('target_amount'))
        for saving in savings:
            interest = (saving.current_amount * interest_rate).quantize(Decimal('0.01'))
            saving.current_amount = min(saving.current_amount + interest, saving.target_amount)
            saving.save(update_fields=['current_amount'])
            updated_count += 1

    return f"Interest applied to {updated_count} saving goal(s) for Tier 3 users."

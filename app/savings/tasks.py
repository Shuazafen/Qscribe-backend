from celery import shared_task
from decimal import Decimal
import logging
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger('app.savings.tasks')


@shared_task
def apply_tier3_interest():
    """
    Celery periodic task: applies monthly interest to current_amount
    for all Tier 3 users' active (incomplete) saving goals.
    Runs monthly (configure in CELERY_BEAT_SCHEDULE in settings).
    """
    interest_rate_pct = getattr(settings, 'TIER3_SAVING_INTEREST_RATE', 3.0)
    interest_rate = Decimal(str(interest_rate_pct)) / Decimal('100')
    tier3_users = User.objects.filter(tier=3)
    user_count = tier3_users.count()

    logger.info(
        "[Task:apply_tier3_interest] Starting | rate=%s%% | tier3_users=%s",
        interest_rate_pct, user_count,
    )

    updated_count = 0
    skipped_count = 0

    for user in tier3_users:
        savings = user.savings.filter(current_amount__lt=models.F('target_amount'))
        saving_count = savings.count()

        logger.debug(
            "[Task] Processing user=%s (id=%s) | active_savings=%s",
            user.username, user.pk, saving_count,
        )

        for saving in savings:
            old_amount = saving.current_amount
            interest = (saving.current_amount * interest_rate).quantize(Decimal('0.01'))
            new_amount = min(saving.current_amount + interest, saving.target_amount)
            capped = new_amount == saving.target_amount and interest > (saving.target_amount - old_amount)

            saving.current_amount = new_amount
            saving.save(update_fields=['current_amount'])
            updated_count += 1

            logger.info(
                "[Task] Interest applied | saving_id=%s goal=%r user=%s (id=%s) "
                "before=%s interest=%s after=%s target=%s%s",
                saving.pk, saving.goal_name, user.username, user.pk,
                old_amount, interest, new_amount, saving.target_amount,
                " [CAPPED at target]" if capped else "",
            )

        if saving_count == 0:
            skipped_count += 1
            logger.debug(
                "[Task] No active savings to update | user=%s (id=%s)",
                user.username, user.pk,
            )

    logger.info(
        "[Task:apply_tier3_interest] Finished | updated=%s savings across %s users "
        "(%s users had no active savings)",
        updated_count, user_count - skipped_count, skipped_count,
    )
    return f"Interest applied to {updated_count} saving goal(s) for Tier 3 users."

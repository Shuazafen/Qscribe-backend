from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from app.webhooks.models import Webhook
from app.webhooks.tasks import send_webhook_task
from core.core.tasks import send_welcome_email
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        # Send welcome email via Brevo template ID 1
        try:
            send_welcome_email.delay(
                user_email=instance.email,
                username=instance.username,
                first_name=instance.first_name or None,
            )
            logger.info(f"Welcome email queued for new user: {instance.username}")
        except Exception as e:
            # Non-blocking: log the error but don't fail registration
            logger.error(f"Failed to queue welcome email for {instance.username}: {e}")
    else:
        # Check if tier changed (Simplified: we'd usually use __init__ tracker but for now we'll assume a tier event is explicit)
        # For simplicity, we trigger if tier > 1 and it's an update (or we could track previous value)
        pass

# Note: Tier upgrade logic often happens in a View or Service.
# For this "algorithm", let's assume we trigger a webhook when tier is explicitly set in a way that suggests upgrade.

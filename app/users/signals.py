from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from app.webhooks.models import Webhook
from app.webhooks.tasks import send_webhook_task

@receiver(post_save, sender=User)
def user_tier_post_save(sender, instance, created, **kwargs):
    if not created:
        # Check if tier changed (Simplified: we'd usually use __init__ tracker but for now we'll assume a tier event is explicit)
        # For simplicity, we trigger if tier > 1 and it's an update (or we could track previous value)
        pass

# Note: Tier upgrade logic often happens in a View or Service. 
# For this "algorithm", let's assume we trigger a webhook when tier is explicitly set in a way that suggests upgrade.

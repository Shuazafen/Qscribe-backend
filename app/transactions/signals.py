from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Transaction
from app.notifications.models import Notification
from app.webhooks.models import Webhook
from app.webhooks.tasks import send_webhook_task

@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, **kwargs):
    if created:
        # 1. Create Notification
        Notification.objects.create(
            user=instance.user,
            title="New Transaction",
            message=f"A {instance.transaction_type} of {instance.amount} has been recorded."
        )

        # 2. Trigger Webhooks
        webhooks = Webhook.objects.filter(event_type='transaction.created', is_active=True)
        payload = {
            'event': 'transaction.created',
            'user': instance.user.username,
            'amount': str(instance.amount),
            'type': instance.transaction_type,
            'description': instance.description,
            'timestamp': str(instance.created_at)
        }
        for webhook in webhooks:
            send_webhook_task.delay(webhook.id, payload)

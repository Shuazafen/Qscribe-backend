from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Habit
from app.webhooks.models import Webhook
from app.webhooks.tasks import send_webhook_task

@receiver(post_save, sender=Habit)
def habit_post_save(sender, instance, created, **kwargs):
    if instance.is_completed:
        # Trigger Webhooks
        webhooks = Webhook.objects.filter(event_type='habit.completed', is_active=True)
        payload = {
            'event': 'habit.completed',
            'user': instance.user.username,
            'habit_name': instance.name,
            'timestamp': str(instance.updated_at)
        }
        for webhook in webhooks:
            send_webhook_task.delay(webhook.id, payload)

from django.db import models
import uuid

class Webhook(models.Model):
    EVENT_CHOICES = [
        ('transaction.created', 'Transaction Created'),
        ('habit.completed', 'Habit Completed'),
        ('tier.upgraded', 'Tier Upgraded'),
    ]

    target_url = models.URLField()
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    secret_key = models.CharField(max_length=100, default=uuid.uuid4)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} -> {self.target_url}"

from django.db import models
from django.conf import settings

class Saving(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='savings')
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    goal_name = models.CharField(max_length=100)
    # Interest rate (%) — 0 for Tier 1/2, auto-set to TIER3_SAVING_INTEREST_RATE for Tier 3
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.goal_name} ({self.current_amount}/{self.target_amount})"

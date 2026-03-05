from django.db import models
from django.conf import settings


class Pet(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='pet_images', null=True, blank=True)
    is_rare = models.BooleanField(
        default=False,
        help_text="Rare pets are only visible and accessible to Tier 3 users."
    )

    def __str__(self):
        rarity = "Rare" if self.is_rare else "Common"
        return f"{self.name} ({rarity})"

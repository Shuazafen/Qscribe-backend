from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.


class User(AbstractUser):
    TIER_CHOICES = [
        (1, 'Tier 1'),
        (2, 'Tier 2'),
        (3, 'Tier 3'),
    ]

    phone_number = models.CharField(max_length=15, unique=True)
    tier = models.IntegerField(choices=TIER_CHOICES, default=1)
    university = models.CharField(max_length=100)
    id_card_image = models.ImageField(upload_to='id_card_images')
    
    # Tier 2 requirement
    nin = models.CharField(max_length=11, unique=True, null=True, blank=True)
    
    # Tier 3 requirements
    bvn = models.CharField(max_length=11, unique=True, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    facial_recognition_image = models.ImageField(upload_to='facial_recognition_images', null=True, blank=True)

    def is_tier_1_complete(self):
        return all([self.phone_number, self.university, self.id_card_image])

    def is_tier_2_complete(self):
        return self.is_tier_1_complete() and all([self.nin, self.facial_recognition_image])

    def is_tier_3_complete(self):
        return self.is_tier_2_complete() and all([self.bvn, self.address])

    def __str__(self):
        return f"{self.username} - Tier {self.tier}"

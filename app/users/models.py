from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.


class User(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True)
    bvn = models.CharField(max_length=11, unique=True)
    nin = models.CharField(max_length=11, unique=True)
    university = models.CharField(max_length=100)
    facial_recognition_image = models.ImageField(upload_to='facial_recognition_images')
    id_card_image = models.ImageField(upload_to='id_card_images')

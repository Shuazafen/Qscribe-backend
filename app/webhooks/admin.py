from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Webhook

@admin.register(Webhook)
class WebhookAdmin(ModelAdmin):
    list_display = ("event_type", "target_url", "is_active", "created_at")
    list_filter = ("event_type", "is_active", "created_at")
    search_fields = ("target_url",)

from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Saving

@admin.register(Saving)
class SavingAdmin(ModelAdmin):
    list_display = ("user", "goal_name", "current_amount", "target_amount", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "goal_name")

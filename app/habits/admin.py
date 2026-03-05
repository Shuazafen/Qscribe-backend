from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Habit

@admin.register(Habit)
class HabitAdmin(ModelAdmin):
    list_display = ("user", "name", "is_completed", "updated_at")
    list_filter = ("is_completed", "updated_at")
    search_fields = ("user__username", "name")

from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Pet


@admin.register(Pet)
class PetAdmin(ModelAdmin):
    list_display = ('name', 'is_rare')
    list_filter = ('is_rare',)
    search_fields = ('name',)

from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import User
# Register your models here.

class UserAdmin(ModelAdmin):
    list_display = ('username', 'email', 'phone_number', 'tier', 'university', 'is_staff')
    list_filter = ('tier', 'is_staff', 'is_superuser', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')
    ordering = ('username',)

admin.site.register(User, UserAdmin)

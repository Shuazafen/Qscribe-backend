from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(ModelAdmin):
    list_display = ("user", "transaction_type", "amount", "created_at")
    list_filter = ("transaction_type", "created_at")
    search_fields = ("user__username", "description")

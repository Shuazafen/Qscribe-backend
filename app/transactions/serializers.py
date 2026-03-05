from decimal import Decimal
from rest_framework import serializers
from django.conf import settings
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        request = self.context.get('request')
        if not request:
            return value

        # Tier 3 users have limitless deposits
        if request.user.tier >= 3:
            return value

        # Tier 2 users are capped at TIER2_MAX_DEPOSIT_AMOUNT
        cap = Decimal(str(getattr(settings, 'TIER2_MAX_DEPOSIT_AMOUNT', 300000)))
        if value > cap:
            raise serializers.ValidationError(
                f"Tier 2 users can deposit a maximum of ₦{cap:,.0f} per transaction. "
                f"Upgrade to Tier 3 for limitless deposits."
            )
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return Transaction.objects.create(**validated_data)

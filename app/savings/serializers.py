from decimal import Decimal
from rest_framework import serializers
from django.conf import settings
from .models import Saving


class SavingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saving
        fields = ['id', 'goal_name', 'target_amount', 'current_amount', 'interest_rate', 'created_at']
        read_only_fields = ['id', 'current_amount', 'interest_rate', 'created_at']

from .services import calculate_auto_save_amount

    def create(self, validated_data):
        request = self.context.get('request')
        # Auto-assign interest rate for Tier 3 users
        if request and request.user.tier >= 3:
            validated_data['interest_rate'] = Decimal(str(getattr(settings, 'TIER3_SAVING_INTEREST_RATE', 3.0)))
        else:
            validated_data['interest_rate'] = Decimal('0.00')
        # Auto-assign target amount for Tier 2 and 3 if not provided
        if request and request.user.tier >= 2 and not validated_data.get('target_amount'):
            auto_amount = calculate_auto_save_amount(request.user)
            if auto_amount is not None:
                validated_data['target_amount'] = auto_amount
        validated_data['user'] = request.user
        return Saving.objects.create(**validated_data)

from decimal import Decimal
from rest_framework import serializers
from django.conf import settings
from .models import Saving


class SavingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Saving
        fields = ['id', 'goal_name', 'target_amount', 'current_amount', 'interest_rate', 'created_at']
        read_only_fields = ['id', 'current_amount', 'interest_rate', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        # Auto-assign interest rate for Tier 3 users
        if request and request.user.tier >= 3:
            validated_data['interest_rate'] = Decimal(str(getattr(settings, 'TIER3_SAVING_INTEREST_RATE', 3.0)))
        else:
            validated_data['interest_rate'] = Decimal('0.00')
        validated_data['user'] = request.user
        return Saving.objects.create(**validated_data)

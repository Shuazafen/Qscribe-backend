from decimal import Decimal
import logging
from rest_framework import serializers
from django.conf import settings
from .models import Saving
from .services import calculate_auto_save_amount

logger = logging.getLogger('app.savings.serializers')


class SavingSerializer(serializers.ModelSerializer):
    # Allow target_amount to be omitted so Tier 2/3 users can have it
    # auto-filled from their monthly income in create().
    target_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False
    )

    class Meta:
        model = Saving
        fields = ['id', 'goal_name', 'target_amount', 'current_amount', 'interest_rate', 'created_at']
        read_only_fields = ['id', 'current_amount', 'interest_rate', 'created_at']

    def validate(self, attrs):
        """Ensure target_amount is present when it cannot be auto-filled."""
        request = self.context.get('request')
        user = request.user if request else None
        target_amount = attrs.get('target_amount')

        logger.debug(
            "[Validate] goal_name=%r target_amount=%s | user=%s (id=%s) tier=%s",
            attrs.get('goal_name'), target_amount,
            getattr(user, 'username', '?'), getattr(user, 'pk', '?'),
            getattr(user, 'tier', '?'),
        )

        if not target_amount:
            auto_amount = calculate_auto_save_amount(user) if user else None
            can_auto_fill = request and user.tier >= 2 and auto_amount is not None

            if can_auto_fill:
                logger.info(
                    "[Validate] target_amount omitted — will auto-fill=%s | "
                    "user=%s (id=%s) tier=%s",
                    auto_amount, user.username, user.pk, user.tier,
                )
            else:
                logger.warning(
                    "[Validate] target_amount missing and cannot auto-fill | "
                    "user=%s (id=%s) tier=%s income=%s",
                    getattr(user, 'username', '?'), getattr(user, 'pk', '?'),
                    getattr(user, 'tier', '?'),
                    getattr(user, 'monthly_income', None),
                )
                raise serializers.ValidationError(
                    {'target_amount': 'This field is required.'}
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        logger.info(
            "[Create] Starting save creation | user=%s (id=%s) tier=%s "
            "goal_name=%r target_amount=%s",
            user.username, user.pk, user.tier,
            validated_data.get('goal_name'),
            validated_data.get('target_amount'),
        )

        # ── Interest rate ────────────────────────────────────────────────────
        if request and user.tier >= 3:
            rate = Decimal(str(getattr(settings, 'TIER3_SAVING_INTEREST_RATE', 3.0)))
            validated_data['interest_rate'] = rate
            logger.info(
                "[Create] Assigned Tier 3 interest rate=%s | user=%s (id=%s)",
                rate, user.username, user.pk,
            )
        else:
            validated_data['interest_rate'] = Decimal('0.00')
            logger.debug(
                "[Create] Interest rate=0.00 (tier < 3) | user=%s (id=%s) tier=%s",
                user.username, user.pk, user.tier,
            )

        # ── Auto-fill target_amount ──────────────────────────────────────────
        if request and user.tier >= 2 and not validated_data.get('target_amount'):
            auto_amount = calculate_auto_save_amount(user)
            if auto_amount is not None:
                validated_data['target_amount'] = auto_amount
                logger.info(
                    "[Create] Auto-filled target_amount=%s | user=%s (id=%s) tier=%s",
                    auto_amount, user.username, user.pk, user.tier,
                )
            else:
                logger.warning(
                    "[Create] Could not auto-fill target_amount (no income) | "
                    "user=%s (id=%s)",
                    user.username, user.pk,
                )

        validated_data['user'] = user
        saving = Saving.objects.create(**validated_data)

        logger.info(
            "[Create] Saving created successfully | saving_id=%s goal_name=%r "
            "target_amount=%s interest_rate=%s current_amount=%s | user=%s (id=%s)",
            saving.pk, saving.goal_name, saving.target_amount,
            saving.interest_rate, saving.current_amount,
            user.username, user.pk,
        )
        return saving

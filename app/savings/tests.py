"""
Tests for savings auto-save functionality:
  - calculate_auto_save_amount() service
  - SavingSerializer.create() — auto-assign interest rate and target amount
  - apply_tier3_interest Celery task
  - Savings API endpoints (list/create/detail)

Run with:
    python manage.py test app.savings.tests
"""
from decimal import Decimal
from unittest.mock import patch

from django.urls import reverse
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from app.users.models import User
from app.savings.models import Saving
from app.savings.services import calculate_auto_save_amount
from app.savings.tasks import apply_tier3_interest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_image(name="id.jpg"):
    return SimpleUploadedFile(name, b"fake-image-bytes", content_type="image/jpeg")


def make_user(username, tier=1, phone_number="08000000001",
              monthly_income=None, auto_save_percentage=None):
    user = User(
        username=username,
        email=f"{username}@test.com",
        phone_number=phone_number,
        university="University of Lagos",
        tier=tier,
        monthly_income=monthly_income,
        auto_save_percentage=auto_save_percentage,
    )
    user.set_password("Password123!")
    user.id_card_image = make_image()
    if tier >= 2:
        user.nin = "12345678901"
        user.facial_recognition_image = make_image("face.jpg")
    if tier >= 3:
        user.bvn = "22222222222"
        user.address = "1 Test Street"
    user.save()
    return user


def auth_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


# ---------------------------------------------------------------------------
# 1. Service unit tests — calculate_auto_save_amount
# ---------------------------------------------------------------------------

class CalculateAutoSaveAmountTests(TestCase):
    """Unit tests for calculate_auto_save_amount()."""

    def test_returns_none_when_no_monthly_income(self):
        user = make_user("u_no_income", phone_number="08000000010")
        result = calculate_auto_save_amount(user)
        self.assertIsNone(result)

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_uses_default_percentage_when_user_has_no_custom_percentage(self):
        user = make_user(
            "u_default_pct",
            monthly_income=Decimal("200000.00"),
            phone_number="08000000011",
        )
        result = calculate_auto_save_amount(user)
        # 10% of 200,000 = 20,000.00
        self.assertEqual(result, Decimal("20000.00"))

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_uses_user_custom_percentage_over_default(self):
        user = make_user(
            "u_custom_pct",
            monthly_income=Decimal("100000.00"),
            auto_save_percentage=Decimal("15.00"),
            phone_number="08000000012",
        )
        result = calculate_auto_save_amount(user)
        # 15% of 100,000 = 15,000.00
        self.assertEqual(result, Decimal("15000.00"))

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_result_is_rounded_to_two_decimal_places(self):
        user = make_user(
            "u_rounding",
            monthly_income=Decimal("100000.00"),
            auto_save_percentage=Decimal("3.33"),
            phone_number="08000000013",
        )
        result = calculate_auto_save_amount(user)
        # 3.33% of 100,000 = 3330.00
        self.assertEqual(result, Decimal("3330.00"))

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_fractional_result_rounds_correctly(self):
        user = make_user(
            "u_frac",
            monthly_income=Decimal("1000.00"),
            auto_save_percentage=Decimal("3.33"),
            phone_number="08000000014",
        )
        result = calculate_auto_save_amount(user)
        # 3.33% of 1000 = 33.30 (exact 2dp)
        self.assertEqual(result, Decimal("33.30"))


# ---------------------------------------------------------------------------
# 2. SavingSerializer.create() — interest rate & target amount logic
# ---------------------------------------------------------------------------

class SavingSerializerCreateTests(TestCase):
    """
    Tests the serializer's create() via the API endpoint so the full
    request context (user tier) is available.
    """

    LIST_URL = None  # set in setUp

    def setUp(self):
        self.list_url = reverse("saving-list-create")

    # ── Interest rate ────────────────────────────────────────────────────────

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_tier3_savings_get_interest_rate(self):
        user = make_user("t3_interest", tier=3, phone_number="08000000020")
        client = auth_client(user)
        data = {"goal_name": "Holiday", "target_amount": "50000.00"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saving = Saving.objects.get(id=response.data["id"])
        self.assertEqual(saving.interest_rate, Decimal("3.0"))

    def test_tier1_savings_have_zero_interest_rate(self):
        user = make_user("t1_no_interest", tier=1, phone_number="08000000021")
        client = auth_client(user)
        data = {"goal_name": "Books", "target_amount": "5000.00"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saving = Saving.objects.get(id=response.data["id"])
        self.assertEqual(saving.interest_rate, Decimal("0.00"))

    def test_tier2_savings_have_zero_interest_rate(self):
        user = make_user("t2_no_interest", tier=2, phone_number="08000000022")
        client = auth_client(user)
        data = {"goal_name": "Laptop", "target_amount": "120000.00"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saving = Saving.objects.get(id=response.data["id"])
        self.assertEqual(saving.interest_rate, Decimal("0.00"))

    # ── Auto-fill target_amount for Tier 2+ ──────────────────────────────────

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_tier2_target_amount_auto_filled_from_income_when_omitted(self):
        user = make_user(
            "t2_autofill",
            tier=2,
            monthly_income=Decimal("200000.00"),
            phone_number="08000000023",
        )
        client = auth_client(user)
        # target_amount intentionally omitted
        data = {"goal_name": "Emergency Fund"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saving = Saving.objects.get(id=response.data["id"])
        # 10% of 200,000 = 20,000
        self.assertEqual(saving.target_amount, Decimal("20000.00"))

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_tier2_target_amount_not_overridden_when_provided(self):
        user = make_user(
            "t2_manual_target",
            tier=2,
            monthly_income=Decimal("200000.00"),
            phone_number="08000000024",
        )
        client = auth_client(user)
        data = {"goal_name": "Car", "target_amount": "999999.00"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saving = Saving.objects.get(id=response.data["id"])
        self.assertEqual(saving.target_amount, Decimal("999999.00"))

    @override_settings(DEFAULT_AUTO_SAVE_PERCENTAGE=10.0)
    def test_tier2_target_amount_not_auto_filled_when_no_income(self):
        """If tier2 user has no income and omits target_amount, serializer
        validation should fail (target_amount is a required field)."""
        user = make_user(
            "t2_no_income",
            tier=2,
            monthly_income=None,
            phone_number="08000000025",
        )
        client = auth_client(user)
        data = {"goal_name": "Vacation"}
        response = client.post(self.list_url, data=data, format="json")

        # target_amount has no default — serializer must reject this
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("target_amount", response.data)

    def test_tier1_must_always_provide_target_amount(self):
        user = make_user("t1_no_target", tier=1, phone_number="08000000026")
        client = auth_client(user)
        data = {"goal_name": "Books"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("target_amount", response.data)

    # ── Ownership ────────────────────────────────────────────────────────────

    def test_saving_is_assigned_to_requesting_user(self):
        user = make_user("t1_owner", tier=1, phone_number="08000000027")
        client = auth_client(user)
        data = {"goal_name": "Phone", "target_amount": "80000.00"}
        response = client.post(self.list_url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saving = Saving.objects.get(id=response.data["id"])
        self.assertEqual(saving.user, user)


# ---------------------------------------------------------------------------
# 3. Savings List / Detail API endpoint tests
# ---------------------------------------------------------------------------

class SavingAPIEndpointTests(TestCase):
    """Integration tests for the savings list/create/detail endpoints."""

    def setUp(self):
        self.list_url = reverse("saving-list-create")
        self.user = make_user("api_user", tier=1, phone_number="08000000030")
        self.client = auth_client(self.user)

    def _create_saving(self, goal_name="Emergency", target_amount="10000.00"):
        return Saving.objects.create(
            user=self.user,
            goal_name=goal_name,
            target_amount=Decimal(target_amount),
            interest_rate=Decimal("0.00"),
        )

    def test_list_returns_only_own_savings(self):
        other = make_user("other_user", phone_number="08000000031")
        Saving.objects.create(
            user=other, goal_name="Other", target_amount=Decimal("5000"), interest_rate=Decimal("0")
        )
        self._create_saving("Mine")

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [s["goal_name"] for s in response.data]
        self.assertIn("Mine", names)
        self.assertNotIn("Other", names)

    def test_create_saving_returns_201(self):
        data = {"goal_name": "Travel", "target_amount": "30000.00"}
        response = self.client.post(self.list_url, data=data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_retrieve_saving_detail(self):
        saving = self._create_saving()
        url = reverse("saving-detail", kwargs={"pk": saving.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["goal_name"], "Emergency")

    def test_other_user_cannot_access_saving_detail(self):
        saving = self._create_saving()
        other = make_user("intruder", phone_number="08000000032")
        url = reverse("saving-detail", kwargs={"pk": saving.pk})
        response = auth_client(other).get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cannot_list_savings(self):
        response = APIClient().get(self.list_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# 4. Celery task — apply_tier3_interest
# ---------------------------------------------------------------------------

class ApplyTier3InterestTaskTests(TestCase):
    """Unit tests for the apply_tier3_interest periodic task."""

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_interest_applied_to_incomplete_tier3_savings(self):
        user = make_user("t3_task_user", tier=3, phone_number="08000000040")
        saving = Saving.objects.create(
            user=user,
            goal_name="Investment",
            target_amount=Decimal("10000.00"),
            current_amount=Decimal("1000.00"),
            interest_rate=Decimal("3.00"),
        )

        result = apply_tier3_interest()

        saving.refresh_from_db()
        # 3% of 1000 = 30 → new current_amount = 1030
        self.assertEqual(saving.current_amount, Decimal("1030.00"))
        self.assertIn("1", result)  # "1 saving goal(s)"

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_interest_not_applied_to_completed_savings(self):
        """Savings where current_amount == target_amount are skipped."""
        user = make_user("t3_full_user", tier=3, phone_number="08000000041")
        saving = Saving.objects.create(
            user=user,
            goal_name="Full Goal",
            target_amount=Decimal("5000.00"),
            current_amount=Decimal("5000.00"),  # already complete
            interest_rate=Decimal("3.00"),
        )

        apply_tier3_interest()

        saving.refresh_from_db()
        self.assertEqual(saving.current_amount, Decimal("5000.00"))  # unchanged

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_interest_does_not_exceed_target_amount(self):
        """Interest must be capped so current_amount never exceeds target."""
        user = make_user("t3_cap_user", tier=3, phone_number="08000000042")
        saving = Saving.objects.create(
            user=user,
            goal_name="Near-Complete Goal",
            target_amount=Decimal("1000.00"),
            current_amount=Decimal("999.00"),
            interest_rate=Decimal("3.00"),
        )

        apply_tier3_interest()

        saving.refresh_from_db()
        self.assertLessEqual(saving.current_amount, Decimal("1000.00"))
        self.assertEqual(saving.current_amount, Decimal("1000.00"))

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_interest_not_applied_to_tier1_users(self):
        """Task only targets Tier 3 users — Tier 1 savings untouched."""
        user = make_user("t1_task_user", tier=1, phone_number="08000000043")
        saving = Saving.objects.create(
            user=user,
            goal_name="T1 Saving",
            target_amount=Decimal("2000.00"),
            current_amount=Decimal("500.00"),
            interest_rate=Decimal("0.00"),
        )

        apply_tier3_interest()

        saving.refresh_from_db()
        self.assertEqual(saving.current_amount, Decimal("500.00"))

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_interest_not_applied_to_tier2_users(self):
        user = make_user("t2_task_user", tier=2, phone_number="08000000044")
        saving = Saving.objects.create(
            user=user,
            goal_name="T2 Saving",
            target_amount=Decimal("3000.00"),
            current_amount=Decimal("1000.00"),
            interest_rate=Decimal("0.00"),
        )

        apply_tier3_interest()

        saving.refresh_from_db()
        self.assertEqual(saving.current_amount, Decimal("1000.00"))

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_task_returns_correct_count_string(self):
        user = make_user("t3_count_user", tier=3, phone_number="08000000045")
        Saving.objects.create(
            user=user, goal_name="G1",
            target_amount=Decimal("5000"), current_amount=Decimal("1000"),
            interest_rate=Decimal("3"),
        )
        Saving.objects.create(
            user=user, goal_name="G2",
            target_amount=Decimal("5000"), current_amount=Decimal("2000"),
            interest_rate=Decimal("3"),
        )

        result = apply_tier3_interest()

        self.assertIn("2", result)

    @override_settings(TIER3_SAVING_INTEREST_RATE=3.0)
    def test_task_returns_zero_when_no_eligible_savings(self):
        result = apply_tier3_interest()
        self.assertIn("0", result)

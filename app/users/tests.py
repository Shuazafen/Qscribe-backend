"""
Tests for user tier upgrades (Tier 1 → 2, Tier 2 → 3).

Run with:
    python manage.py test app.users.tests
"""
from django.urls import reverse
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from app.users.models import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_image(name="face.jpg"):
    """Return a minimal fake image file suitable for file upload fields."""
    return SimpleUploadedFile(name, b"fake-image-bytes", content_type="image/jpeg")


def create_tier1_user(username="tier1user", phone_number="08000000001", **kwargs):
    """Create a fully-qualified Tier 1 user (all mandatory fields)."""
    user = User(
        username=username,
        email=f"{username}@test.com",
        phone_number=phone_number,
        university="University of Lagos",
        **kwargs,
    )
    user.set_password("Password123!")
    # id_card_image is required — give it a fake value
    user.id_card_image = make_image("id_card.jpg")
    user.tier = 1
    user.save()
    return user


def create_tier2_user(username="tier2user", phone_number="08000000002", **kwargs):
    user = create_tier1_user(username=username, phone_number=phone_number, **kwargs)
    user.nin = "12345678901"
    user.facial_recognition_image = make_image("face.jpg")
    user.tier = 2
    user.save()
    return user


def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# ---------------------------------------------------------------------------
# Tier 2 Upgrade Tests
# ---------------------------------------------------------------------------

class UpgradeToTier2ViewTests(TestCase):
    """Tests for POST /api/user/upgrade/tier2/"""

    def setUp(self):
        self.url = reverse("upgrade-tier2")
        self.user = create_tier1_user()
        self.client = authenticated_client(self.user)

    # ── Happy path ──────────────────────────────────────────────────────────

    def test_tier1_user_upgrades_to_tier2_successfully(self):
        data = {
            "nin": "12345678901",
            "facial_recognition_image": make_image(),
        }
        response = self.client.post(self.url, data=data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tier"], 2)
        self.assertIn("Tier 2", response.data["detail"])

        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 2)
        self.assertEqual(self.user.nin, "12345678901")
        self.assertTrue(self.user.facial_recognition_image)

    # ── Missing fields ───────────────────────────────────────────────────────

    def test_missing_nin_returns_400(self):
        data = {"facial_recognition_image": make_image()}
        response = self.client.post(self.url, data=data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nin", response.data)
        # tier must NOT have changed
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 1)

    def test_missing_facial_image_returns_400(self):
        data = {"nin": "12345678901"}
        response = self.client.post(self.url, data=data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("facial_recognition_image", response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 1)

    def test_missing_both_fields_returns_400_with_both_errors(self):
        response = self.client.post(self.url, data={}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nin", response.data)
        self.assertIn("facial_recognition_image", response.data)

    # ── Already upgraded ─────────────────────────────────────────────────────

    def test_already_tier2_user_cannot_re_upgrade(self):
        self.user.nin = "12345678901"
        self.user.facial_recognition_image = make_image()
        self.user.tier = 2
        self.user.save()

        data = {"nin": "98765432100", "facial_recognition_image": make_image()}
        response = self.client.post(self.url, data=data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already Tier 2", response.data["detail"])

    def test_tier3_user_also_blocked_from_tier2_re_upgrade(self):
        """Tier 3 user is >= 2, so the 'already Tier 2 or above' guard fires."""
        t3 = create_tier2_user(username="t3_for_t2_test", phone_number="08000000020")
        t3.bvn = "11111111111"
        t3.address = "1 Test Street"
        t3.tier = 3
        t3.save()
        client = authenticated_client(t3)

        data = {"nin": "99999999999", "facial_recognition_image": make_image()}
        response = client.post(self.url, data=data, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Authentication ───────────────────────────────────────────────────────

    def test_unauthenticated_request_is_rejected(self):
        response = APIClient().post(self.url, data={}, format="multipart")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# Tier 3 Upgrade Tests
# ---------------------------------------------------------------------------

class UpgradeToTier3ViewTests(TestCase):
    """Tests for POST /api/user/upgrade/tier3/"""

    def setUp(self):
        self.url = reverse("upgrade-tier3")
        self.user = create_tier2_user()
        self.client = authenticated_client(self.user)

    # ── Happy path ───────────────────────────────────────────────────────────

    def test_tier2_user_upgrades_to_tier3_successfully(self):
        data = {"bvn": "22222222222", "address": "5 Main Road, Lagos"}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tier"], 3)
        self.assertIn("Tier 3", response.data["detail"])

        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 3)
        self.assertEqual(self.user.bvn, "22222222222")
        self.assertEqual(self.user.address, "5 Main Road, Lagos")

    def test_tier3_response_mentions_interest_and_pets(self):
        """Confirm upgrade message mentions key Tier 3 perks."""
        data = {"bvn": "22222222222", "address": "5 Main Road"}
        response = self.client.post(self.url, data=data, format="json")

        detail = response.data["detail"]
        self.assertIn("interest", detail.lower())
        self.assertIn("pets", detail.lower())

    # ── Missing fields ───────────────────────────────────────────────────────

    def test_missing_bvn_returns_400(self):
        data = {"address": "5 Main Road, Lagos"}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bvn", response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 2)

    def test_missing_address_returns_400(self):
        data = {"bvn": "22222222222"}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("address", response.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.tier, 2)

    def test_missing_both_fields_returns_400_with_both_errors(self):
        response = self.client.post(self.url, data={}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bvn", response.data)
        self.assertIn("address", response.data)

    # ── Already upgraded ─────────────────────────────────────────────────────

    def test_already_tier3_user_cannot_re_upgrade(self):
        self.user.bvn = "22222222222"
        self.user.address = "5 Main Road"
        self.user.tier = 3
        self.user.save()

        data = {"bvn": "33333333333", "address": "New Address"}
        response = self.client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already Tier 3", response.data["detail"])

    # ── Permission: only Tier 2+ may call this endpoint ──────────────────────

    def test_tier1_user_is_forbidden_from_tier3_endpoint(self):
        """IsTier2 permission should block Tier 1 users with 403."""
        tier1 = create_tier1_user(username="blocked_t1", phone_number="08000000099")
        client = authenticated_client(tier1)
        data = {"bvn": "22222222222", "address": "Some Address"}
        response = client.post(self.url, data=data, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_request_is_rejected(self):
        response = APIClient().post(self.url, data={}, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

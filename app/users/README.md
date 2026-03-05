# Users App

Handles user registration, authentication profiles, and KYC-based tier upgrades.

## Models

### `User` (extends `AbstractUser`)

| Field | Type | Description |
|---|---|---|
| `phone_number` | CharField | Unique phone number (required at registration) |
| `tier` | IntegerField | Current tier level: `1`, `2`, or `3` (default: `1`) |
| `university` | CharField | University affiliation |
| `id_card_image` | ImageField | Uploaded ID card (required at registration) |
| `nin` | CharField | National Identification Number (required for Tier 2) |
| `bvn` | CharField | Bank Verification Number (required for Tier 3) |
| `address` | TextField | Home address (required for Tier 3) |
| `facial_recognition_image` | ImageField | Face photo (required for Tier 2) |

### Tier Completion Checks

| Method | Returns `True` if… |
|---|---|
| `is_tier_1_complete()` | `phone_number`, `university`, and `id_card_image` are all set |
| `is_tier_2_complete()` | Tier 1 complete + `nin` and `facial_recognition_image` set |
| `is_tier_3_complete()` | Tier 2 complete + `bvn` and `address` set |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/user/profile/` | Tier 1+ | Retrieve authenticated user's profile |
| `PATCH` | `/api/user/profile/` | Tier 1+ | Update profile fields |
| `POST` | `/api/user/upgrade/tier2/` | Tier 1 | Submit NIN + facial image to upgrade to Tier 2 |
| `POST` | `/api/user/upgrade/tier3/` | Tier 2 | Submit BVN + address to upgrade to Tier 3 |

### Upgrade to Tier 2 — Request Body

```json
{
  "nin": "12345678901",
  "facial_recognition_image": "<file upload>"
}
```

### Upgrade to Tier 3 — Request Body

```json
{
  "bvn": "12345678901",
  "address": "123 Main Street, Lagos"
}
```

## Permissions

Defined in `app/users/permissions.py`:

| Class | Requirement |
|---|---|
| `IsTier1` | Authenticated user with `tier >= 1` |
| `IsTier2` | Authenticated user with `tier >= 2` |
| `IsTier3` | Authenticated user with `tier >= 3` |
| `IsOwner` | Request user matches the object's `user` field |


## Signals

Defined in `app/users/signals.py`:

| Signal | Description |
|---|---|
| `post_save` | Triggers tier upgrade logic when a user's tier is explicitly set |

## Files

```
app/users/
├── models.py        # Custom User model
├── serializer.py    # UserSerializer (read/write)
├── permissions.py   # IsTier1, IsTier2, IsTier3, IsOwner
├── views.py         # Profile + tier upgrade views
├── urls.py          # URL routing
├── admin.py         # Admin panel registration
└── signals.py       # Post-save signal hooks
```

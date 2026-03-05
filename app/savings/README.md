# Savings App

Manages users' savings goals. Tier 3 users automatically earn a **3% monthly interest rate** on their savings.

## Models

### `Saving`

| Field | Type | Description |
|---|---|---|
| `user` | ForeignKey | Owner of the saving goal |
| `goal_name` | CharField | Name of the saving goal |
| `target_amount` | DecimalField | Target amount to reach |
| `current_amount` | DecimalField | Amount saved so far (default: `0`) |
| `interest_rate` | DecimalField | Interest rate in % (auto-set to `3.0` for Tier 3, else `0.00`) |
| `created_at` | DateTimeField | Auto-set on creation |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/savings/` | Tier 1+ | List the authenticated user's saving goals |
| `POST` | `/api/savings/` | Tier 1+ | Create a new saving goal |
| `GET` | `/api/savings/<pk>/` | Tier 1+ (owner) | Retrieve a specific saving goal |
| `PUT` | `/api/savings/<pk>/` | Tier 1+ (owner) | Update a saving goal |
| `DELETE` | `/api/savings/<pk>/` | Tier 1+ (owner) | Delete a saving goal |

> Objects are scoped to the requesting user — other users' savings return `404`.

### Create Saving Goal — Request Body

```json
{
  "goal_name": "New Laptop",
  "target_amount": "150000.00"
}
```

> `interest_rate` is automatically assigned based on user tier and is read-only.

## Tier 3 — Interest Rate

When a **Tier 3** user creates a saving goal, the `interest_rate` field is auto-set to the value of `TIER3_SAVING_INTEREST_RATE` in `settings.py` (default: **3.0%**).

A **Celery periodic task** (`apply_tier3_interest`) runs on the **1st of every month at midnight** and applies the interest to the `current_amount` of all active (unfilled) Tier 3 savings goals.

To run the Celery beat scheduler:

```bash
celery -A core.core beat -l info
celery -A core.core worker -l info
```

## Files

```
app/savings/
├── models.py        # Saving model (with interest_rate field)
├── serializers.py   # SavingSerializer (auto-assigns interest rate)
├── views.py         # List/create + detail views
├── urls.py          # URL routing
├── tasks.py         # Celery task: apply_tier3_interest
└── admin.py         # Admin panel registration
```

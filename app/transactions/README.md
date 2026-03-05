# Transactions App

Handles deposits and withdrawals. Requires **Tier 2** minimum. Tier 3 users enjoy **limitless deposit amounts**.

## Tier Deposit Limits

| Tier | Max Deposit Per Transaction |
|---|---|
| Tier 1 | ❌ No access to transactions |
| Tier 2 | ✅ Up to **₦300,000** per transaction |
| Tier 3 | ✅ **Limitless** |

> The cap is configurable via `TIER2_MAX_DEPOSIT_AMOUNT` in `settings.py`.

## Models

### `Transaction`

| Field | Type | Description |
|---|---|---|
| `user` | ForeignKey | Owner of the transaction |
| `amount` | DecimalField | Transaction amount |
| `transaction_type` | CharField | `"deposit"` or `"withdrawal"` |
| `description` | CharField | Optional description |
| `created_at` | DateTimeField | Auto-set on creation |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/transactions/` | Tier 2+ | List user's transactions |
| `POST` | `/api/transactions/` | Tier 2+ | Create a transaction |
| `GET` | `/api/transactions/<pk>/` | Tier 2+ (owner) | Retrieve a specific transaction |

> Tier 1 users receive `403 Forbidden` with an upgrade prompt.

### Create Transaction — Request Body

```json
{
  "amount": "50000.00",
  "transaction_type": "deposit",
  "description": "Monthly salary"
}
```

### Error — Tier 2 Deposit Cap Exceeded

```json
{
  "amount": [
    "Tier 2 users can deposit a maximum of ₦300,000 per transaction. Upgrade to Tier 3 for limitless deposits."
  ]
}
```

## Files

```
app/transactions/
├── models.py        # Transaction model
├── serializers.py   # TransactionSerializer (enforces deposit cap)
├── views.py         # List/create + detail views
├── urls.py          # URL routing
└── admin.py         # Admin panel registration
```

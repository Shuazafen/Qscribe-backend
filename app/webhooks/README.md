# Webhooks App

Allows external services to receive real-time event notifications from Qscribe via HTTP POST requests.

## Models

### `Webhook`

| Field | Type | Description |
|---|---|---|
| `target_url` | URLField | The external URL to send the event payload to |
| `event_type` | CharField | The event to listen for (see choices below) |
| `secret_key` | CharField | Auto-generated UUID used to verify webhook authenticity |
| `is_active` | BooleanField | Whether this webhook is active (default: `True`) |
| `created_at` | DateTimeField | Auto-set on creation |

### Event Types

| Event | Trigger |
|---|---|
| `transaction.created` | A new transaction (deposit/withdrawal) is made |
| `habit.completed` | A user marks a habit as completed |
| `tier.upgraded` | A user successfully upgrades their tier |

## How It Works

1. An admin registers a webhook via the Django admin panel with a `target_url` and `event_type`.
2. When the corresponding event fires in the app (e.g., a new transaction), the system dispatches a Celery task (`send_webhook_task`) that sends an HTTP POST to the `target_url` with a JSON payload.
3. The `secret_key` can be used on the receiving end to verify the request came legitimately from Qscribe.

### Example Payload (transaction.created)

```json
{
  "event": "transaction.created",
  "data": {
    "user": "john_doe",
    "amount": "50000.00",
    "transaction_type": "deposit"
  }
}
```

## Admin

Webhooks are fully managed from the admin panel. Admins can create, activate/deactivate, and delete webhook endpoints.

## Files

```
app/webhooks/
├── models.py        # Webhook model
├── tasks.py         # Celery task: send_webhook_task
└── admin.py         # Admin panel registration
```

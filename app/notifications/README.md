# Notifications App

Manages in-app notifications delivered to users by the system.

## Models

### `Notification`

| Field | Type | Description |
|---|---|---|
| `user` | ForeignKey | Recipient of the notification |
| `title` | CharField | Short notification title |
| `message` | TextField | Full notification body |
| `is_read` | BooleanField | Whether the user has read it (default: `False`) |
| `created_at` | DateTimeField | Auto-set on creation |

## How Notifications Are Created

Notifications are created programmatically by the system — for example, when:
- A user upgrades their tier
- A transaction is completed
- A saving goal is reached

They are **not** created by users directly via the API.

## Admin

Notifications can be viewed and managed from the Django admin panel, including marking them as read or creating manual system alerts.

## Files

```
app/notifications/
├── models.py        # Notification model
└── admin.py         # Admin panel registration
```

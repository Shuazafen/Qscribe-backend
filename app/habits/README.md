# Habits App

Lets users create and track personal habits and goals. Available to all registered users (Tier 1+).

## Models

### `Habit`

| Field | Type | Description |
|---|---|---|
| `user` | ForeignKey | Owner of the habit |
| `name` | CharField | Name of the habit (e.g., "Morning Run") |
| `goal` | CharField | Description of the goal |
| `is_completed` | BooleanField | Whether the habit is marked complete (default: `False`) |
| `created_at` | DateTimeField | Auto-set on creation |
| `updated_at` | DateTimeField | Auto-updated on save |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/habits/` | Tier 1+ | List the authenticated user's habits |
| `POST` | `/api/habits/` | Tier 1+ | Create a new habit |
| `GET` | `/api/habits/<pk>/` | Tier 1+ (owner) | Retrieve a specific habit |
| `PUT` | `/api/habits/<pk>/` | Tier 1+ (owner) | Update a habit |
| `DELETE` | `/api/habits/<pk>/` | Tier 1+ (owner) | Delete a habit |

> Objects are scoped to the requesting user — other users' habits return `404`.

### Create Habit — Request Body

```json
{
  "name": "Morning Run",
  "goal": "Run 5km every morning before 7am"
}
```

### Mark Habit Complete — Request Body

```json
{
  "is_completed": true
}
```

## Files

```
app/habits/
├── models.py        # Habit model
├── serializers.py   # HabitSerializer
├── views.py         # List/create + detail views
├── urls.py          # URL routing
└── admin.py         # Admin panel registration
```

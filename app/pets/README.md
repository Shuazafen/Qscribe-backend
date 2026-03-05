# Pets App

Lets users browse and collect virtual pets. **Rare pets** are exclusive to **Tier 3** users.

## Tier Access

| Tier | Common Pets | Rare Pets |
|---|---|---|
| Tier 1 | ✅ | ❌ |
| Tier 2 | ✅ | ❌ |
| Tier 3 | ✅ | ✅ |

> Attempting to access a rare pet detail as a Tier 1/2 user returns `403 Forbidden`.

## Models

### `Pet`

| Field | Type | Description |
|---|---|---|
| `name` | CharField | Pet name |
| `description` | TextField | Optional description |
| `image` | ImageField | Pet image (uploaded to `pet_images/`) |
| `is_rare` | BooleanField | If `True`, only Tier 3 users can see and access it |

## API Endpoints

| Method | URL | Permission | Description |
|---|---|---|---|
| `GET` | `/api/pets/` | Tier 1+ | List pets (Tier 1/2 see common only; Tier 3 sees all) |
| `GET` | `/api/pets/<pk>/` | Tier 1+ | Retrieve a pet (403 if rare and not Tier 3) |

### List Response — Tier 1/2 (common pets only)

```json
[
  { "id": 1, "name": "Bunny", "description": "A fluffy bunny", "image": null, "is_rare": false }
]
```

### List Response — Tier 3 (all pets)

```json
[
  { "id": 1, "name": "Bunny", "description": "A fluffy bunny", "image": null, "is_rare": false },
  { "id": 2, "name": "Golden Dragon", "description": "An ancient rare dragon", "image": "/media/pet_images/dragon.png", "is_rare": true }
]
```

### Error — Rare Pet Access Denied (Tier 1/2)

```json
{
  "detail": "This is a rare pet exclusive to Tier 3 members. Upgrade to Tier 3 to unlock rare pets."
}
```

## Admin

Pets are managed entirely from the admin panel. Admins can toggle `is_rare` to control pet availability per tier.

## Files

```
app/pets/
├── models.py        # Pet model (is_rare flag)
├── serializers.py   # PetSerializer
├── views.py         # PetListView + PetDetailView
├── urls.py          # URL routing
├── admin.py         # Admin registration
└── apps.py          # AppConfig
```

# API – Slice 1 (Lookups & CR→XP)

## System
- `GET /api/v1/health` → `{ "status": "ok" }`
- `GET /api/v1/version` → `{ "version": "<semver>" }`

## Generische Lookups (READ)
- Liste (pagination): `GET /api/v1/{path}?limit=100&offset=0`
- Detail: `GET /api/v1/{path}/{id:int}`

### Registrierte Lookups (Beispiele)
- `/api/v1/sizes`
- `/api/v1/alignments`
- `/api/v1/cr-to-xp` (Sonderfall, Key = challenge_rating)

### Response-Formate (vereinfacht)
```json
// list
[
  { "id": 1, "code": "tiny", "name": "Tiny" }
]

// item
{ "id": 1, "code": "lg", "name": "Lawful Good" }

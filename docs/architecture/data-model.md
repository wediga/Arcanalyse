# Data Model

## Overview

The data model is based on the structure of the [Open5e v2](https://github.com/open5e/open5e-api) SRD data, extended with Arcanalyse-specific entities for encounter management and analysis.

**Note:** The data model is currently in the design phase. The schema described here represents the planned approach, not a finalized implementation.

## Entity Relationship Diagram (Planned)

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1:n
     v
┌─────────────┐
│   Project   │ (Campaign Container)
└─────┬───────┘
      │ 1:n
      ├──────────────────┬─────────────────┐
      v                  v                 v
┌─────────┐       ┌───────────┐     ┌───────────┐
│  Party  │       │  Monster  │     │ Encounter │
└────┬────┘       └───────────┘     └─────┬─────┘
     │ 1:n              ^                 │
     v                  │ n:m             │ 1:n
┌───────────┐    ┌──────┴──────┐    ┌─────v─────┐
│ Character │    │EncounterMon │    │Simulation │
└───────────┘    └─────────────┘    │   Run     │
                                    └───────────┘
```

## Core Entities

### User

Authentication and settings.

```python
class User:
    id: UUID
    email: str
    display_name: str
    created_at: datetime
```

### Project

Container for related data (e.g., a campaign).

```python
class Project:
    id: UUID
    owner_id: UUID  # FK -> User
    name: str
    description: str | None
    created_at: datetime
```

### Party

Player group with aggregated or detailed character data.

```python
class Party:
    id: UUID
    project_id: UUID  # FK -> Project
    name: str
    size: int
    average_level: int
    # Optional: detailed characters
```

### Character (optional for MVP)

Full player character. In the MVP, the party may use aggregated stats only.

```python
class Character:
    id: UUID
    party_id: UUID  # FK -> Party
    name: str
    level: int
    class_: str  # "Fighter", "Wizard", etc.
    # ... additional stats
```

### Monster / Creature

Full statblock based on SRD structure.

See [Monster Schema](#monster-schema) below.

### Encounter

Combination of party and opponents with parameters.

```python
class Encounter:
    id: UUID
    project_id: UUID  # FK -> Project
    party_id: UUID    # FK -> Party
    name: str
    description: str | None
    created_at: datetime
    # Opponents via join table
```

### EncounterMonster (Join Table)

```python
class EncounterMonster:
    encounter_id: UUID  # FK -> Encounter
    monster_id: UUID    # FK -> Monster
    count: int          # Number of this monster type
    variant_notes: str | None  # e.g., "buffed", "wounded"
```

### SimulationRun

Results of a Monte Carlo simulation.

```python
class SimulationRun:
    id: UUID
    encounter_id: UUID  # FK -> Encounter
    iterations: int
    parameters: dict    # Simulation settings
    # Results
    party_win_rate: float
    tpk_probability: float
    expected_rounds: float
    variance: float
    created_at: datetime
```

---

## Monster Schema

Based on the Open5e v2 structure, adapted for PostgreSQL.

### Main Table: `monsters`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| index | VARCHAR | SRD index (unique), e.g., "adult-red-dragon" |
| name | VARCHAR | Display name |
| size | ENUM | Tiny, Small, Medium, Large, Huge, Gargantuan |
| type | VARCHAR | dragon, humanoid, undead, etc. |
| alignment | VARCHAR | |
| armor_class | INT | |
| armor_desc | VARCHAR | "natural armor", etc. |
| hit_points | INT | |
| hit_dice | VARCHAR | "19d12+133" |
| challenge_rating | DECIMAL | 0.25, 0.5, 1, 2, ... 30 |
| xp | INT | |
| is_srd | BOOL | Imported from SRD? |
| is_custom | BOOL | User-created? |
| project_id | UUID | NULL = global, otherwise project-specific |

### Ability Scores (embedded or separate table)

```python
strength: int
dexterity: int
constitution: int
intelligence: int
wisdom: int
charisma: int
```

### Speed (JSONB)

```json
{
  "walk": 40,
  "fly": 80,
  "swim": null,
  "burrow": 40,
  "climb": null
}
```

### Senses (JSONB)

```json
{
  "darkvision": 120,
  "blindsight": null,
  "tremorsense": null,
  "truesight": null,
  "passive_perception": 20
}
```

### Relation Tables

**monster_proficiencies**
```
monster_id | proficiency_type | proficiency_name | value
-----------+------------------+------------------+------
UUID       | saving-throw     | DEX              | 6
UUID       | skill            | Perception       | 10
```

**monster_damage_relations**
```
monster_id | relation_type | damage_type
-----------+---------------+------------
UUID       | immunity      | fire
UUID       | resistance    | cold
UUID       | vulnerability | lightning
```

**monster_condition_immunities**
```
monster_id | condition
-----------+----------
UUID       | frightened
UUID       | charmed
```

### Actions Table: `monster_actions`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| monster_id | UUID | FK |
| action_type | ENUM | action, legendary, reaction, special |
| name | VARCHAR | "Bite", "Fire Breath", etc. |
| description | TEXT | |
| attack_bonus | INT | NULL if not an attack |
| reach | INT | Melee reach |
| range_normal | INT | Ranged normal |
| range_long | INT | Ranged disadvantage |
| damage | JSONB | Array of {type, dice} |
| dc_type | VARCHAR | "dex", "wis", etc. |
| dc_value | INT | |
| dc_success | VARCHAR | "half", "none", etc. |
| aoe_type | VARCHAR | cone, sphere, line, etc. |
| aoe_size | INT | |
| usage_type | VARCHAR | "recharge", "per day", etc. |
| usage_value | VARCHAR | "5-6", "3", etc. |
| legendary_cost | INT | For legendary actions |

### Damage JSONB Example

```json
[
  {"damage_type": "piercing", "damage_dice": "2d10+8"},
  {"damage_type": "fire", "damage_dice": "2d6"}
]
```

---

## Spell Schema

### Main Table: `spells`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | |
| index | VARCHAR | SRD index |
| name | VARCHAR | |
| level | INT | 0-9 (0 = cantrip) |
| school | VARCHAR | evocation, abjuration, etc. |
| casting_time | VARCHAR | "1 action", "1 bonus action", etc. |
| range | VARCHAR | "Touch", "120 feet", "Self" |
| duration | VARCHAR | |
| concentration | BOOL | |
| ritual | BOOL | |
| components | VARCHAR[] | ["V", "S", "M"] |
| material | TEXT | Material description |
| description | TEXT | |
| higher_level | TEXT | Upcasting description |
| damage_type | VARCHAR | NULL if no damage |
| damage_at_slot_level | JSONB | {"3": "8d6", "4": "9d6", ...} |
| healing_at_slot_level | JSONB | |
| dc_type | VARCHAR | |
| dc_success | VARCHAR | |
| aoe_type | VARCHAR | |
| aoe_size | INT | |

---

## Reference Tables (Enums/Lookups)

These will be implemented as PostgreSQL lookup tables (extensible without schema migrations):

- **damage_types**: acid, bludgeoning, cold, fire, force, lightning, necrotic, piercing, poison, psychic, radiant, slashing, thunder
- **conditions**: blinded, charmed, deafened, exhaustion, frightened, grappled, incapacitated, invisible, paralyzed, petrified, poisoned, prone, restrained, stunned, unconscious
- **sizes**: tiny, small, medium, large, huge, gargantuan
- **ability_scores**: str, dex, con, int, wis, cha
- **magic_schools**: abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, transmutation

---

## Open Design Questions

1. **Character detail level in MVP** -- Full characters or party aggregates only?
2. **JSONB vs. normalized tables** -- For speed, senses, and damage arrays
3. **Soft deletes** -- For encounter versioning?

These decisions will be finalized during the data model design phase.

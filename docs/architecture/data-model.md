# Datenmodell

## Übersicht

Das Datenmodell orientiert sich an der Struktur des [5e-database](https://github.com/5e-bits/5e-database) SRD-Repos, erweitert um Arcanalyse-spezifische Entitäten für Encounter-Management und Analyse.

## Entity-Relationship-Diagramm (Konzept)

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1:n
     ▼
┌─────────────┐
│   Project   │ (Campaign Container)
└─────┬───────┘
      │ 1:n
      ├──────────────────┬─────────────────┐
      ▼                  ▼                 ▼
┌─────────┐       ┌───────────┐     ┌───────────┐
│  Party  │       │  Monster  │     │ Encounter │
└────┬────┘       └───────────┘     └─────┬─────┘
     │ 1:n              ▲                 │
     ▼                  │ n:m             │ 1:n
┌───────────┐    ┌──────┴──────┐    ┌─────▼─────┐
│ Character │    │EncounterMon │    │Simulation │
└───────────┘    └─────────────┘    │   Run     │
                                    └───────────┘
```

## Kernentitäten

### User

Authentifizierung und Einstellungen.

```python
class User:
    id: UUID
    email: str
    display_name: str
    created_at: datetime
```

### Project

Container für zusammengehörige Daten (z.B. eine Kampagne).

```python
class Project:
    id: UUID
    owner_id: UUID  # FK → User
    name: str
    description: str | None
    created_at: datetime
```

### Party

Spielergruppe mit aggregierten oder detaillierten Charakterdaten.

```python
class Party:
    id: UUID
    project_id: UUID  # FK → Project
    name: str
    size: int
    average_level: int
    # Optional: Detaillierte Charaktere
```

### Character (optional für MVP)

Vollständiger Spielercharakter. Im MVP kann Party auch nur aggregiert sein.

```python
class Character:
    id: UUID
    party_id: UUID  # FK → Party
    name: str
    level: int
    class_: str  # "Fighter", "Wizard", etc.
    # ... weitere Stats
```

### Monster / Creature

Vollständiger Statblock basierend auf SRD-Struktur.

→ Siehe [Monster-Schema](#monster-schema) unten

### Encounter

Kombination aus Party und Gegnern mit Parametern.

```python
class Encounter:
    id: UUID
    project_id: UUID  # FK → Project
    party_id: UUID    # FK → Party
    name: str
    description: str | None
    created_at: datetime
    # Gegner über Join-Tabelle
```

### EncounterMonster (Join-Tabelle)

```python
class EncounterMonster:
    encounter_id: UUID  # FK → Encounter
    monster_id: UUID    # FK → Monster
    count: int          # Anzahl dieser Monster
    variant_notes: str | None  # z.B. "buffed", "wounded"
```

### SimulationRun

Ergebnisse einer Monte-Carlo-Simulation.

```python
class SimulationRun:
    id: UUID
    encounter_id: UUID  # FK → Encounter
    iterations: int
    parameters: dict    # Simulations-Einstellungen
    # Results
    party_win_rate: float
    tpk_probability: float
    expected_rounds: float
    variance: float
    created_at: datetime
```

---

## Monster-Schema

Basierend auf der 5e-database Struktur, angepasst für PostgreSQL.

### Haupt-Tabelle: `monsters`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | Primary Key |
| index | VARCHAR | SRD-Index (unique), z.B. "adult-red-dragon" |
| name | VARCHAR | Display Name |
| size | ENUM | Tiny, Small, Medium, Large, Huge, Gargantuan |
| type | VARCHAR | dragon, humanoid, undead, etc. |
| alignment | VARCHAR | |
| armor_class | INT | |
| armor_desc | VARCHAR | "natural armor", etc. |
| hit_points | INT | |
| hit_dice | VARCHAR | "19d12+133" |
| challenge_rating | DECIMAL | 0.25, 0.5, 1, 2, ... 30 |
| xp | INT | |
| is_srd | BOOL | Aus SRD importiert? |
| is_custom | BOOL | User-erstellt? |
| project_id | UUID | NULL = global, sonst projekt-spezifisch |

### Ability Scores (embedded oder separate Tabelle)

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

### Relations-Tabellen

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

### Actions-Tabelle: `monster_actions`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | |
| monster_id | UUID | FK |
| action_type | ENUM | action, legendary, reaction, special |
| name | VARCHAR | "Bite", "Fire Breath", etc. |
| description | TEXT | |
| attack_bonus | INT | NULL wenn kein Angriff |
| reach | INT | Melee-Reichweite |
| range_normal | INT | Ranged normal |
| range_long | INT | Ranged disadvantage |
| damage | JSONB | Array von {type, dice} |
| dc_type | VARCHAR | "dex", "wis", etc. |
| dc_value | INT | |
| dc_success | VARCHAR | "half", "none", etc. |
| aoe_type | VARCHAR | cone, sphere, line, etc. |
| aoe_size | INT | |
| usage_type | VARCHAR | "recharge", "per day", etc. |
| usage_value | VARCHAR | "5-6", "3", etc. |
| legendary_cost | INT | Für legendary actions |

### Damage JSONB Beispiel

```json
[
  {"damage_type": "piercing", "damage_dice": "2d10+8"},
  {"damage_type": "fire", "damage_dice": "2d6"}
]
```

---

## Spell-Schema

### Haupt-Tabelle: `spells`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | |
| index | VARCHAR | SRD-Index |
| name | VARCHAR | |
| level | INT | 0-9 (0 = Cantrip) |
| school | VARCHAR | evocation, abjuration, etc. |
| casting_time | VARCHAR | "1 action", "1 bonus action", etc. |
| range | VARCHAR | "Touch", "120 feet", "Self" |
| duration | VARCHAR | |
| concentration | BOOL | |
| ritual | BOOL | |
| components | VARCHAR[] | ["V", "S", "M"] |
| material | TEXT | Material-Beschreibung |
| description | TEXT | |
| higher_level | TEXT | Upcasting-Beschreibung |
| damage_type | VARCHAR | NULL wenn kein Damage |
| damage_at_slot_level | JSONB | {"3": "8d6", "4": "9d6", ...} |
| healing_at_slot_level | JSONB | |
| dc_type | VARCHAR | |
| dc_success | VARCHAR | |
| aoe_type | VARCHAR | |
| aoe_size | INT | |

---

## Referenz-Tabellen (Enums/Lookups)

Diese können als PostgreSQL ENUMs oder Lookup-Tabellen implementiert werden:

- **damage_types**: acid, bludgeoning, cold, fire, force, lightning, necrotic, piercing, poison, psychic, radiant, slashing, thunder
- **conditions**: blinded, charmed, deafened, exhaustion, frightened, grappled, incapacitated, invisible, paralyzed, petrified, poisoned, prone, restrained, stunned, unconscious
- **sizes**: tiny, small, medium, large, huge, gargantuan
- **ability_scores**: str, dex, con, int, wis, cha
- **magic_schools**: abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, transmutation

---

## Offene Entscheidungen

1. **Character-Detail-Level im MVP** - Vollständige Charaktere oder nur Party-Aggregate?
2. **JSONB vs. normalisierte Tabellen** - Für Speed, Senses, Damage-Arrays
3. **Soft Deletes** - Für Encounter-Versioning?

→ Entscheidungen werden in [decisions/](decisions/) dokumentiert.

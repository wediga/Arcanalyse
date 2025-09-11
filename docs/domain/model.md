# Arcanalyse – Domänenmodell (MVP)

> Quelle: Projektvorgaben / Schema-Entwurf. Dieses Dokument ist die kanonische Referenz.

## 1) Lookups (read-only)
- `ac_type(id, code, name)`
- `size(id, code, name, sort_order)`
- `creature_type(id, code, name)`
- `alignment(id, code, name)`
- `damage_type(id, code, name)`
- `condition_type(id, code, name)`
- `speed_type(id, code, name)`
- `sense_type(id, code, name)`
- `language(id, code, name)`
- `environment(id, code, name)`
- `tag(id, code, name)`
- `skill(id, code, name, ability_id?)`
- `ability(id, code, name)` — z. B. str, dex, con, int, wis, cha
- `source(id, code, name, abbreviation)`
- `cr_to_xp(cr NUMERIC(4,3), xp INT)` — CR→XP Mapping

**Indizes/Constraints:** `unique lower(code)`, ggf. `sort_order` für `size`.

## 2) User
- `app_user(id, email, display_name, created_at, updated_at)`
- Unique: `lower(email)`

## 3) Creature (Konzept)
- `creature(id, name, created_at, updated_at)`
- Unique: `lower(name)`

## 4) Creature Statblock (je Quelle/Variante)
- `creature_statblock(id, creature_id FK, source_id FK, printed_name, variant_name, page_number,
  size_id FK, type_id FK, alignment_id FK,
  armor_class, ac_type_id FK, ac_notes,
  hit_points_avg, hit_dice, str, dex, con, int, wis, cha,
  passive_perception, challenge_rating NUMERIC(4,3),
  is_legendary BOOL, created_at, updated_at)`
- Unique: `(creature_id, source_id, lower(coalesce(variant_name,'')))`

### 4b) Mehrfachwerte (1:n)
- `statblock_to_speed(id, statblock_id FK, speed_type_id FK, feet INT, can_hover BOOL)`
- `statblock_to_sense(id, statblock_id FK, sense_type_id FK, range_ft INT)`
- `statblock_to_language(id, statblock_id FK, language_id FK, telepathy_range_ft INT NULL, note TEXT NULL)`

### 4c) Explizite Boni
- `creature_statblock_save(id, statblock_id FK, ability_id FK, bonus INT)`
- `creature_statblock_skill(id, statblock_id FK, skill_id FK, bonus INT)`

### 4d) Damage/Condition
- `statblock_to_damage_vulnerability(id, statblock_id FK, damage_type_id FK, qualifier TEXT NULL)`
- `statblock_to_damage_resistance(id, statblock_id FK, damage_type_id FK, qualifier TEXT NULL)`
- `statblock_to_damage_immunity(id, statblock_id FK, damage_type_id FK, qualifier TEXT NULL)`
- `statblock_to_condition_immunity(id, statblock_id FK, condition_type_id FK)`

### 4e) Environment & Tags
- `statblock_to_environment(id, statblock_id FK, environment_id FK)`
- `statblock_to_tag(id, statblock_id FK, tag_id FK)`

## 5) View & Indizes
- View: `v_creature_statblock_with_xp` (Join `creature_statblock` ↔ `cr_to_xp`)
- Indizes: `lower(printed_name)`, `challenge_rating`, `size_id`, `type_id`, `alignment_id`, `source_id`, `is_legendary`,
  Join-FKs der Detailtabellen

## 6) Parties & Encounters
- `party(id, owner_id FK app_user, name, party_level INT CHECK 1..20, created_at, updated_at)`
- `encounter(id, owner_id FK app_user, name, description TEXT NULL, created_at, updated_at)`
- `party_to_encounter(party_id FK, encounter_id FK, PRIMARY KEY (party_id, encounter_id))`
- `encounter_to_creature_statblock(id, encounter_id FK, creature_statblock_id FK, quantity INT CHECK >=1, note TEXT NULL)`

## Lösch-/FK-Regeln (Richtlinie)
- Lookups: RESTRICT (nur Admin ändert)
- `creature` → ON DELETE CASCADE nach `creature_statblock`
- `creature_statblock` → RESTRICT sofern in `encounter_to_creature_statblock` referenziert
- Detailtabellen: CASCADE auf Statblock

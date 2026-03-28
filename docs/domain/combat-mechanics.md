# D&D 5e Combat Mechanics

This document describes the D&D 5e rules relevant to Arcanalyse's encounter analysis and simulation.

## Basic Combat Structure

### Initiative and Rounds

1. Each creature rolls **initiative** (d20 + DEX modifier)
2. Order: Highest initiative goes first
3. Each round: Every creature gets **1 turn**
4. A turn consists of: **Action**, **Bonus Action**, **Movement**, **Reaction** (1 until next turn)

### Action Economy

| Resource | Per Turn | Examples |
|----------|----------|----------|
| Action | 1 | Attack, Cast Spell, Dash, Dodge |
| Bonus Action | 1 | Offhand Attack, some spells |
| Movement | Speed ft. | Walk, Fly, Swim |
| Reaction | 1 (until next turn) | Opportunity Attack, Shield |
| Free Action | Unlimited | Drop Item, Speak |

**Why action economy matters:**
- 4 goblins (4 actions) > 1 ogre (1 action) at the same XP
- Legendary actions bypass the 1-action limit
- Lair actions provide additional actions

---

## Attacks and Damage

### Attack Roll

```
d20 + Attack Bonus vs. AC
```

- **Hit:** Roll >= AC
- **Critical Hit:** Natural 20 -- double damage dice
- **Critical Miss:** Natural 1 -- automatic miss

### Damage Roll

```
Damage Dice + Modifier
```

Example: Greatsword = 2d6 + STR modifier

### Damage Types (13)

| Type | Common Sources |
|------|----------------|
| Bludgeoning | Clubs, fists, falls |
| Piercing | Arrows, spears, bites |
| Slashing | Swords, claws |
| Fire | Fireball, dragons |
| Cold | Cone of Cold, ice |
| Lightning | Shocking Grasp |
| Thunder | Thunderwave |
| Acid | Black Dragon, spells |
| Poison | Snakes, Poison Spray |
| Necrotic | Undead, Vampiric Touch |
| Radiant | Divine Smite, angels |
| Force | Magic Missile, Eldritch Blast |
| Psychic | Mind Flayers |

### Resistances and Immunities

- **Resistance:** Half damage (rounded down)
- **Immunity:** No damage
- **Vulnerability:** Double damage

---

## Saving Throws

```
d20 + Save Modifier vs. DC
```

### Save Types

| Save | Typical Effects |
|------|-----------------|
| STR | Grapple, Shove, Push |
| DEX | Fireball, Lightning, AoE |
| CON | Poison, Disease, Concentration |
| INT | Illusions, Psychic |
| WIS | Charm, Fear, Mind Control |
| CHA | Banishment, Possession |

### Save Success

- **"half":** Half damage on success
- **"none":** No effect on success
- **Partial:** Reduced effect (spell-specific)

---

## Conditions (15)

| Condition | Combat Effect |
|-----------|---------------|
| **Blinded** | Disadvantage on attacks; attacks against you have advantage |
| **Charmed** | Cannot attack the charmer; charmer has advantage on social checks |
| **Frightened** | Disadvantage on checks/attacks while source is visible; cannot move closer |
| **Grappled** | Speed = 0 |
| **Incapacitated** | No actions or reactions |
| **Paralyzed** | Incapacitated + auto-fail STR/DEX saves + attacks have advantage + crits within 5 ft |
| **Petrified** | Incapacitated + resistance to all + immune to poison/disease |
| **Poisoned** | Disadvantage on attacks and ability checks |
| **Prone** | Melee attacks have advantage; ranged attacks have disadvantage |
| **Restrained** | Speed = 0; disadvantage on DEX saves; attacks against you have advantage |
| **Stunned** | Incapacitated + auto-fail STR/DEX saves + attacks have advantage |
| **Unconscious** | Incapacitated + drop items + prone + auto-fail STR/DEX + auto-crit within 5 ft |
| **Exhaustion** | 6 levels, cumulative (level 6 = death) |
| **Invisible** | Advantage on attacks; attacks against you have disadvantage |
| **Deafened** | Cannot hear |

### "Hard CC" for Analysis

Particularly dangerous conditions (flagged as risk indicators):
- **Paralyzed** -- auto-crits
- **Stunned** -- loss of action + vulnerability
- **Unconscious** -- like paralyzed + prone
- **Incapacitated** -- no actions possible

---

## Spellcasting

### Spell Slots

| Level | Slot Level 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|-------|-------------|---|---|---|---|---|---|---|---|
| 1 | 2 | - | - | - | - | - | - | - | - |
| 5 | 4 | 3 | 2 | - | - | - | - | - | - |
| 9 | 4 | 3 | 3 | 3 | 1 | - | - | - | - |
| 13 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
| 17 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

### Concentration

- Only **1 concentration spell** active at a time
- On taking damage: CON save (DC = 10 or half damage, whichever is higher)
- On failure: Spell ends

---

## Legendary Creatures

### Legendary Actions (LA)

- 3 LA per round (typical)
- Used at the end of another creature's turn
- Regenerate at the start of the creature's own turn

### Legendary Resistance (LR)

- 3 LR per day (typical)
- Can turn a failed save into an automatic success
- **Critical for analysis:** LR makes crowd control unreliable

### Lair Actions

- Initiative count 20 (loses ties)
- Additional effects within the lair
- Mostly environmental/control effects

---

## Challenge Rating (CR)

### XP by CR

| CR | XP | CR | XP |
|----|----|----|-----|
| 0 | 10 | 5 | 1,800 |
| 1/8 | 25 | 8 | 3,900 |
| 1/4 | 50 | 10 | 5,900 |
| 1/2 | 100 | 13 | 10,000 |
| 1 | 200 | 17 | 18,000 |
| 2 | 450 | 20 | 25,000 |
| 3 | 700 | 24 | 62,000 |
| 4 | 1,100 | 30 | 155,000 |

### DMG Difficulty Thresholds (per Character)

| Level | Easy | Medium | Hard | Deadly |
|-------|------|--------|------|--------|
| 1 | 25 | 50 | 75 | 100 |
| 5 | 250 | 500 | 750 | 1,100 |
| 10 | 600 | 1,200 | 1,900 | 2,800 |
| 15 | 1,100 | 2,100 | 3,200 | 4,800 |
| 20 | 2,800 | 4,300 | 5,700 | 8,500 |

### Encounter Multiplier

| # of Monsters | Multiplier |
|---------------|------------|
| 1 | x1 |
| 2 | x1.5 |
| 3-6 | x2 |
| 7-10 | x2.5 |
| 11-14 | x3 |
| 15+ | x4 |

**The problem with CR:** It ignores synergies, abilities, and party composition.

---

## Metrics Relevant to Arcanalyse

### Offensive Metrics

- **DPR (Damage per Round):** Expected damage per round
- **Nova Damage:** Maximum burst in a single round
- **To-Hit vs. AC:** Hit probability
- **AoE Potential:** How many targets simultaneously?

### Defensive Metrics

- **Effective HP:** HP adjusted for resistances/AC
- **Save Proficiencies:** Which saves are strong?
- **Condition Immunities:** Immune to important CC?

### Risk Flags

- **One-Shot Potential:** Can damage exceed a party member's HP?
- **Hard CC:** Paralysis, stun, unconscious?
- **TPK Spells:** Power Word Kill, Disintegrate?
- **Action Economy Imbalance:** Significantly more/fewer actions than the party?

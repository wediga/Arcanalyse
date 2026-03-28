# Difficulty Metrics

This document describes the metrics Arcanalyse will use for encounter difficulty assessment.

**Note:** These metrics are part of the planned heuristic and simulation layers. They describe the intended approach, not a current implementation.

## Baseline: DMG Method (CR/XP)

### Calculation

1. Sum XP of all monsters
2. Apply encounter multiplier (based on monster count)
3. Compare against party thresholds

```python
def calculate_dmg_difficulty(monsters, party_size, party_level):
    total_xp = sum(monster.xp for monster in monsters)
    monster_count = len(monsters)

    # Encounter Multiplier
    if monster_count == 1:
        multiplier = 1.0
    elif monster_count == 2:
        multiplier = 1.5
    elif monster_count <= 6:
        multiplier = 2.0
    elif monster_count <= 10:
        multiplier = 2.5
    elif monster_count <= 14:
        multiplier = 3.0
    else:
        multiplier = 4.0

    adjusted_xp = total_xp * multiplier

    # Compare against thresholds
    thresholds = get_thresholds(party_level) * party_size

    if adjusted_xp < thresholds.easy:
        return "Trivial"
    elif adjusted_xp < thresholds.medium:
        return "Easy"
    elif adjusted_xp < thresholds.hard:
        return "Medium"
    elif adjusted_xp < thresholds.deadly:
        return "Hard"
    else:
        return "Deadly"
```

### Problems with the DMG Method

1. **Ignores monster abilities** -- A CR 5 with Paralyze is not equal to a CR 5 without
2. **Ignores party composition** -- 4 martials vs. 4 casters play differently
3. **Ignores synergies** -- Monsters that buff each other
4. **"Deadly" does not mean "TPK"** -- Deadly can mean 0 or 3 deaths

---

## Extended Metrics

### 1. Action Economy Index

```
AE_Index = (Monster_Actions + LA + Lair) / Party_Actions
```

| Index | Interpretation |
|-------|----------------|
| < 0.5 | Party dominates, trivial |
| 0.5 - 0.8 | Party advantage |
| 0.8 - 1.2 | Balanced |
| 1.2 - 1.5 | Monster advantage |
| > 1.5 | Monsters dominate, dangerous |

**Example:**
- Party: 4 players -- 4 actions
- 1 Adult Dragon: 1 action + 3 LA = 4 effective actions
- AE_Index = 4/4 = 1.0 (balanced)

### 2. Damage per Round (DPR) Analysis

```python
def calculate_monster_dpr(monster, target_ac):
    """
    Calculate expected damage per round.
    """
    total_dpr = 0

    for action in monster.actions:
        if action.attack_bonus:
            hit_chance = (21 - (target_ac - action.attack_bonus)) / 20
            hit_chance = max(0.05, min(0.95, hit_chance))  # 5%-95% bounds

            avg_damage = calculate_average_dice(action.damage)
            total_dpr += hit_chance * avg_damage

    return total_dpr
```

**DPR-based metrics:**

| Metric | Formula | Meaning |
|--------|---------|---------|
| Rounds to Kill Party | Party_Total_HP / Monster_DPR | How long does the party survive? |
| Rounds to Kill Monsters | Monster_Total_HP / Party_DPR | How long until victory? |
| DPR Ratio | Party_DPR / Monster_DPR | Who deals more damage? |

### 3. Effective HP

```python
def calculate_effective_hp(creature, attacker_damage_types):
    """
    HP adjusted for resistances against expected damage types.
    """
    ehp = creature.hp

    for damage_type in attacker_damage_types:
        if damage_type in creature.immunities:
            # Effectively infinite HP against this type
            continue
        elif damage_type in creature.resistances:
            # Double HP against this type
            ehp *= 1.5  # Approximation
        elif damage_type in creature.vulnerabilities:
            ehp *= 0.75  # Approximation

    # AC adjustment (higher AC = more effective HP)
    ac_factor = creature.ac / 15  # 15 as baseline
    ehp *= ac_factor

    return ehp
```

### 4. Save Profile Match

How well do party save DCs match against monster saves?

```python
def analyze_save_matchup(party, monsters):
    """
    Analyze whether party spells are effective against monster saves.
    """
    party_save_dcs = extract_party_save_dcs(party)  # e.g., {"wis": 15, "dex": 14}

    results = {}
    for save_type, dc in party_save_dcs.items():
        monster_avg_save = average([m.saves.get(save_type, m.ability_mod(save_type))
                                    for m in monsters])
        success_chance = (dc - monster_avg_save - 1) / 20
        results[save_type] = max(0.05, min(0.95, success_chance))

    return results
```

---

## Risk Flags

Binary warnings for dangerous situations.

### One-Shot Potential

```python
def check_oneshot_potential(monsters, party):
    """
    Can a monster kill a party member in a single hit?
    """
    min_party_hp = min(member.hp for member in party)

    for monster in monsters:
        max_damage = calculate_max_damage(monster)  # All crits, max rolls
        if max_damage >= min_party_hp:
            return True, monster, max_damage

    return False, None, 0
```

### Hard CC Presence

```python
HARD_CC_CONDITIONS = {"paralyzed", "stunned", "unconscious", "petrified"}

def check_hard_cc(monsters):
    """
    Do monsters have hard crowd control abilities?
    """
    for monster in monsters:
        for ability in monster.actions + monster.special_abilities:
            if any(cc in ability.description.lower() for cc in HARD_CC_CONDITIONS):
                # Check if there is a save
                if ability.dc:
                    return True, ability

    return False, None
```

### AoE Spike Potential

```python
def check_aoe_spike(monsters, party_size):
    """
    Can an AoE deal significant damage to multiple targets?
    """
    for monster in monsters:
        for action in monster.actions:
            if action.area_of_effect:
                potential_targets = estimate_aoe_targets(action.aoe, party_size)
                total_potential = calculate_average_dice(action.damage) * potential_targets

                if total_potential > party_average_hp * 0.5:
                    return True, action, total_potential

    return False, None, 0
```

### Legendary Resistance Warning

```python
def check_legendary_resistance(monsters, party):
    """
    Warning when monsters have LR and the party is CC-heavy.
    """
    lr_monsters = [m for m in monsters if m.legendary_resistances > 0]

    if lr_monsters and party_relies_on_save_spells(party):
        return True, f"{len(lr_monsters)} monster(s) with Legendary Resistance"

    return False, None
```

---

## Composite Difficulty Score

Combines all metrics into a single score.

```python
def calculate_difficulty_score(encounter):
    """
    0-100 score where:
    - 0-20: Trivial
    - 20-40: Easy
    - 40-60: Medium
    - 60-80: Hard
    - 80-100: Deadly/TPK risk
    """
    scores = {
        "dmg_difficulty": map_dmg_to_score(encounter.dmg_difficulty),
        "action_economy": map_ae_to_score(encounter.action_economy_index),
        "dpr_ratio": map_dpr_to_score(encounter.dpr_ratio),
        "risk_flags": count_risk_flags(encounter) * 10,
    }

    # Weights
    weights = {
        "dmg_difficulty": 0.2,
        "action_economy": 0.25,
        "dpr_ratio": 0.35,
        "risk_flags": 0.2,
    }

    return sum(scores[k] * weights[k] for k in scores)
```

---

## Simulation-based Metrics

When Monte Carlo simulation is available:

| Metric | Description |
|--------|-------------|
| **Party Win Rate** | % of simulations with party victory |
| **TPK Rate** | % of simulations with Total Party Kill |
| **Expected Rounds** | Average combat duration |
| **Variance / Swinginess** | Standard deviation of outcomes |
| **Expected Casualties** | Average deaths per combat |

These metrics are more precise than heuristics but more computationally expensive.

---

## Open Questions

1. **Metric weighting** -- How much does action economy count vs. DPR?
2. **Party modeling** -- How detailed must the party be for good predictions?
3. **Simulation simplifications** -- Which rules can be simplified?

These will be answered iteratively through testing and user feedback.

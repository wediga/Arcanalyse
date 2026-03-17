# Schwierigkeits-Metriken

Dieses Dokument beschreibt die Metriken, die Arcanalyse zur Schwierigkeitsbewertung verwendet.

## Baseline: DMG-Methode (CR/XP)

### Berechnung

1. XP aller Monster summieren
2. Encounter Multiplier anwenden (basierend auf Anzahl)
3. Mit Party-Thresholds vergleichen

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

    # Vergleich mit Thresholds
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

### Probleme mit DMG-Methode

1. **Ignoriert Monster-Abilities** - Ein CR 5 mit Paralyze ≠ CR 5 ohne
2. **Ignoriert Party-Composition** - 4 Martials vs. 4 Casters spielen anders
3. **Ignoriert Synergien** - Monster, die sich verstärken
4. **"Deadly" ist nicht "TPK"** - Deadly kann 0 oder 3 Tode bedeuten

---

## Erweiterte Metriken

### 1. Action Economy Index

```
AE_Index = (Monster_Actions + LA + Lair) / Party_Actions
```

| Index | Interpretation |
|-------|----------------|
| < 0.5 | Party dominiert, trivial |
| 0.5 - 0.8 | Party-Vorteil |
| 0.8 - 1.2 | Ausgeglichen |
| 1.2 - 1.5 | Monster-Vorteil |
| > 1.5 | Monster dominieren, gefährlich |

**Beispiel:**
- Party: 4 Players → 4 Actions
- 1 Adult Dragon: 1 Action + 3 LA = 4 effective Actions
- AE_Index = 4/4 = 1.0 (ausgeglichen)

### 2. Damage per Round (DPR) Analyse

```python
def calculate_monster_dpr(monster, target_ac):
    """
    Berechne erwarteten Damage pro Runde.
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

**DPR-basierte Metriken:**

| Metrik | Formel | Bedeutung |
|--------|--------|-----------|
| Rounds to Kill Party | Party_Total_HP / Monster_DPR | Wie lange hält Party? |
| Rounds to Kill Monsters | Monster_Total_HP / Party_DPR | Wie lange dauert Sieg? |
| DPR Ratio | Party_DPR / Monster_DPR | Wer dealt mehr? |

### 3. Effective HP

```python
def calculate_effective_hp(creature, attacker_damage_types):
    """
    HP adjusted für Resistances gegen erwartete Damage-Typen.
    """
    ehp = creature.hp

    for damage_type in attacker_damage_types:
        if damage_type in creature.immunities:
            # Effektiv unendlich HP gegen diesen Typ
            continue
        elif damage_type in creature.resistances:
            # Doppelte HP gegen diesen Typ
            ehp *= 1.5  # Approximation
        elif damage_type in creature.vulnerabilities:
            ehp *= 0.75  # Approximation

    # AC-Adjustment (höhere AC = mehr effective HP)
    ac_factor = creature.ac / 15  # 15 als Baseline
    ehp *= ac_factor

    return ehp
```

### 4. Save Profile Match

Wie gut matchen Party-Save-DCs mit Monster-Saves?

```python
def analyze_save_matchup(party, monsters):
    """
    Analysiere ob Party-Spells gegen Monster-Saves effektiv sind.
    """
    party_save_dcs = extract_party_save_dcs(party)  # z.B. {"wis": 15, "dex": 14}

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

Binäre Warnungen für gefährliche Situationen.

### One-Shot Potential

```python
def check_oneshot_potential(monsters, party):
    """
    Kann ein Monster einen Party-Member in einem Hit töten?
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
    Haben Monster Hard CC Abilities?
    """
    for monster in monsters:
        for ability in monster.actions + monster.special_abilities:
            if any(cc in ability.description.lower() for cc in HARD_CC_CONDITIONS):
                # Prüfe ob es einen Save gibt
                if ability.dc:
                    return True, ability

    return False, None
```

### AoE Spike Potential

```python
def check_aoe_spike(monsters, party_size):
    """
    Kann ein AoE signifikanten Damage an mehrere Targets machen?
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
    Warnung wenn Monster LR haben und Party CC-heavy ist.
    """
    lr_monsters = [m for m in monsters if m.legendary_resistances > 0]

    if lr_monsters and party_relies_on_save_spells(party):
        return True, f"{len(lr_monsters)} Monster mit Legendary Resistance"

    return False, None
```

---

## Composite Difficulty Score

Kombiniert alle Metriken zu einem Score.

```python
def calculate_difficulty_score(encounter):
    """
    0-100 Score, wobei:
    - 0-20: Trivial
    - 20-40: Easy
    - 40-60: Medium
    - 60-80: Hard
    - 80-100: Deadly/TPK-Risk
    """
    scores = {
        "dmg_difficulty": map_dmg_to_score(encounter.dmg_difficulty),
        "action_economy": map_ae_to_score(encounter.action_economy_index),
        "dpr_ratio": map_dpr_to_score(encounter.dpr_ratio),
        "risk_flags": count_risk_flags(encounter) * 10,
    }

    # Gewichtung
    weights = {
        "dmg_difficulty": 0.2,
        "action_economy": 0.25,
        "dpr_ratio": 0.35,
        "risk_flags": 0.2,
    }

    return sum(scores[k] * weights[k] for k in scores)
```

---

## Simulation-basierte Metriken

Wenn Monte-Carlo-Simulation verfügbar:

| Metrik | Beschreibung |
|--------|--------------|
| **Party Win Rate** | % der Simulationen mit Party-Sieg |
| **TPK Rate** | % der Simulationen mit Total Party Kill |
| **Expected Rounds** | Durchschnittliche Kampfdauer |
| **Variance / Swinginess** | Standardabweichung der Outcomes |
| **Expected Casualties** | Durchschnittliche Tode pro Kampf |

Diese Metriken sind präziser als Heuristiken, aber rechenintensiver.

---

## Offene Fragen

1. **Gewichtung der Metriken** - Wie stark zählt Action Economy vs. DPR?
2. **Party-Modeling** - Wie detailliert muss Party sein für gute Vorhersagen?
3. **Simulation Simplifications** - Welche Regeln können wir vereinfachen?

→ Werden iterativ durch Testing und User-Feedback beantwortet.

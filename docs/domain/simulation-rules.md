# Simulation Rules

This document describes the simplifications and rules for Arcanalyse's Monte Carlo combat simulation.

**Note:** The simulation engine is planned for development in later phases. This document describes the intended design, not a current implementation.

## Goal of the Simulation

The simulation runs thousands of combats and measures:
- **Win Rate:** How often does the party win?
- **TPK Rate:** How often does the entire party die?
- **Expected Rounds:** Average combat duration
- **Variance:** How "swingy" is the combat?

## Simplifications (MVP)

D&D 5e has too many rules for a complete simulation. These simplifications keep the simulation tractable:

### 1. Positioning: Zone-based

- **Reality:** Grid-based movement, opportunity attacks, cover
- **Simulation:** Zone-based system (melee range, ranged range, far) instead of full grid
- **Impact:** AoE targeting uses zone-based estimates rather than exact positioning

### 2. Tactics: Behavioral Presets

**Monster targeting:**
```python
def select_target(attacker, enemies):
    # Priority: Lowest HP first (focus fire)
    return min(enemies, key=lambda e: e.current_hp)
```

**Action selection:**
```python
def select_action(creature, context):
    # Simplified: Use best available action
    # Later: Smarter AI with situation awareness
    if creature.can_use_aoe and len(context.enemies) >= 3:
        return creature.best_aoe_action
    return creature.best_single_target_action
```

Four tactical AI presets are planned: mindless, predator, tactical, and intelligent.

### 3. Concentration: Simplified

- Concentration spells are tracked
- On damage: CON save (DC 10 or damage/2)
- On failure: Spell ends
- **Simplification:** No strategic concentration breaking

### 4. Healing: Reactive

```python
def should_heal(healer, ally):
    # Heal when ally is below 25% HP
    return ally.current_hp < ally.max_hp * 0.25
```

### 5. Legendary Actions: End of Round

- Monsters with LA use all 3 at the end of each round
- **Simplification:** Optimal distribution rather than strategic timing

### 6. Lair Actions: Initiative 20

- Lair actions fire automatically on initiative 20
- Effect is applied to a random party member

---

## Simulation Loop

```python
def simulate_combat(encounter, iterations=1000):
    results = []

    for _ in range(iterations):
        state = initialize_combat_state(encounter)

        while not state.is_over:
            state = simulate_round(state)

        results.append(CombatResult(
            winner="party" if state.party_alive else "monsters",
            rounds=state.round_count,
            party_deaths=state.party_deaths,
            party_remaining_hp=state.party_remaining_hp,
        ))

    return aggregate_results(results)
```

### Round Simulation

```python
def simulate_round(state):
    # Sort by initiative (already rolled at combat start)
    for combatant in state.initiative_order:
        if combatant.is_alive:
            action = select_action(combatant, state)
            state = execute_action(action, state)

            # Check for combat end
            if state.is_over:
                break

    # Legendary actions (for monsters with LA)
    for monster in state.monsters_with_la:
        if monster.is_alive:
            state = execute_legendary_actions(monster, state)

    # Lair actions
    if state.has_lair_actions:
        state = execute_lair_action(state)

    state.round_count += 1
    return state
```

### Action Execution

```python
def execute_attack(attack, attacker, target):
    # Roll to hit
    roll = random.randint(1, 20)

    if roll == 1:
        return Miss()
    elif roll == 20:
        # Critical hit: double damage dice
        damage = roll_damage(attack.damage, critical=True)
        return Hit(damage, critical=True)
    elif roll + attack.attack_bonus >= target.ac:
        damage = roll_damage(attack.damage, critical=False)
        return Hit(damage, critical=False)
    else:
        return Miss()

def execute_save_ability(ability, attacker, targets):
    results = []
    for target in targets:
        save_roll = random.randint(1, 20) + target.get_save_bonus(ability.dc_type)

        if save_roll >= ability.dc_value:
            # Success
            if ability.dc_success == "half":
                damage = roll_damage(ability.damage) // 2
            else:
                damage = 0
        else:
            # Fail
            damage = roll_damage(ability.damage)
            # Apply conditions if any
            if ability.condition:
                target.add_condition(ability.condition)

        results.append(SaveResult(target, damage, save_roll >= ability.dc_value))

    return results
```

---

## Damage Calculation

```python
def roll_damage(damage_spec, critical=False):
    """
    damage_spec: [{"damage_type": "fire", "damage_dice": "2d6+3"}]
    """
    total = 0

    for damage in damage_spec:
        dice_count, dice_size, modifier = parse_dice(damage["damage_dice"])

        if critical:
            dice_count *= 2

        for _ in range(dice_count):
            total += random.randint(1, dice_size)

        total += modifier

    return max(0, total)

def parse_dice(dice_str):
    """Parse '2d6+3' into (2, 6, 3)"""
    # Implementation...
    pass
```

### Resistance/Immunity Application

```python
def apply_damage(target, damage, damage_type):
    if damage_type in target.immunities:
        return 0
    elif damage_type in target.resistances:
        damage = damage // 2
    elif damage_type in target.vulnerabilities:
        damage = damage * 2

    target.current_hp -= damage
    return damage
```

---

## Death and Unconscious

### Monster Death
```python
if monster.current_hp <= 0:
    monster.is_alive = False
    # Remove from initiative
```

### Player Character Death (Simplified for MVP)

```python
if character.current_hp <= 0:
    character.is_unconscious = True
    character.death_saves = {"successes": 0, "failures": 0}

# Death saves (at the start of turn when unconscious)
def roll_death_save(character):
    roll = random.randint(1, 20)

    if roll == 1:
        character.death_saves["failures"] += 2
    elif roll == 20:
        character.current_hp = 1
        character.is_unconscious = False
    elif roll >= 10:
        character.death_saves["successes"] += 1
    else:
        character.death_saves["failures"] += 1

    if character.death_saves["failures"] >= 3:
        character.is_dead = True
    elif character.death_saves["successes"] >= 3:
        character.is_stable = True
```

---

## Combat End Conditions

```python
def check_combat_end(state):
    party_alive = any(c.is_alive and not c.is_unconscious for c in state.party)
    monsters_alive = any(m.is_alive for m in state.monsters)

    if not party_alive:
        return CombatEnd(winner="monsters", tpk=all(c.is_dead for c in state.party))
    elif not monsters_alive:
        return CombatEnd(winner="party", tpk=False)
    else:
        return None  # Combat continues
```

---

## Output Aggregation

```python
def aggregate_results(results):
    total = len(results)
    party_wins = sum(1 for r in results if r.winner == "party")
    tpks = sum(1 for r in results if r.winner == "monsters" and r.tpk)

    rounds = [r.rounds for r in results]

    return SimulationSummary(
        party_win_rate=party_wins / total,
        tpk_rate=tpks / total,
        expected_rounds=statistics.mean(rounds),
        rounds_std_dev=statistics.stdev(rounds),
        expected_party_deaths=statistics.mean(r.party_deaths for r in results),
    )
```

---

## Planned Improvements

1. **Smarter AI:** Tactical decisions (focus healer, save CC for the right moment)
2. **Positioning:** Zone-based movement (melee/ranged/far) with opportunity attack triggers
3. **Resource management:** Spell slots, abilities per rest
4. **Morale/Retreat:** Monsters flee at X% HP

These improvements are planned for later phases, after the base simulation is validated.

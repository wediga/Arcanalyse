# Simulation Rules

Dieses Dokument beschreibt die Vereinfachungen und Regeln für die Monte-Carlo Combat-Simulation.

## Ziel der Simulation

Die Simulation soll tausende Kämpfe durchspielen und dabei messen:
- **Win Rate:** Wie oft gewinnt die Party?
- **TPK Rate:** Wie oft stirbt die gesamte Party?
- **Expected Rounds:** Durchschnittliche Kampfdauer
- **Variance:** Wie "swingy" ist der Kampf?

## Vereinfachungen (MVP)

D&D 5e hat zu viele Regeln für eine vollständige Simulation. Diese Vereinfachungen machen die Simulation tractable:

### 1. Positioning: Ignoriert

- **Realität:** Grid-basiertes Movement, Opportunity Attacks, Cover
- **Simulation:** Alle Combatants können alle Targets erreichen
- **Auswirkung:** AoE trifft immer optimale Anzahl Targets

### 2. Tactics: Einfache Heuristiken

**Monster-Targeting:**
```python
def select_target(attacker, enemies):
    # Priorität: Lowest HP first (focus fire)
    return min(enemies, key=lambda e: e.current_hp)
```

**Spell-Auswahl:**
```python
def select_action(creature, context):
    # Vereinfacht: Nutze beste verfügbare Action
    # Später: Smarter AI mit Situation-Awareness
    if creature.can_use_aoe and len(context.enemies) >= 3:
        return creature.best_aoe_action
    return creature.best_single_target_action
```

### 3. Concentration: Vereinfacht

- Concentration-Spells werden getrackt
- Bei Damage: CON Save (DC 10 oder Damage/2)
- Bei Fail: Spell endet
- **Vereinfachung:** Keine strategische Concentration-Breaking

### 4. Healing: Reaktiv

```python
def should_heal(healer, ally):
    # Heal wenn Ally unter 25% HP
    return ally.current_hp < ally.max_hp * 0.25
```

### 5. Legendary Actions: Am Turn-Ende

- Monster mit LA nutzen alle 3 am Ende jeder Runde
- **Vereinfachung:** Optimale Verteilung statt strategisches Timing

### 6. Lair Actions: Initiative 20

- Lair Actions feuern automatisch auf Initiative 20
- Effekt wird auf zufälliges Party-Member angewendet

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

    # Legendary Actions (für Monster mit LA)
    for monster in state.monsters_with_la:
        if monster.is_alive:
            state = execute_legendary_actions(monster, state)

    # Lair Actions
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
    """Parse "2d6+3" into (2, 6, 3)"""
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

## Death & Unconscious

### Monster Death
```python
if monster.current_hp <= 0:
    monster.is_alive = False
    # Entfernen aus Initiative
```

### Player Character Death (Vereinfacht für MVP)

```python
if character.current_hp <= 0:
    character.is_unconscious = True
    character.death_saves = {"successes": 0, "failures": 0}

# Death Saves (am Start des Turns wenn unconscious)
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

## Zukünftige Verbesserungen

1. **Smarter AI:** Taktische Entscheidungen (Focus Healer, Save CC for right moment)
2. **Positioning:** Simplified Grid (Front/Back Line)
3. **Resource Management:** Spell Slots, Abilities per Rest
4. **Morale/Retreat:** Monster fliehen bei X% HP

Diese kommen nach MVP, wenn die Basis-Simulation validiert ist.

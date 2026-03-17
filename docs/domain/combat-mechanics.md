# D&D 5e Combat-Mechaniken

Dieses Dokument beschreibt die D&D 5e Regeln, die für Arcanalyse relevant sind.

## Grundlegende Combat-Struktur

### Initiative & Runden

1. Jede Kreatur würfelt **Initiative** (d20 + DEX Modifier)
2. Reihenfolge: Höchste Initiative zuerst
3. Jede Runde: Jede Kreatur hat **1 Turn**
4. Turn besteht aus: **Action**, **Bonus Action**, **Movement**, **Reaction** (1x bis zum nächsten Turn)

### Action Economy

| Ressource | Pro Turn | Beispiele |
|-----------|----------|-----------|
| Action | 1 | Attack, Cast Spell, Dash, Dodge |
| Bonus Action | 1 | Offhand Attack, einige Spells |
| Movement | Speed ft. | Walk, Fly, Swim |
| Reaction | 1 (bis nächster Turn) | Opportunity Attack, Shield |
| Free Action | Beliebig | Drop Item, Speak |

**Warum Action Economy wichtig ist:**
- 4 Goblins (4 Actions) > 1 Ogre (1 Action) bei gleicher XP
- Legendary Actions umgehen das 1-Action-Limit
- Lair Actions geben zusätzliche Aktionen

---

## Angriffe & Damage

### Attack Roll

```
d20 + Attack Bonus vs. AC
```

- **Hit:** Roll >= AC
- **Critical Hit:** Natural 20 → Double Damage Dice
- **Critical Miss:** Natural 1 → Auto-Miss

### Damage Roll

```
Damage Dice + Modifier
```

Beispiel: Greatsword = 2d6 + STR Modifier

### Damage Types (13)

| Type | Häufig bei |
|------|------------|
| Bludgeoning | Clubs, Fists, Falls |
| Piercing | Arrows, Spears, Bites |
| Slashing | Swords, Claws |
| Fire | Fireball, Dragons |
| Cold | Cone of Cold, Ice |
| Lightning | Shocking Grasp |
| Thunder | Thunderwave |
| Acid | Black Dragon, Spells |
| Poison | Snakes, Poison Spray |
| Necrotic | Undead, Vampiric Touch |
| Radiant | Divine Smite, Angels |
| Force | Magic Missile, Eldritch Blast |
| Psychic | Mind Flayers |

### Resistances & Immunities

- **Resistance:** Half Damage (rounded down)
- **Immunity:** No Damage
- **Vulnerability:** Double Damage

---

## Saving Throws

```
d20 + Save Modifier vs. DC
```

### Save-Typen

| Save | Typische Effekte |
|------|------------------|
| STR | Grapple, Shove, Push |
| DEX | Fireball, Lightning, AoE |
| CON | Poison, Disease, Concentration |
| INT | Illusions, Psychic |
| WIS | Charm, Fear, Mind Control |
| CHA | Banishment, Possession |

### DC-Erfolg

- **"half":** Halber Damage bei Erfolg
- **"none":** Kein Effekt bei Erfolg
- **Partial:** Reduzierter Effekt (spell-spezifisch)

---

## Conditions (15)

| Condition | Combat-Effekt |
|-----------|---------------|
| **Blinded** | Disadvantage on Attacks, Attacks gegen dich haben Advantage |
| **Charmed** | Kann Charmer nicht angreifen, Charmer hat Advantage auf Social Checks |
| **Frightened** | Disadvantage on Checks/Attacks wenn Quelle sichtbar, kann sich nicht nähern |
| **Grappled** | Speed = 0 |
| **Incapacitated** | Keine Actions oder Reactions |
| **Paralyzed** | Incapacitated + Auto-Fail STR/DEX Saves + Attacks haben Advantage + Crits in 5ft |
| **Petrified** | Incapacitated + Resistance to all + Immune to Poison/Disease |
| **Poisoned** | Disadvantage on Attacks und Ability Checks |
| **Prone** | Melee Attacks haben Advantage, Ranged haben Disadvantage |
| **Restrained** | Speed = 0, Disadvantage on DEX Saves, Attacks gegen dich haben Advantage |
| **Stunned** | Incapacitated + Auto-Fail STR/DEX Saves + Attacks haben Advantage |
| **Unconscious** | Incapacitated + Drop Items + Prone + Auto-Fail STR/DEX + Auto-Crit in 5ft |
| **Exhaustion** | 6 Stufen, kumulativ (Level 6 = Tod) |
| **Invisible** | Advantage on Attacks, Attacks gegen dich haben Disadvantage |
| **Deafened** | Kann nicht hören |

### "Hard CC" für Analyse

Besonders gefährliche Conditions (für Risk Flags):
- **Paralyzed** - Auto-Crits
- **Stunned** - Verlust von Action + Vulnerability
- **Unconscious** - Wie Paralyzed + Prone
- **Incapacitated** - Kein Handeln möglich

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

- Nur **1 Concentration-Spell** gleichzeitig aktiv
- Bei Damage: CON Save (DC = 10 oder Half Damage, höherer Wert)
- Bei Fail: Spell endet

---

## Legendary Creatures

### Legendary Actions (LA)

- 3 LA pro Runde (typisch)
- Verwendet am Ende eines anderen Creature's Turn
- Regenerieren am Start des eigenen Turns

### Legendary Resistance (LR)

- 3 LR pro Tag (typisch)
- Kann failed Save automatisch in Success verwandeln
- **Kritisch für Analyse:** LR macht CC unzuverlässig

### Lair Actions

- Initiative Count 20 (loses ties)
- Zusätzliche Effekte im Lair
- Meist Environmental/Control

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

**Problem mit CR:** Ignoriert Synergien, Abilities, Party-Zusammensetzung.

---

## Für Arcanalyse relevante Metriken

### Offensive Metriken

- **DPR (Damage per Round):** Erwarteter Damage pro Runde
- **Nova Damage:** Maximaler Burst in einer Runde
- **To-Hit vs. AC:** Trefferwahrscheinlichkeit
- **AoE Potential:** Wie viele Targets gleichzeitig?

### Defensive Metriken

- **Effective HP:** HP adjusted für Resistances/AC
- **Save Proficiencies:** Welche Saves sind stark?
- **Condition Immunities:** Immun gegen wichtige CC?

### Risk Flags

- **One-Shot Potential:** Kann Damage > Party-Member HP?
- **Hard CC:** Paralysis, Stun, Unconscious?
- **TPK Spells:** Power Word Kill, Disintegrate?
- **Action Economy Imbalance:** Viel mehr/weniger Actions als Party?

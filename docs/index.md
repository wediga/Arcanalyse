# Arcanalyse

**D&D 5e Encounter & Combat Balancing Tool**

## Vision

Arcanalyse hilft Dungeon Masters dabei, Kämpfe realistischer einzuschätzen als mit den statischen CR/XP-Heuristiken des DMG. Das Ziel ist präzise Schwierigkeitsvorhersagen durch fortgeschrittene Analyse und Simulation.

## Kernprobleme die wir lösen

1. **CR ist unzuverlässig** - Ein CR 5 Monster kann trivial oder tödlich sein, je nach Party-Zusammensetzung
2. **Action Economy wird ignoriert** - 4 Goblins sind gefährlicher als 1 Ogre gleicher XP
3. **Swingy Encounters** - Manche Kämpfe kippen durch einen Crit oder Failed Save
4. **Keine Risiko-Transparenz** - DMs wissen nicht, wie wahrscheinlich ein TPK ist

## Zielgruppen

| Gruppe | Nutzung |
|--------|---------|
| **Dungeon Masters** (primär) | Encounter-Design, Balancing, Vorab-Check |
| **Power-User / Spielgruppen** | Party-Planung, "Was wäre wenn"-Szenarien |
| **VTT-User** (später) | Foundry/Roll20 Integration |

## MVP-Scope

1. **Encounter Builder** - Party + Gegner definieren und speichern
2. **Schwierigkeitsanalyse** - CR/XP + erweiterte Metriken + Risk Flags
3. **Monte-Carlo Simulation** - Winrate, TPK-Wahrscheinlichkeit, Varianz

## Projektstruktur

```
arcanalyse-api      → FastAPI Backend (REST API)
├── arcanalyse-core → Domain-Logik, Analyse-Engine, Simulation
├── arcanalyse-db   → SQLModel + PostgreSQL, Persistence
└── arcanalyse-training → Erweiterte Analyse-Pipeline
```

## Weiterführende Dokumentation

- [Architektur-Übersicht](architecture/overview.md)
- [Datenmodell](architecture/data-model.md)
- [D&D Combat-Mechaniken](domain/combat-mechanics.md)
- [Entwickler-Setup](dev/setup.md)

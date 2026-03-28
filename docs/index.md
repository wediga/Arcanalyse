# Arcanalyse

**D&D 5e Encounter Difficulty Analysis Tool**

## What is Arcanalyse?

Arcanalyse is a web tool for D&D 5e Dungeon Masters that evaluates encounter difficulty through Monte Carlo combat simulation, replacing the notoriously unreliable Challenge Rating (CR) system. Instead of guessing whether an encounter is balanced, DMs get actual win rates, TPK probabilities, and risk flags based on thousands of simulated combats.

## The Problem

The CR system from the Dungeon Master's Guide has well-known shortcomings:

1. **CR is unreliable** -- A CR 5 monster can be trivial or lethal depending on party composition
2. **Action economy is ignored** -- 4 goblins are more dangerous than 1 ogre at the same XP
3. **Swingy encounters** -- Some fights swing on a single crit or failed save
4. **No risk transparency** -- DMs have no idea how likely a TPK actually is

## The Solution

Arcanalyse addresses these problems with a dual approach:

- **Heuristic analysis** -- Instant difficulty ratings using DPR analysis, action economy index, and risk flags
- **Monte Carlo simulation** -- Run thousands of combats to get statistical outcomes: win rate, TPK probability, expected rounds, and variance

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.12, FastAPI |
| Domain logic | arcanalyse-core (pure Python, zero dependencies) |
| Database | PostgreSQL 16, SQLModel, Alembic |
| Frontend | Next.js, TypeScript, Tailwind CSS v4 |
| Hosting | Hetzner AX41, Docker, Caddy |

## Project Status

Arcanalyse is in early development. The landing page and infrastructure are live; backend implementation is in progress.

## Documentation

- [Architecture Overview](architecture/overview.md)
- [Data Model](architecture/data-model.md)
- [D&D Combat Mechanics](domain/combat-mechanics.md)
- [Difficulty Metrics](domain/difficulty-metrics.md)
- [Simulation Rules](domain/simulation-rules.md)
- [Developer Setup](dev/setup.md)

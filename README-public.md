# Arcanalyse

> A Python-based D&D 5e encounter balancing and combat simulation tool

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Arcanalyse is a tool designed to help Dungeon Masters create more balanced and engaging combat encounters in D&D 5e. It goes beyond simple CR/XP calculations to provide deeper analysis and simulation-based difficulty predictions.

### Key Features

- **Advanced Encounter Analysis** - Beyond CR: action economy, party composition, and tactical considerations
- **Monte Carlo Combat Simulation** - Statistical outcomes across thousands of simulated battles
- **Multi-Ruleset Support** - Compatible with both D&D 5e 2014 and 2024 rules
- **SRD Integration** - Built-in library of official D&D 5e SRD monsters and spells

## Problem Statement

Traditional CR-based encounter design has significant limitations:

1. **CR is unreliable** - A CR 5 monster can be trivial or deadly depending on party composition
2. **Action economy is ignored** - Four goblins are often more dangerous than one ogre of equivalent XP
3. **High variance** - Some encounters swing wildly based on a single critical hit or failed save
4. **No risk transparency** - DMs don't know the actual probability of a TPK

Arcanalyse addresses these issues by combining deterministic analysis with simulation-based predictions.

## Tech Stack

- **Backend**: Python 3.12, FastAPI
- **Frontend**: Next.js (TypeScript, Tailwind CSS)
- **Database**: PostgreSQL with SQLModel/SQLAlchemy
- **Testing**: pytest
- **Package Management**: uv (workspace-based monorepo)

## Architecture

The project is structured as a uv workspace with multiple packages:

```
arcanalyse-api      → FastAPI REST API
├── arcanalyse-core → Domain logic, analysis engine
├── arcanalyse-db   → Persistence layer (SQLModel)
└── frontend/       → Next.js frontend + landing page
```

## Project Status

**Phase 0 (Validation)** is nearly complete. The landing page is live with email signup, analytics, and user surveys. Backend development starts next.

### Roadmap

- [x] Landing page with email signup
- [x] Analytics and survey infrastructure
- [ ] Core domain types and models
- [ ] Database schema and SRD data import
- [ ] Deterministic difficulty metrics
- [ ] Monte Carlo simulation engine
- [ ] REST API for encounter analysis
- [ ] Web frontend (encounter builder + results)

## Development

### Prerequisites

- Python 3.12+
- Node.js 22+
- PostgreSQL 16+
- [uv](https://github.com/astral-sh/uv) package manager

### Local Setup

```bash
# Clone the repository
git clone https://github.com/wediga/Arcanalyse.git
cd Arcanalyse

# Install Python dependencies
uv sync

# Start test database (PostgreSQL via Docker)
docker compose up -d

# Run tests
uv run pytest

# Start frontend (development)
cd frontend
npm install
npm run dev
```

For detailed setup instructions, see the [documentation](docs/dev/setup.md).

## Documentation

- **Domain Concepts**: [Combat Mechanics](docs/domain/combat-mechanics.md), [Difficulty Metrics](docs/domain/difficulty-metrics.md)
- **Architecture**: [Overview](docs/architecture/overview.md), [Data Model](docs/architecture/data-model.md)
- **Development**: [Setup Guide](docs/dev/setup.md)

## Contributing

This is currently a personal project. Contributions are not being accepted at this time, but feedback and suggestions are welcome via issues.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- [5e-database](https://github.com/5e-bits/5e-database) - SRD content provider
- D&D 5e System Reference Document (Wizards of the Coast)

---

**Note**: This is an unofficial tool and is not affiliated with or endorsed by Wizards of the Coast.

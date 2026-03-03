# Arcanalyse

A personal Python project to explore building a tool that helps with D&D 5e combat balancing.

## What is this?
Arcanalyse is a project where I try to build something practical while learning how to maintain a larger Python codebase.  
If it turns into a tool others can use too, that’s a bonus.

## Why
Balancing encounters takes time and I often end up guessing. I want something that gives me a more consistent baseline than “gut feeling”, and helps me iterate faster.

## What it aims to do (roughly)
- Model encounters (party, enemies, assumptions)
- Provide a simple baseline score (deterministic)
- Run simulations to see outcomes across many runs
- Produce readable output explaining what influenced the result

## What it is not (for now)
- A full rules engine
- A “perfect” difficulty rating
- A stable API or finished product

## Status
Early development.

## Tech stack (current direction)
- Python
- FastAPI (API)
- SQLModel / SQLAlchemy (data layer)
- pytest (tests)

## Notes on D&D content
If the project includes SRD material, attribution and licensing requirements apply. Non-SRD content is not included.

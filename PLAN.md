# Heartbeat Plan

Purpose: a lean scheduler for a few predictable, low-noise tasks with no tight coupling to other tools.

## Goals

- Keep core scheduling simple and deterministic
- Provide a minimal default that is easy to adopt
- Push complexity to optional packs instead of the core

## Non-Goals

- No complex pipelines or multi-step orchestration
- No real-time triggers or event-driven hooks
- No tight coupling to Engram, Skills, Scout, or Omni

## Assumptions

- Heartbeat runs scheduled commands (cron or launchd).
- Tools are invoked as external CLIs; no shared libraries.
- Secrets stay in environment variables or OS keychain.
- `baseDir` anchors relative task paths.

## Core Scope (Recommended)

Minimal cadence aligned with Claudette’s intended usage:

- Daily: Engram git ingest for the primary repo.
- Weekly: skills scan + skills validate.
- Optional weekly: a single Scout watch (scan + discover) for 1–3 repos.

These live in `configs/heartbeat.core.json` and `configs/packs/scout.json`.

## Optional Packs (Out of Core Scope)

Optional packs live under `configs/packs/` and may be merged manually:

- `engram.json`: multi-repo ingest + batch ingest
- `skills.json`: scan + validate
- `scout.json`: simple watch (not full pipeline)
- `omni.json`: builds, indexing, omni export

## Notes

- Keep the schedule sparse to avoid noise.
- Prefer daily for cheap ingest, weekly for heavier jobs.
- Heartbeat should only orchestrate; each tool stays independent.

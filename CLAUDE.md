# Heartbeat

Language: TypeScript

## Structure

- `src/` core logic
- `tests/` unit tests (Vitest)
- `heartbeat.config.json` default schedule

## Conventions

- Keep scheduling logic deterministic and testable
- Avoid tight coupling with external CLIs; invoke via commands
- Prefer small, composable functions in `src/schedule.ts`

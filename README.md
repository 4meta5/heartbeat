# Heartbeat

Lean scheduler for Engram, Skills, and Scout with a predictable, low-noise cadence.

## Quick start

```bash
npm install
npm run build
node dist/cli.js list
node dist/cli.js print-cron
node dist/cli.js run --dry-run
```

## Config

Default config: `heartbeat.config.json`

- `daily` schedules run at a local time
- `weekly` schedules run on a local weekday + time

## Commands

- `heartbeat list` - show tasks
- `heartbeat print-cron` - emit cron lines for tasks
- `heartbeat run` - run tasks due now

## Notes

Heartbeat orchestrates only. Each tool runs independently.

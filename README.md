# Heartbeat

Lean scheduler for a few predictable, low-noise tasks. It orchestrates external CLIs and stays out of their way.

## Design Principles

- **Orchestration only** - Heartbeat schedules; tools run independently
- **Lean by default** - Core config is intentionally small
- **No complex pipelines** - Each task is self-contained
- **Opt-in complexity** - Extended functionality via optional packs

## Quick start

```bash
npm install
npm run build
node dist/cli.js list --config configs/heartbeat.core.json
node dist/cli.js print-cron --config configs/heartbeat.core.json
node dist/cli.js run --dry-run --config configs/heartbeat.core.json
```

## Base Directory

Use `baseDir` to anchor relative `cwd` and command paths.

- `baseDir: "auto"` resolves to the config directory (same as `baseDir: "."`).
- Set an explicit `baseDir` if your repos live elsewhere.

## Configuration

### Core Config (Recommended)

`configs/heartbeat.core.json` - 3 essential tasks:

| Task | Schedule | Purpose |
|------|----------|---------|
| `engram-ingest-engram` | Daily 18:00 | Fresh commit memory (adjust as needed) |
| `skills-scan` | Mon 09:00 | Skill recommendations |
| `skills-validate` | Mon 09:00 | Validate skill set |

To expand beyond the core, copy tasks from `configs/packs/engram.json` or create new tasks for your active repos.

```bash
node dist/cli.js list --config configs/heartbeat.core.json
```

### Full Config (Legacy)

`configs/heartbeat.full.json` - 20 tasks (everything, including Omni + full Scout pipeline).

```bash
node dist/cli.js list --config configs/heartbeat.full.json
```

### Optional Packs

Extended functionality by tool (in `configs/packs/`):

| Pack | Tasks | Description |
|------|-------|-------------|
| `engram.json` | 4 | Daily ingest for multiple repos + batch ingest |
| `skills.json` | 2 | Scan + validate |
| `scout.json` | 1 | Simple watch (not full pipeline) |
| `omni.json` | 4 | Builds, indexing, omni-export |

Packs are reference configs for extending the core. Copy tasks as needed.

### Default Config

`heartbeat.config.json` is now the minimal core. Use packs to add more tasks.

### Packs: Minimal Merge Example

If you want to extend the core, copy tasks from packs into a single config file.

Example (`heartbeat.config.json` + `configs/packs/scout.json`):

```json
{
  "timezone": "local",
  "baseDir": "auto",
  "tasks": [
    {
      "id": "engram-ingest-engram",
      "schedule": { "type": "daily", "time": "18:00" },
      "cwd": "engram",
      "command": "engram ingest-git --workspace . --days 7"
    },
    {
      "id": "skills-scan",
      "schedule": { "type": "weekly", "day": "mon", "time": "09:00" },
      "cwd": "skills",
      "command": "skills scan --all"
    },
    {
      "id": "skills-validate",
      "schedule": { "type": "weekly", "day": "mon", "time": "09:00" },
      "cwd": "skills",
      "command": "claude-skills-cli validate ~/.claude/skills --lenient"
    },
    {
      "id": "scout-watch-engram",
      "schedule": { "type": "weekly", "day": "fri", "time": "16:00" },
      "cwd": ".",
      "command": "scout scan --root engram && scout discover --root engram"
    }
  ]
}
```

## Commands

- `heartbeat list` - show tasks
- `heartbeat print-cron` - emit cron lines for tasks
- `heartbeat run` - run tasks due now

## Related projects

- Engram: [bobamatcha/engram](https://github.com/bobamatcha/engram)
- Omni: [bobamatcha/omni](https://github.com/bobamatcha/omni)
- Skills: [4meta5/skills](https://github.com/4meta5/skills)
- Scout: [4meta5/scout](https://github.com/4meta5/scout)

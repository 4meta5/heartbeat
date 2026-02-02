# Heartbeat Plan

Purpose: a lean scheduler that keeps Engram, Skills, and Scout in a useful cadence without tight coupling.

## Goals

- Keep project memory fresh (Engram)
- Keep skills relevant and validated (skills CLI)
- Track comparable OSS changes (Scout)
- Provide a predictable, low-noise schedule

## Assumptions

- Heartbeat runs scheduled commands (cron or launchd).
- Tools are invoked as external CLIs; no shared libraries.
- Secrets stay in environment variables or OS keychain.

## Schedule (Default)

### Daily (end of workday)

**Engram: ingest recent commits**

- Command:
  - `engram ingest-git --workspace /path/to/repo --days 7`
- Target repos:
  - `/Users/amar/skillex/engram`
  - `/Users/amar/skillex/scout`
  - `/Users/amar/skillex/skills`
- Rationale: low-cost memory refresh

### Weekly (Monday morning)

**Engram: multi-repo ingest (batch)**

- Command:
  - `DAYS=30 ./scripts/ingest-git-all.sh /Users/amar/skillex/engram /Users/amar/skillex/scout /Users/amar/skillex/skills`
- Rationale: broader memory window + backup of recent activity

**Skills: recommend and validate**

- Command:
  - `skills scan --all`
  - `claude-skills-cli validate ~/.claude/skills --lenient`
- Rationale: keep skill set aligned with current stack

### Weekly (Friday afternoon)

**Scout: derive OSS insights**

- Command per repo:
  - `scout scan --root /Users/amar/skillex/engram`
  - `scout discover --root /Users/amar/skillex/engram`
  - `scout clone --in /Users/amar/skillex/engram/.scout/candidates.tier1.json --out /Users/amar/skillex/engram/.scout`
  - `scout validate --in /Users/amar/skillex/engram/.scout/clone-manifest.json --targets /Users/amar/skillex/engram/.scout/targets.json --out /Users/amar/skillex/engram/.scout`
  - `scout focus --validated /Users/amar/skillex/engram/.scout/validate-summary.json --out /Users/amar/skillex/engram/.scout`
  - `scout compare --validated /Users/amar/skillex/engram/.scout/validate-summary.json --focus /Users/amar/skillex/engram/.scout/focus-index.json --out /Users/amar/skillex/engram/.scout`
- Optional: ingest reports into Engram
  - `engram add "$(cat /Users/amar/skillex/engram/.scout/REPORT.md)" -t scout,report,engram`
- Rationale: periodic OSS context without daily noise

## Code Review Automation (Optional)

If you want scheduled review prompts (no tight coupling):

- Use skills CLI or MCP tools to request a review on recent diffs:
  - `skills run code-review-ts --diff "$(git diff HEAD~1..HEAD)"`
- Recommended cadence: after major merges or weekly.

## Environment Variables

- `GITHUB_TOKEN` (or use `gh auth token` inline for Scout)
- `ANTHROPIC_API_KEY` (only if running Engram summarization)

## Minimal Cron Template

Example (pseudo-cron; replace with your system scheduler):

```
# Daily 6pm
0 18 * * * cd /Users/amar/skillex/engram && engram ingest-git --workspace . --days 7
0 18 * * * cd /Users/amar/skillex/scout && engram ingest-git --workspace . --days 7
0 18 * * * cd /Users/amar/skillex/skills && engram ingest-git --workspace . --days 7

# Weekly Monday 9am
0 9 * * 1 cd /Users/amar/skillex/engram && DAYS=30 ./scripts/ingest-git-all.sh /Users/amar/skillex/engram /Users/amar/skillex/scout /Users/amar/skillex/skills
0 9 * * 1 skills scan --all

# Weekly Friday 4pm (Engram Scout pipeline)
0 16 * * 5 scout scan --root /Users/amar/skillex/engram
0 16 * * 5 scout discover --root /Users/amar/skillex/engram
0 16 * * 5 scout clone --in /Users/amar/skillex/engram/.scout/candidates.tier1.json --out /Users/amar/skillex/engram/.scout
0 16 * * 5 scout validate --in /Users/amar/skillex/engram/.scout/clone-manifest.json --targets /Users/amar/skillex/engram/.scout/targets.json --out /Users/amar/skillex/engram/.scout
0 16 * * 5 scout focus --validated /Users/amar/skillex/engram/.scout/validate-summary.json --out /Users/amar/skillex/engram/.scout
0 16 * * 5 scout compare --validated /Users/amar/skillex/engram/.scout/validate-summary.json --focus /Users/amar/skillex/engram/.scout/focus-index.json --out /Users/amar/skillex/engram/.scout
```

## Notes

- Keep the schedule sparse to avoid noise.
- Prefer batch jobs on weekly cadence; daily only for simple ingest.
- Heartbeat should only orchestrate; each tool stays independent.

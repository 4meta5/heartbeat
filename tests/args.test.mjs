import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../dist/args.js";

test("parseArgs defaults to help", () => {
  assert.deepEqual(parseArgs([]), {
    command: "help",
    configPath: "heartbeat.config.json",
    dryRun: false
  });
});

test("parseArgs reads command and config", () => {
  assert.deepEqual(parseArgs(["list", "--config", "/tmp/hb.json"]), {
    command: "list",
    configPath: "/tmp/hb.json",
    dryRun: false
  });
});

test("parseArgs reads run options", () => {
  assert.deepEqual(
    parseArgs(["run", "--dry-run", "--now", "2026-02-02T18:00:00Z"]),
    {
      command: "run",
      configPath: "heartbeat.config.json",
      dryRun: true,
      now: "2026-02-02T18:00:00Z"
    }
  );
});

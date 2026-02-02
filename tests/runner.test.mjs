import test from "node:test";
import assert from "node:assert/strict";
import { parseConfig } from "../dist/config.js";
import { getDueTasks } from "../dist/runner.js";

test("getDueTasks filters by schedule", () => {
  const config = parseConfig({
    timezone: "utc",
    tasks: [
      { id: "daily", schedule: { type: "daily", time: "18:00" }, command: "echo daily" },
      { id: "weekly", schedule: { type: "weekly", day: "mon", time: "18:00" }, command: "echo weekly" },
      { id: "disabled", schedule: { type: "daily", time: "18:00" }, command: "echo off", enabled: false }
    ]
  });

  const now = new Date("2026-02-02T18:00:00Z");
  const due = getDueTasks(config, now).map((task) => task.id).sort();

  assert.deepEqual(due, ["daily", "weekly"]);
});

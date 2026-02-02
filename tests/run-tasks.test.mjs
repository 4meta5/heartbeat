import test from "node:test";
import assert from "node:assert/strict";
import { runTasks } from "../dist/runner.js";

test("runTasks returns skipped results in dryRun", async () => {
  const results = await runTasks(
    [
      { id: "a", schedule: { type: "daily", time: "18:00" }, command: "echo a" },
      { id: "b", schedule: { type: "weekly", day: "mon", time: "09:00" }, command: "echo b" }
    ],
    { dryRun: true }
  );

  assert.deepEqual(results, [
    { id: "a", status: "skipped" },
    { id: "b", status: "skipped" }
  ]);
});

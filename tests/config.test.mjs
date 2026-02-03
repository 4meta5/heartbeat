import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig, parseConfig } from "../dist/config.js";
import { renderCronLines } from "../dist/cron.js";

test("parseConfig defaults timezone to local", () => {
  const config = parseConfig({
    tasks: [
      { id: "a", schedule: { type: "daily", time: "18:00" }, command: "echo hi" }
    ]
  });

  assert.equal(config.timezone, "local");
  assert.equal(config.tasks.length, 1);
});

test("parseConfig rejects invalid schedule", () => {
  assert.throws(() =>
    parseConfig({
      tasks: [
        { id: "a", schedule: { type: "daily", time: "99:00" }, command: "echo hi" }
      ]
    })
  );
});

test("renderCronLines formats cron entries", () => {
  const config = parseConfig({
    tasks: [
      {
        id: "a",
        schedule: { type: "weekly", day: "mon", time: "09:00" },
        command: "echo hi",
        cwd: "/tmp"
      }
    ]
  });

  assert.deepEqual(renderCronLines(config), ["0 9 * * 1 cd /tmp && echo hi"]);
});

test("loadConfig resolves baseDir auto to config directory", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "heartbeat-"));
  const configPath = path.join(tmpDir, "heartbeat.config.json");

  fs.writeFileSync(
    configPath,
    JSON.stringify({
      baseDir: "auto",
      tasks: [
        {
          id: "a",
          schedule: { type: "daily", time: "18:00" },
          command: "echo hi",
          cwd: "repo"
        }
      ]
    })
  );

  const config = loadConfig(configPath);
  const resolved = path.join(tmpDir, "repo");

  assert.equal(config.baseDir, tmpDir);
  assert.deepEqual(renderCronLines(config), [`0 18 * * * cd ${resolved} && echo hi`]);
});

import fs from "node:fs";
import path from "node:path";
import { scheduleToCron } from "./schedule.js";
import type { Schedule } from "./schedule.js";

export type Task = {
  id: string;
  schedule: Schedule;
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  enabled?: boolean;
};

export type HeartbeatConfig = {
  timezone?: "local" | "utc";
  tasks: Task[];
};

function assertRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected ${label} to be an object`);
  }
  return value as Record<string, unknown>;
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Expected ${label} to be a non-empty string`);
  }
  return value;
}

function parseSchedule(value: unknown, label: string): Schedule {
  const raw = assertRecord(value, label);
  const type = raw.type;
  const time = assertString(raw.time, `${label}.time`);
  if (type === "daily") {
    const schedule: Schedule = { type: "daily", time };
    scheduleToCron(schedule);
    return schedule;
  }
  if (type === "weekly") {
    const day = raw.day;
    if (typeof day !== "string" && typeof day !== "number") {
      throw new Error(`Expected ${label}.day to be a string or number`);
    }
    const schedule: Schedule = { type: "weekly", day, time };
    scheduleToCron(schedule);
    return schedule;
  }
  throw new Error(`Invalid schedule type: ${String(type)}`);
}

function parseTask(value: unknown, index: number): Task {
  const raw = assertRecord(value, `tasks[${index}]`);
  const id = assertString(raw.id, `tasks[${index}].id`);
  const command = assertString(raw.command, `tasks[${index}].command`);
  const schedule = parseSchedule(raw.schedule, `tasks[${index}].schedule`);
  const cwd = raw.cwd === undefined ? undefined : assertString(raw.cwd, `tasks[${index}].cwd`);
  const enabled = raw.enabled === undefined ? undefined : Boolean(raw.enabled);

  let env: Record<string, string> | undefined;
  if (raw.env !== undefined) {
    const envRaw = assertRecord(raw.env, `tasks[${index}].env`);
    env = {};
    for (const [key, val] of Object.entries(envRaw)) {
      env[key] = assertString(val, `tasks[${index}].env.${key}`);
    }
  }

  return { id, command, schedule, cwd, env, enabled };
}

export function parseConfig(data: unknown): HeartbeatConfig {
  const raw = assertRecord(data, "config");
  const timezoneValue = raw.timezone;
  const timezone =
    timezoneValue === undefined
      ? "local"
      : timezoneValue === "local" || timezoneValue === "utc"
        ? timezoneValue
        : (() => {
            throw new Error(`Invalid timezone: ${String(timezoneValue)}`);
          })();

  if (!Array.isArray(raw.tasks)) {
    throw new Error("Expected tasks to be an array");
  }

  const tasks = raw.tasks.map((task, index) => parseTask(task, index));
  return { timezone, tasks };
}

export function loadConfig(filePath = "heartbeat.config.json"): HeartbeatConfig {
  const resolved = path.resolve(filePath);
  const raw = fs.readFileSync(resolved, "utf-8");
  const data = JSON.parse(raw);
  return parseConfig(data);
}

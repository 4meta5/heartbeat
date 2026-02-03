import path from "node:path";
import { scheduleToCron } from "./schedule.js";
import type { HeartbeatConfig, Task } from "./config.js";

function resolveCwd(cwd: string | undefined, baseDir: string | undefined): string | undefined {
  if (!cwd) {
    return undefined;
  }
  if (!baseDir || path.isAbsolute(cwd)) {
    return cwd;
  }
  return path.resolve(baseDir, cwd);
}

export function formatCronLine(task: Task, baseDir?: string): string {
  const schedule = scheduleToCron(task.schedule);
  const resolvedCwd = resolveCwd(task.cwd, baseDir);
  const command = resolvedCwd ? `cd ${resolvedCwd} && ${task.command}` : task.command;
  return `${schedule} ${command}`;
}

export function renderCronLines(config: HeartbeatConfig): string[] {
  return config.tasks
    .filter((task) => task.enabled !== false)
    .map((task) => formatCronLine(task, config.baseDir));
}

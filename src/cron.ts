import { scheduleToCron } from "./schedule.js";
import type { HeartbeatConfig, Task } from "./config.js";

export function formatCronLine(task: Task): string {
  const schedule = scheduleToCron(task.schedule);
  const command = task.cwd ? `cd ${task.cwd} && ${task.command}` : task.command;
  return `${schedule} ${command}`;
}

export function renderCronLines(config: HeartbeatConfig): string[] {
  return config.tasks.filter((task) => task.enabled !== false).map((task) => formatCronLine(task));
}

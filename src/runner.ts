import { spawn } from "node:child_process";
import { isDue } from "./schedule.js";
import type { HeartbeatConfig, Task } from "./config.js";

export function getDueTasks(config: HeartbeatConfig, now: Date = new Date()): Task[] {
  const timezone = config.timezone ?? "local";
  return config.tasks.filter(
    (task) => task.enabled !== false && isDue(task.schedule, now, timezone)
  );
}

export type RunResult = {
  id: string;
  status: "skipped" | "success" | "failed";
  exitCode?: number;
};

async function runTask(task: Task): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn(task.command, {
      shell: true,
      cwd: task.cwd,
      env: { ...process.env, ...task.env },
      stdio: "inherit"
    });

    child.on("error", () => {
      resolve({ id: task.id, status: "failed", exitCode: 1 });
    });

    child.on("exit", (code) => {
      const exitCode = code ?? 1;
      resolve({
        id: task.id,
        status: exitCode === 0 ? "success" : "failed",
        exitCode
      });
    });
  });
}

export async function runTasks(tasks: Task[], options: { dryRun: boolean }): Promise<RunResult[]> {
  if (options.dryRun) {
    return tasks.map((task) => ({ id: task.id, status: "skipped" }));
  }

  const results: RunResult[] = [];
  for (const task of tasks) {
    results.push(await runTask(task));
  }
  return results;
}

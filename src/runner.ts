import { spawn } from "node:child_process";
import path from "node:path";
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

function resolveCwd(cwd: string | undefined, baseDir: string | undefined): string | undefined {
  if (!cwd) {
    return undefined;
  }
  if (!baseDir || path.isAbsolute(cwd)) {
    return cwd;
  }
  return path.resolve(baseDir, cwd);
}

async function runTask(task: Task, baseDir: string | undefined): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = spawn(task.command, {
      shell: true,
      cwd: resolveCwd(task.cwd, baseDir),
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

export async function runTasks(
  tasks: Task[],
  options: { dryRun: boolean; baseDir?: string }
): Promise<RunResult[]> {
  if (options.dryRun) {
    return tasks.map((task) => ({ id: task.id, status: "skipped" }));
  }

  const results: RunResult[] = [];
  for (const task of tasks) {
    results.push(await runTask(task, options.baseDir));
  }
  return results;
}

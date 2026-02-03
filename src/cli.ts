#!/usr/bin/env node
import { parseArgs } from "./args.js";
import { loadConfig } from "./config.js";
import { renderCronLines } from "./cron.js";
import { getDueTasks, runTasks } from "./runner.js";
import { scheduleToCron } from "./schedule.js";
import type { Task } from "./config.js";

function printHelp() {
  console.log("heartbeat <command> [options]");
  console.log("");
  console.log("Commands:");
  console.log("  list         List tasks");
  console.log("  print-cron   Emit cron lines");
  console.log("  run          Run tasks due now");
  console.log("");
  console.log("Options:");
  console.log("  --config <path>   Config path (default: heartbeat.config.json)");
  console.log("  --now <iso>       Override current time for run");
  console.log("  --dry-run         Skip execution (run only)");
}

function formatListLine(task: Task) {
  const status = task.enabled === false ? "disabled" : "enabled";
  const schedule = scheduleToCron(task.schedule);
  return `${task.id}\t${status}\t${schedule}\t${task.command}`;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h") {
    printHelp();
    return;
  }

  const config = loadConfig(parsed.configPath);

  switch (parsed.command) {
    case "list": {
      for (const task of config.tasks) {
        console.log(formatListLine(task));
      }
      return;
    }
    case "print-cron": {
      for (const line of renderCronLines(config)) {
        console.log(line);
      }
      return;
    }
    case "run": {
      const now = parsed.now ? new Date(parsed.now) : new Date();
      const due = getDueTasks(config, now);
      if (due.length === 0) {
        console.log("No tasks due.");
        return;
      }
      const results = await runTasks(due, { dryRun: parsed.dryRun, baseDir: config.baseDir });
      const failed = results.filter((result) => result.status === "failed");
      if (failed.length > 0) {
        console.error(`Failed tasks: ${failed.map((task) => task.id).join(", ")}`);
        process.exitCode = 1;
      }
      return;
    }
    default: {
      console.error(`Unknown command: ${parsed.command}`);
      printHelp();
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

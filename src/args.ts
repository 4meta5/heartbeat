export type ParsedArgs = {
  command: string;
  configPath: string;
  now?: string;
  dryRun: boolean;
};

export function parseArgs(argv: string[]): ParsedArgs {
  let command = "help";
  let configPath = "heartbeat.config.json";
  let dryRun = false;
  let now: string | undefined;

  let index = 0;
  if (argv[0] && !argv[0].startsWith("-")) {
    command = argv[0];
    index = 1;
  }

  for (; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--config") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--config expects a path");
      }
      configPath = value;
      index += 1;
      continue;
    }
    if (arg === "--now") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--now expects an ISO timestamp");
      }
      now = value;
      index += 1;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (command === "help") {
      command = arg;
      continue;
    }
    throw new Error(`Unexpected argument: ${arg}`);
  }

  return { command, configPath, dryRun, ...(now ? { now } : {}) };
}

export type DailySchedule = {
  type: "daily";
  time: string;
};

export type WeeklySchedule = {
  type: "weekly";
  day: string | number;
  time: string;
};

export type Schedule = DailySchedule | WeeklySchedule;

export type TimeParts = { hour: number; minute: number };

const DAY_TO_CRON: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function parseTime(value: string): TimeParts {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid time format: ${value}`);
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error(`Invalid time value: ${value}`);
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Time out of range: ${value}`);
  }
  return { hour, minute };
}

function dayToCron(day: string | number): number {
  if (typeof day === "number") {
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new Error(`Invalid day value: ${day}`);
    }
    return day;
  }
  const normalized = day.toLowerCase();
  const cron = DAY_TO_CRON[normalized];
  if (cron === undefined) {
    throw new Error(`Invalid day value: ${day}`);
  }
  return cron;
}

export function scheduleToCron(schedule: Schedule): string {
  const { hour, minute } = parseTime(schedule.time);
  if (schedule.type === "daily") {
    return `${minute} ${hour} * * *`;
  }
  const day = dayToCron(schedule.day);
  return `${minute} ${hour} * * ${day}`;
}

function getDateParts(date: Date, timezone: "local" | "utc") {
  return timezone === "utc"
    ? {
        day: date.getUTCDay(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
      }
    : {
        day: date.getDay(),
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
}

export function isDue(schedule: Schedule, date: Date, timezone: "local" | "utc" = "local"): boolean {
  const { hour, minute } = parseTime(schedule.time);
  const parts = getDateParts(date, timezone);
  if (parts.hour !== hour || parts.minute !== minute) {
    return false;
  }
  if (schedule.type === "daily") {
    return true;
  }
  const day = dayToCron(schedule.day);
  return parts.day === day;
}

import test from "node:test";
import assert from "node:assert/strict";
import { isDue, parseTime, scheduleToCron } from "../dist/schedule.js";

test("parseTime parses HH:MM", () => {
  assert.deepEqual(parseTime("09:05"), { hour: 9, minute: 5 });
  assert.deepEqual(parseTime("18:30"), { hour: 18, minute: 30 });
});

test("parseTime rejects invalid values", () => {
  assert.throws(() => parseTime("24:00"));
  assert.throws(() => parseTime("9:70"));
  assert.throws(() => parseTime("nope"));
});

test("scheduleToCron renders daily cron", () => {
  assert.equal(scheduleToCron({ type: "daily", time: "18:00" }), "0 18 * * *");
});

test("scheduleToCron renders weekly cron", () => {
  assert.equal(scheduleToCron({ type: "weekly", day: "mon", time: "09:00" }), "0 9 * * 1");
});

test("isDue matches daily schedule in utc", () => {
  const now = new Date("2026-02-02T18:00:00Z");
  assert.equal(isDue({ type: "daily", time: "18:00" }, now, "utc"), true);
  assert.equal(isDue({ type: "daily", time: "17:59" }, now, "utc"), false);
});

test("isDue matches weekly schedule in utc", () => {
  const monday = new Date("2026-02-02T09:00:00Z");
  const tuesday = new Date("2026-02-03T09:00:00Z");
  assert.equal(isDue({ type: "weekly", day: "mon", time: "09:00" }, monday, "utc"), true);
  assert.equal(isDue({ type: "weekly", day: "mon", time: "09:00" }, tuesday, "utc"), false);
});

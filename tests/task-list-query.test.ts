import { TaskPriority, TaskStatus } from "@prisma/client";

import {
  applyTaskQuery,
  getDueInLabel,
  getTaskFilterCounts,
  normalizeTaskSearch,
  parseTaskFilter,
  parseTaskSort,
  selectUpcomingTasks,
} from "@/lib/task-list";

const now = new Date("2026-03-03T10:00:00.000Z");

const baseTasks = [
  {
    id: "1",
    title: "Write report",
    description: "Finish analytics summary",
    status: TaskStatus.PENDING,
    priority: TaskPriority.URGENT,
    eodDeadline: new Date("2026-03-03T12:00:00.000Z"),
    completedAt: null,
    createdAt: new Date("2026-03-03T08:00:00.000Z"),
  },
  {
    id: "2",
    title: "Team sync",
    description: "Daily standup",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    eodDeadline: new Date("2026-03-03T11:00:00.000Z"),
    completedAt: new Date("2026-03-03T08:30:00.000Z"),
    createdAt: new Date("2026-03-03T07:00:00.000Z"),
  },
  {
    id: "3",
    title: "Invoice follow-up",
    description: "Call vendor",
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    eodDeadline: new Date("2026-03-03T09:00:00.000Z"),
    completedAt: null,
    createdAt: new Date("2026-03-02T20:00:00.000Z"),
  },
  {
    id: "4",
    title: "Code cleanup",
    description: null,
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    eodDeadline: new Date("2026-03-04T09:00:00.000Z"),
    completedAt: null,
    createdAt: new Date("2026-03-03T09:30:00.000Z"),
  },
];

describe("task list query helpers", () => {
  it("parses invalid filter/sort values to defaults", () => {
    expect(parseTaskFilter("bad")).toBe("all");
    expect(parseTaskSort("bad")).toBe("deadline");
  });

  it("normalizes search query", () => {
    expect(normalizeTaskSearch("  report  ")).toBe("report");
  });

  it("filters pending, completed, and missed correctly", () => {
    const pending = applyTaskQuery({ tasks: baseTasks, filter: "pending", sort: "deadline", query: "", now });
    const completed = applyTaskQuery({ tasks: baseTasks, filter: "completed", sort: "deadline", query: "", now });
    const missed = applyTaskQuery({ tasks: baseTasks, filter: "missed", sort: "deadline", query: "", now });

    expect(pending.map((task) => task.id)).toEqual(["1", "4"]);
    expect(completed.map((task) => task.id)).toEqual(["2"]);
    expect(missed.map((task) => task.id)).toEqual(["3"]);
  });

  it("sorts by priority with deadline tie-break", () => {
    const sorted = applyTaskQuery({
      tasks: baseTasks,
      filter: "all",
      sort: "priority",
      query: "",
      now,
    });

    expect(sorted.map((task) => task.id)).toEqual(["1", "3", "2", "4"]);
  });

  it("sorts by recent creation date", () => {
    const sorted = applyTaskQuery({
      tasks: baseTasks,
      filter: "all",
      sort: "recent",
      query: "",
      now,
    });

    expect(sorted.map((task) => task.id)).toEqual(["4", "1", "2", "3"]);
  });

  it("matches search against title and description", () => {
    const titleMatch = applyTaskQuery({
      tasks: baseTasks,
      filter: "all",
      sort: "deadline",
      query: "invoice",
      now,
    });
    const descriptionMatch = applyTaskQuery({
      tasks: baseTasks,
      filter: "all",
      sort: "deadline",
      query: "analytics",
      now,
    });

    expect(titleMatch.map((task) => task.id)).toEqual(["3"]);
    expect(descriptionMatch.map((task) => task.id)).toEqual(["1"]);
  });

  it("returns global counts by display status", () => {
    expect(getTaskFilterCounts(baseTasks, now)).toEqual({
      all: 4,
      pending: 2,
      completed: 1,
      missed: 1,
    });
  });

  it("selects upcoming pending tasks in deadline order with limit", () => {
    const upcoming = selectUpcomingTasks(baseTasks, now, 2);
    expect(upcoming.map((task) => task.id)).toEqual(["1", "4"]);
  });

  it("builds due-in labels", () => {
    expect(getDueInLabel(new Date("2026-03-03T11:00:00.000Z"), now)).toContain("Due in");
    expect(getDueInLabel(new Date("2026-03-03T09:00:00.000Z"), now)).toBe("Due now");
  });
});

"use client";

import { useEffect, useMemo, useState } from "react";

import { logFocusSessionAction } from "@/actions/focus-actions";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type FocusTimerProps = {
  tasks: Array<{ id: string; title: string }>;
};

export function FocusTimer({ tasks }: FocusTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [taskId, setTaskId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (seconds !== 0) {
      return;
    }

    const completeCycle = async () => {
      if (mode === "focus") {
        const result = await logFocusSessionAction({ taskId: taskId || undefined, duration: 25 });
        setMessage(result.ok ? "Focus session logged" : result.message ?? "Failed to log focus session");
        setMode("break");
        setSeconds(BREAK_SECONDS);
      } else {
        setMode("focus");
        setSeconds(FOCUS_SECONDS);
        setMessage("Break complete. Ready for next focus session.");
      }

      setIsRunning(false);
    };

    completeCycle().catch(() => {
      setMessage("Failed to transition timer state");
      setIsRunning(false);
    });
  }, [mode, seconds, taskId]);

  const display = useMemo(() => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }, [seconds]);

  const reset = () => {
    setIsRunning(false);
    setMode("focus");
    setSeconds(FOCUS_SECONDS);
    setMessage("");
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Pomodoro Focus Timer</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">25 min focus, 5 min break</p>

      <div className="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-100">{display}</div>
      <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-400">{mode === "focus" ? "Focus" : "Break"} mode</p>

      <div className="mt-4">
        <label htmlFor="focusTask" className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Attach to Task (optional)
        </label>
        <select
          id="focusTask"
          value={taskId}
          onChange={(event) => setTaskId(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-rose-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-rose-400"
        >
          <option value="">No task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setIsRunning((value) => !value)}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 active:scale-[0.98]"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] dark:border-[#303030] dark:text-gray-100 dark:hover:bg-[#202020]"
        >
          Reset
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-gray-700 dark:text-gray-400">{message}</p> : null}
    </section>
  );
}



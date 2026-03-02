"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CompletionPoint = {
  day: string;
  completions: number;
};

type FocusPoint = {
  day: string;
  minutes: number;
};

type AnalyticsChartProps = {
  completionSeries: CompletionPoint[];
  focusSeries: FocusPoint[];
};

export function AnalyticsChart({ completionSeries, focusSeries }: AnalyticsChartProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">Tasks Completed (Last 7 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="day" tick={{ fill: "var(--chart-text)", fontSize: 12 }} axisLine={{ stroke: "var(--chart-grid)" }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--chart-text)", fontSize: 12 }} axisLine={{ stroke: "var(--chart-grid)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  borderColor: "var(--chart-tooltip-border)",
                  borderRadius: "0.75rem",
                }}
              />
              <Line type="monotone" dataKey="completions" stroke="#0f766e" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">Focus Minutes (Last 7 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={focusSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="day" tick={{ fill: "var(--chart-text)", fontSize: 12 }} axisLine={{ stroke: "var(--chart-grid)" }} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--chart-text)", fontSize: 12 }} axisLine={{ stroke: "var(--chart-grid)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--chart-tooltip-bg)",
                  borderColor: "var(--chart-tooltip-border)",
                  borderRadius: "0.75rem",
                }}
              />
              <Bar dataKey="minutes" fill="#e11d48" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}



"use client";
import { useMemo, useState } from "react";
import type { Attempt } from "@/lib/study";
import { practiceBuckets } from "@/lib/statistics";

export default function PracticeSeries({
  rows,
  wordMode,
}: {
  rows: Attempt[];
  wordMode: boolean;
}) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const buckets = useMemo(() => practiceBuckets(rows, period), [rows, period]);
  const title = wordMode ? "Words practiced" : "Items practiced";
  const width = Math.max(600, buckets.length * 90 + 80);
  const max = Math.max(2, ...buckets.map((b) => b.count));
  const ceiling = Math.ceil(max / 2) * 2;
  const points = buckets.map((b, i) => ({
    ...b,
    x:
      buckets.length === 1
        ? width / 2
        : 65 + (i * (width - 120)) / (buckets.length - 1),
    y: 220 - (b.count / ceiling) * 180,
  }));
  return (
    <section className="panel" aria-label={title}>
      <h2>{title}</h2>
      <div className="field-grid">
        <label className="field">
          <span>Group practice by</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>
      </div>
      <p className="helper">
        Distinct {wordMode ? "words" : "items"} per period; repeat attempts
        count once within each period. Uses the quiz, direction, priority, and
        multiple-choice filters above. Dates use UTC; weeks start Monday. Empty
        periods between your first and last matching attempts count as zero.
      </p>
      {!points.length ? (
        <p>No attempts yet.</p>
      ) : (
        <>
          <div className="accuracy-chart">
            <svg
              viewBox={`0 0 ${width} 260`}
              style={{ minWidth: width }}
              role="img"
              aria-label={`${title} by ${period} line plot`}
            >
              {[0, ceiling / 2, ceiling].map((n) => (
                <g key={n}>
                  <text x="0" y={225 - (n / ceiling) * 180}>
                    {n}
                  </text>
                  <line
                    x1="40"
                    x2={width - 15}
                    y1={220 - (n / ceiling) * 180}
                    y2={220 - (n / ceiling) * 180}
                    stroke="currentColor"
                    opacity="0.15"
                  />
                </g>
              ))}
              {points.length > 1 && (
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth="2"
                />
              )}
              {points.map((p) => (
                <g key={p.label}>
                  <circle cx={p.x} cy={p.y} r="4" fill="var(--green)">
                    <title>
                      {p.label}: {p.count}
                    </title>
                  </circle>
                  <text x={p.x} y={p.y - 12} textAnchor="middle">
                    {p.count}
                  </text>
                  <text x={p.x} y="248" textAnchor="middle">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <details>
            <summary>View practice data</summary>
            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>{title}</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((b) => (
                    <tr key={b.label}>
                      <td>{b.label}</td>
                      <td>{b.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}

"use client";
import { useMemo, useState } from "react";
import type { Attempt } from "@/lib/study";
import { accuracyBuckets } from "@/lib/statistics";
export default function AccuracySeries({
  title,
  rows,
  defaultSize,
}: {
  title: string;
  rows: Attempt[];
  defaultSize: number;
}) {
  const [bucketMode, setBucketMode] = useState<
    "attempts" | "day" | "week" | "month"
  >("attempts");
  const [bucketSize, setBucketSize] = useState(defaultSize);
  const buckets = useMemo(
    () => accuracyBuckets(rows, bucketMode, bucketSize),
    [rows, bucketMode, bucketSize],
  );
  const chartWidth = Math.max(600, (buckets.length - 1) * 60 + 100);
  const points = buckets.map((bucket, index) => ({
    ...bucket,
    x:
      buckets.length === 1
        ? chartWidth / 2
        : 65 + index * ((chartWidth - 100) / (buckets.length - 1)),
    y: 220 - bucket.accuracy * 1.8,
  }));
  return (
    <section className="panel" aria-label={title}>
      <h2>{title}</h2>
      <div className="field-grid">
        <label className="field">
          <span>Group accuracy by</span>
          <select
            value={bucketMode}
            onChange={(e) => setBucketMode(e.target.value as typeof bucketMode)}
          >
            <option value="attempts">Chunks of attempts</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </label>
        {bucketMode === "attempts" && (
          <label className="field">
            <span>Attempts per bucket</span>
            <input
              type="number"
              min="1"
              value={bucketSize}
              onChange={(e) =>
                setBucketSize(
                  Math.max(1, Math.floor(Number(e.target.value)) || 1),
                )
              }
            />
          </label>
        )}
      </div>
      <p className="helper">
        Uses the quiz, direction, priority, and multiple-choice filters above.
        Chunks count only attempts qualifying for this series and start with
        your oldest matching attempt; the final chunk may be partial. Dates use
        UTC; weeks start Monday. Empty periods are omitted.
      </p>
      {!buckets.length ? (
        <p>No attempts yet.</p>
      ) : (
        <>
          <div className="accuracy-chart">
            <svg
              viewBox={`0 0 ${chartWidth} 260`}
              role="img"
              aria-label={`${title}: Accuracy by bucket line plot, from zero to one hundred percent`}
              style={{
                minWidth: chartWidth,
              }}
            >
              {[0, 50, 100].map((n) => (
                <g key={n}>
                  <text x="0" y={225 - n * 1.8}>
                    {n}%
                  </text>
                  <line
                    x1="40"
                    x2={chartWidth - 15}
                    y1={220 - n * 1.8}
                    y2={220 - n * 1.8}
                    stroke="currentColor"
                    opacity="0.15"
                  />
                </g>
              ))}
              {points.length > 1 && (
                <polyline
                  points={points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  fill="none"
                  stroke="var(--accent, #26765c)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}
              {points.map((point) => (
                <g key={point.label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="var(--accent, #26765c)"
                  >
                    <title>
                      {point.label}: {point.accuracy}% · {point.count} attempts
                    </title>
                  </circle>
                  <text
                    className="accuracy-point-label"
                    x={point.x}
                    y={point.y - 12}
                    textAnchor="middle"
                  >
                    {point.accuracy}%
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <p className="helper">
            {buckets[0].label} → {buckets.at(-1)!.label} · left to right
          </p>
          <details>
            <summary>View accuracy data</summary>
            <div className="stats-table">
              <table>
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Attempts</th>
                    <th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((b) => (
                    <tr key={b.label}>
                      <td>{b.label}</td>
                      <td>{b.count}</td>
                      <td>{b.accuracy}%</td>
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

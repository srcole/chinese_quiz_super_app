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
              viewBox={`0 0 ${Math.max(600, buckets.length * 28 + 60)} 230`}
              role="img"
              aria-label={`${title}: Accuracy by bucket, from zero to one hundred percent`}
              style={{
                minWidth: Math.max(600, buckets.length * 28 + 60),
              }}
            >
              {[0, 50, 100].map((n) => (
                <g key={n}>
                  <text x="0" y={205 - n * 1.8}>
                    {n}%
                  </text>
                  <line
                    x1="40"
                    x2={Math.max(600, buckets.length * 28 + 60)}
                    y1={200 - n * 1.8}
                    y2={200 - n * 1.8}
                    stroke="currentColor"
                    opacity="0.15"
                  />
                </g>
              ))}
              {buckets.map((b, i) => (
                <rect
                  key={b.label}
                  x={
                    45 +
                    i *
                      ((Math.max(600, buckets.length * 28 + 60) - 55) /
                        buckets.length)
                  }
                  y={200 - b.accuracy * 1.8}
                  width={Math.max(
                    2,
                    (Math.max(600, buckets.length * 28 + 60) - 55) /
                      buckets.length -
                      5,
                  )}
                  height={Math.max(1, b.accuracy * 1.8)}
                  fill="var(--accent, #26765c)"
                >
                  <title>
                    {b.label}: {b.accuracy}% · {b.count} attempts
                  </title>
                </rect>
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

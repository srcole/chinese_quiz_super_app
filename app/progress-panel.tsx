"use client";
import { useMemo, useState } from "react";
import { Attempt, Content, Mode, modeNames } from "@/lib/study";
import { accuracyBuckets, itemsForMode, summarize } from "@/lib/statistics";
import TraditionalText from "./traditional-text";
import type { AudioItem } from "@/lib/use-audio";
export default function ProgressPanel({
  content,
  attempts,
  play,
  stop,
  exportHistory,
}: {
  content: Content;
  attempts: Attempt[];
  play: (items: AudioItem[]) => void;
  stop: () => void;
  exportHistory: () => void;
}) {
  const [mode, setMode] = useState<Mode>("vocabulary"),
    [direction, setDirection] = useState("en-zh"),
    [priority, setPriority] = useState("6"),
    [x, setX] = useState(2),
    [incorrectX, setIncorrectX] = useState(1),
    [bucketMode, setBucketMode] = useState<
      "attempts" | "day" | "week" | "month"
    >("attempts"),
    [bucketSize, setBucketSize] = useState(50),
    [result, setResult] = useState("all"),
    [details, setDetails] = useState(false),
    [limit, setLimit] = useState(50);
  const fixed = ["tones", "characters", "grammar"].includes(mode);
  const dir = fixed ? "fixed" : direction;
  const items = useMemo(
    () =>
      itemsForMode(content, mode).filter(
        (i) =>
          mode === "grammar" ||
          !priority ||
          (i.priority !== null && i.priority <= Number(priority)),
      ),
    [content, mode, priority],
  );
  const stats = useMemo(
    () => summarize(items, attempts, mode, dir, x, incorrectX),
    [items, attempts, mode, dir, x, incorrectX],
  );
  const buckets = useMemo(
    () => accuracyBuckets(stats.rows, bucketMode, bucketSize),
    [stats.rows, bucketMode, bucketSize],
  );
  const lookup = new Map(items.map((i) => [i.id, i]));
  const rows = [...stats.rows]
    .reverse()
    .filter((a) => result === "all" || a.correct === (result === "correct"));
  const detailed = useMemo(
    () =>
      (Object.keys(modeNames) as Mode[]).flatMap((m) => {
        const all = itemsForMode(content, m);
        const directions = ["tones", "characters", "grammar"].includes(m)
          ? ["fixed"]
          : ["en-zh", "zh-en"];
        const priorities =
          m === "grammar"
            ? ["All"]
            : [
                ...new Set(
                  all.map((i) =>
                    i.priority === null ? "Unknown" : String(i.priority),
                  ),
                ),
              ].sort((a, b) => Number(a) - Number(b));
        return directions.flatMap((d) =>
          [...(m === "grammar" ? [] : ["All"]), ...priorities].map((p) => ({
            mode: m,
            direction: d,
            priority: p,
            ...summarize(
              all.filter(
                (i) =>
                  p === "All" ||
                  (p === "Unknown"
                    ? i.priority === null
                    : i.priority === Number(p)),
              ),
              attempts,
              m,
              d,
              x,
              incorrectX,
            ),
          })),
        );
      }),
    [content, attempts, x, incorrectX],
  );
  function changed() {
    stop();
    setLimit(50);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR LEARNING, OVER TIME</div>
          <h1>
            Every answer <em>adds up.</em>
          </h1>
          <p>
            Counts use the current collection. Removed items remain in your
            exported history.
          </p>
        </div>
      </div>
      <section className="panel">
        <div className="section-line">
          <h2>{details ? "Detailed statistics" : "Your progress"}</h2>
          <button
            onClick={() => {
              stop();
              setDetails(!details);
            }}
          >
            {details ? "← Filtered progress" : "All quiz statistics →"}
          </button>
        </div>
        <div className="field-grid">
          {!details && (
            <>
              <label className="field">
                <span>Quiz type</span>
                <select
                  aria-label="Progress quiz type"
                  value={mode}
                  onChange={(e) => {
                    changed();
                    setMode(e.target.value as Mode);
                  }}
                >
                  {Object.entries(modeNames).map(([m, n]) => (
                    <option value={m} key={m}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              {!fixed && (
                <label className="field">
                  <span>Prompt direction</span>
                  <select
                    aria-label="Progress direction"
                    value={direction}
                    onChange={(e) => {
                      changed();
                      setDirection(e.target.value);
                    }}
                  >
                    <option value="en-zh">English → Chinese</option>
                    <option value="zh-en">Chinese → English</option>
                  </select>
                </label>
              )}
              {mode !== "grammar" && (
                <label className="field">
                  <span>Maximum priority</span>
                  <input
                    aria-label="Progress maximum priority"
                    type="number"
                    value={priority}
                    placeholder="All"
                    onChange={(e) => {
                      changed();
                      setPriority(e.target.value);
                    }}
                  />
                </label>
              )}
            </>
          )}
          <label className="field">
            <span>Correct streak target (X)</span>
            <input
              aria-label="Correct streak target"
              type="number"
              min="1"
              value={x}
              onChange={(e) => {
                changed();
                setX(Math.max(1, Math.floor(Number(e.target.value))));
              }}
            />
          </label>
          <label className="field">
            <span>Incorrect streak target (X)</span>
            <input
              aria-label="Incorrect streak target"
              type="number"
              min="1"
              value={incorrectX}
              onChange={(e) =>
                setIncorrectX(
                  Math.max(1, Math.floor(Number(e.target.value)) || 1),
                )
              }
            />
          </label>
        </div>
        <p className="helper">
          Reached target = the latest {x} answers were all correct in the same
          quiz and direction. A miss resets the streak. Incorrect streaks count
          items whose latest X answers were all incorrect, out of distinct items
          attempted. Tone totals include all valid word lengths.
        </p>
      </section>
      {details ? (
        <section className="panel">
          <p>
            Every quiz and direction, broken down by exact priority. “All”
            includes every priority. Grammar has no priority levels.
          </p>
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  {[
                    "Quiz",
                    "Direction",
                    "Priority",
                    "Practiced / total",
                    "Reached target / total",
                    "Unseen",
                    "Attempts",
                    "Correct",
                    "Incorrect",
                    "Accuracy",
                    "Last 100 accuracy",
                    "Incorrect streak / practiced",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailed.map((s) => (
                  <tr key={`${s.mode}:${s.direction}:${s.priority}`}>
                    <td>{modeNames[s.mode]}</td>
                    <td>{s.direction === "fixed" ? "—" : s.direction}</td>
                    <td>{s.priority}</td>
                    <td>
                      {s.practiced} / {s.total}
                    </td>
                    <td>
                      {s.mastered} / {s.total}
                    </td>
                    <td>{s.unseen}</td>
                    <td>{s.rows.length}</td>
                    <td>{s.correct}</td>
                    <td>{s.incorrect}</td>
                    <td>{s.rows.length ? `${s.accuracy}%` : "—"}</td>
                    <td>
                      {s.recentAccuracy === null
                        ? "—"
                        : `${s.recentAccuracy}% (${s.recentCount} attempts)`}
                    </td>
                    <td>
                      {s.missedTarget} / {s.practiced}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <>
          <div className="stat-grid">
            <div className="panel">
              <span>Answers submitted</span>
              <strong>{stats.rows.length}</strong>
            </div>
            <div className="panel">
              <span>Correct answers</span>
              <strong>{stats.accuracy}%</strong>
            </div>
            <div className="panel">
              <span>Items practiced</span>
              <strong>
                {stats.practiced} <small>/ {stats.total}</small>
              </strong>
            </div>
            <div className="panel">
              <span>Reached {x}-correct streak</span>
              <strong>
                {stats.mastered} <small>/ {stats.total}</small>
              </strong>
            </div>
            <div className="panel">
              <span>Accuracy · last 100 attempts</span>
              <strong>
                {stats.recentAccuracy === null
                  ? "—"
                  : `${stats.recentAccuracy}%`}
              </strong>
              <small>Based on {stats.recentCount} attempts</small>
            </div>
            <div className="panel">
              <span>Latest {incorrectX} answers incorrect</span>
              <strong>
                {stats.missedTarget} <small>/ {stats.practiced}</small>
              </strong>
              <small>Distinct items attempted</small>
            </div>
          </div>
          <section className="panel">
            <h2>Accuracy over time</h2>
            <div className="field-grid">
              <label className="field">
                <span>Group accuracy by</span>
                <select
                  value={bucketMode}
                  onChange={(e) =>
                    setBucketMode(e.target.value as typeof bucketMode)
                  }
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
              Uses the quiz, direction, and priority filters above. Chunks start
              with your oldest matching attempt; the final chunk may be partial.
              Dates use UTC; weeks start Monday. Empty periods are omitted.
            </p>
            {!buckets.length ? (
              <p>No attempts yet.</p>
            ) : (
              <>
                <div className="accuracy-chart">
                  <svg
                    viewBox={`0 0 ${Math.max(600, buckets.length * 28 + 60)} 230`}
                    role="img"
                    aria-label="Accuracy by bucket, from zero to one hundred percent"
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
          <section className="panel">
            <div className="section-line">
              <h2>Practice history</h2>
              <button onClick={exportHistory}>Export all history</button>
            </div>
            <div className="inline">
              <label className="field">
                <span>Answer result</span>
                <select
                  aria-label="Answer result"
                  value={result}
                  onChange={(e) => {
                    changed();
                    setResult(e.target.value);
                  }}
                >
                  <option value="all">All answers</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                </select>
              </label>
              <button
                disabled={!rows.length}
                onClick={() => {
                  const seen = new Set<string>();
                  play(
                    rows
                      .filter((a) => {
                        if (seen.has(a.item_id)) return false;
                        seen.add(a.item_id);
                        return true;
                      })
                      .map((a, row) => ({
                        text: lookup.get(a.item_id)!.chinese,
                        row,
                      })),
                  );
                }}
              >
                ◖)) Listen to filtered items
              </button>
            </div>
            <p className="helper">
              {rows.length} matching answers. Playback reads each matching
              Chinese item once, most recent first.
            </p>
            <div className="history-list">
              {rows.slice(0, limit).map((a) => (
                <div key={a.id}>
                  <span className={a.correct ? "correct" : "unmatched"}>
                    {a.correct ? "✓" : "○"}
                  </span>
                  <div>
                    <strong lang="zh">
                      {mode === "characters" &&
                        lookup.get(a.item_id)?.traditional && (
                          <>
                            <TraditionalText
                              traditional={lookup.get(a.item_id)!.traditional!}
                              simplified={lookup.get(a.item_id)!.chinese}
                            />{" "}
                            →{" "}
                          </>
                        )}
                      {lookup.get(a.item_id)?.chinese}
                    </strong>
                    <small>
                      {lookup.get(a.item_id)?.english} · Priority{" "}
                      {lookup.get(a.item_id)?.priority ?? "—"}
                    </small>
                    <small>
                      Your answer: {a.answer || "(blank)"}
                      {a.overridden ? " · accepted by you" : ""}
                    </small>
                  </div>
                  <button
                    aria-label={`Listen to ${lookup.get(a.item_id)?.chinese}`}
                    onClick={() =>
                      play([{ text: lookup.get(a.item_id)!.chinese, row: 0 }])
                    }
                  >
                    ◖))
                  </button>
                  <time>{new Date(a.created_at).toLocaleDateString()}</time>
                </div>
              ))}
            </div>
            {!rows.length && (
              <p className="empty">No answers match these filters.</p>
            )}
            {rows.length > limit && (
              <button onClick={() => setLimit(limit + 50)}>
                Show next 50 answers
              </button>
            )}
          </section>
        </>
      )}
    </>
  );
}

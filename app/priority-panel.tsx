"use client";
import { useMemo, useState } from "react";
import type { Word } from "@/lib/study";
import {
  latestPriorities,
  priorityCSV,
  prioritySQL,
  type PriorityChange,
  type PriorityExport,
} from "@/lib/priorities";
import PriorityControls from "./priority-controls";
export default function PriorityPanel({
  words,
  rows,
  ready,
  status,
  save,
  sync,
}: {
  words: Word[];
  rows: PriorityChange[];
  ready: boolean;
  status: string;
  save: (word: Word, value: number | null) => boolean;
  sync: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(50);
  const [historyLimit, setHistoryLimit] = useState(50);
  const latest = useMemo(() => latestPriorities(rows), [rows]);
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const active = [...latest.values()].filter((r) => r.new_priority !== null);
  const filtered = active.filter((r) =>
    `${r.chinese} ${byId.get(r.word_id)?.english || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const exported: PriorityExport[] = active
    .filter((r) => selected.has(r.word_id) && byId.has(r.word_id))
    .map((r) => ({
      id: r.word_id,
      chinese: byId.get(r.word_id)!.chinese,
      original_priority: r.original_priority,
      new_priority: r.new_priority!,
    }));
  function download(kind: "csv" | "sql") {
    const url = URL.createObjectURL(
      new Blob(
        [kind === "csv" ? priorityCSV(exported) : prioritySQL(exported)],
        { type: "text/plain;charset=utf-8" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `priority-changes-${new Date().toISOString().slice(0, 10)}.${kind}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="panel">
      <h1>Priority changes</h1>
      <p>
        Your priorities are personal and survive vocabulary imports. Resetting a
        word restores its current collection priority.
      </p>
      <p role="status">{status}</p>
      <button onClick={() => void sync()}>Sync now</button>
      <label className="field">
        <span>Search priority changes</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(50);
          }}
        />
      </label>
      <div className="button-row">
        <button
          onClick={() =>
            setSelected(
              new Set(
                filtered
                  .filter((r) => byId.has(r.word_id))
                  .map((r) => r.word_id),
              ),
            )
          }
        >
          Select matching changes
        </button>
        <button onClick={() => setSelected(new Set())}>Clear selection</button>
        <button disabled={!exported.length} onClick={() => download("csv")}>
          Download CSV ({exported.length})
        </button>
        <button disabled={!exported.length} onClick={() => download("sql")}>
          Download SQL ({exported.length})
        </button>
      </div>
      <p className="helper">
        Exports promote selected changes to the shared collection. Update the
        main CSV as well as Supabase so future imports preserve them. SQL skips
        words whose shared priority has changed since your adjustment. Exports
        do not apply changes or reset your overrides.
      </p>
      {!filtered.length && (
        <p>
          No priority overrides to show. Adjust a word from its quiz feedback.
        </p>
      )}
      {filtered.slice(0, limit).map((r) => {
        const word = byId.get(r.word_id);
        return (
          <article className="priority-entry" key={r.word_id}>
            <label className="check-field">
              <input
                type="checkbox"
                disabled={!word}
                checked={selected.has(r.word_id)}
                onChange={(e) =>
                  setSelected((old) => {
                    const next = new Set(old);
                    if (e.target.checked) next.add(r.word_id);
                    else next.delete(r.word_id);
                    return next;
                  })
                }
              />
              {r.chinese} — {word?.english || "No longer in the collection"}
            </label>
            <p>
              Changed from {r.original_priority || "unassigned"} to{" "}
              {r.new_priority} · {new Date(r.updated_at).toLocaleString()}
            </p>
            {word ? (
              <PriorityControls
                word={word}
                change={r}
                ready={ready}
                save={save}
              />
            ) : (
              <button
                disabled={!ready}
                onClick={() =>
                  save(
                    {
                      id: r.word_id,
                      chinese: r.chinese,
                      priority: r.original_priority,
                    },
                    null,
                  )
                }
              >
                Reset to original
              </button>
            )}
          </article>
        );
      })}
      {filtered.length > limit && (
        <button onClick={() => setLimit((n) => n + 50)}>
          Show more changes
        </button>
      )}
      <details>
        <summary>Change history ({rows.length})</summary>
        {[...rows]
          .reverse()
          .slice(0, historyLimit)
          .map((r) => (
            <p key={r.id}>
              {r.chinese} ·{" "}
              {r.new_priority === null
                ? "Reset to original"
                : `Priority ${r.new_priority}`}{" "}
              · {new Date(r.updated_at).toLocaleString()}
            </p>
          ))}
        {rows.length > historyLimit && (
          <button onClick={() => setHistoryLimit((n) => n + 50)}>
            Show more history
          </button>
        )}
      </details>
    </section>
  );
}

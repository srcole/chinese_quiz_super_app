"use client";
import { useState } from "react";
import {
  findSentences,
  sentenceFeedbackPrompt,
  WrittenSentence,
} from "@/lib/sentences";

export default function SentenceLibrary({
  rows,
  status,
  markCopied,
}: {
  rows: WrittenSentence[];
  status: string;
  markCopied: (ids: string[], copied?: boolean) => boolean;
}) {
  const [hideCopied, setHideCopied] = useState(true);
  const [copying, setCopying] = useState(false);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [through, setThrough] = useState("");
  const [limit, setLimit] = useState(50);
  const [message, setMessage] = useState("");
  const filtered = findSentences(rows, query, from, through).filter(
    (row) => !hideCopied || !row.feedback_copied_at,
  );
  function download() {
    const url = URL.createObjectURL(
      new Blob([sentenceFeedbackPrompt(filtered)], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `chinese-sentence-feedback-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      className="panel sentence-library"
      aria-labelledby="written-sentences-heading"
    >
      <h2 id="written-sentences-heading">Your written sentences</h2>
      <p>
        Search your writing, then copy or download the matching target words and
        learner sentences for AI feedback.
      </p>
      <div className="field-grid">
        <label className="field">
          <span>Search written sentences</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(50);
              setMessage("");
            }}
            placeholder="Word, pinyin, meaning, or sentence"
          />
        </label>
        <label className="field">
          <span>Written from (UTC)</span>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setLimit(50);
              setMessage("");
            }}
          />
        </label>
        <label className="field">
          <span>Written through (UTC)</span>
          <input
            type="date"
            value={through}
            onChange={(e) => {
              setThrough(e.target.value);
              setLimit(50);
              setMessage("");
            }}
          />
        </label>
      </div>
      <label className="check-field">
        <input
          type="checkbox"
          checked={hideCopied}
          onChange={(e) => {
            setHideCopied(e.target.checked);
            setLimit(50);
            setMessage("");
          }}
        />
        Hide sentences already copied for feedback
      </label>
      <p>
        {filtered.length} matching sentences · {rows.length} saved
      </p>
      <div className="inline">
        <button
          disabled={!filtered.length || copying}
          onClick={async () => {
            const batch = filtered;
            setCopying(true);
            try {
              await navigator.clipboard.writeText(
                sentenceFeedbackPrompt(batch),
              );
              setMessage(
                markCopied(batch.map((row) => row.id))
                  ? `Copied ${batch.length} sentences and marked them as copied for feedback.`
                  : "Sentences copied, but their copied status could not be saved. Please retry.",
              );
            } catch {
              setMessage("Copy unavailable. Download the sentences instead.");
            } finally {
              setCopying(false);
            }
          }}
        >
          Copy for AI feedback
        </button>
        <button disabled={!filtered.length} onClick={download}>
          Download for AI feedback
        </button>
      </div>
      <p role="status">{message}</p>
      <div className="written-sentences">
        {filtered.slice(0, limit).map((row) => (
          <article key={row.id}>
            <h3>
              <span lang="zh-Hans">{row.chinese}</span>{" "}
              <span className="pinyin">{row.pinyin}</span>
            </h3>
            <p>{row.english}</p>
            <p lang="zh-Hans" className="learner-sentence">
              {row.sentence}
            </p>
            <p className="helper">
              {row.feedback_copied_at
                ? `Copied for feedback · ${new Date(row.feedback_copied_at).toLocaleString()}`
                : "Not yet copied for feedback"}
            </p>
            {row.feedback_copied_at && (
              <button
                onClick={() => {
                  setMessage(
                    markCopied([row.id], false)
                      ? "Marked as not copied."
                      : "Could not save copied status. Please retry.",
                  );
                }}
              >
                Mark as not copied
              </button>
            )}
            <time dateTime={row.created_at}>
              {new Date(row.created_at).toLocaleString()}
            </time>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="empty">
          {rows.length
            ? "No sentences match your search."
            : "Write your first sentence in the Write sentences section."}
        </p>
      )}
      {filtered.length > limit && (
        <button onClick={() => setLimit((n) => n + 50)}>
          Show next 50 sentences
        </button>
      )}
      <p className="helper">{status}</p>
    </section>
  );
}

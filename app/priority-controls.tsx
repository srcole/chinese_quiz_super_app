"use client";
import { useState } from "react";
import type { Word } from "@/lib/study";
import type { PriorityChange } from "@/lib/priorities";
export default function PriorityControls({
  word,
  change,
  ready,
  save,
}: {
  word: Word;
  change?: PriorityChange;
  ready: boolean;
  save: (word: Word, value: number | null) => boolean;
}) {
  const [undo, setUndo] = useState<{
    previous: number | null;
    value: number | null;
  } | null>(null);
  const value = change?.new_priority ?? Number(word.priority);
  function adjust(next: number) {
    if (save(word, next))
      setUndo({ previous: change?.new_priority ?? null, value: next });
  }
  return (
    <div className="priority-controls">
      <strong>
        Priority: {Number.isFinite(value) && value > 0 ? value : "Unassigned"}
      </strong>
      <span>Lower numbers mean greater importance.</span>
      <div className="button-row">
        <button
          type="button"
          disabled={!ready || value <= 1 || !value}
          onClick={() => adjust(value - 1)}
        >
          Increase importance
        </button>
        <button
          type="button"
          disabled={!ready || value >= 10 || !value}
          onClick={() => adjust(value + 1)}
        >
          Decrease importance
        </button>
        {change?.new_priority != null && (
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              if (save(word, null))
                setUndo({ previous: change.new_priority, value: null });
            }}
          >
            Reset to original
          </button>
        )}
        {undo && (change?.new_priority ?? null) === undo.value && (
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              if (save(word, undo.previous)) setUndo(null);
            }}
          >
            Undo
          </button>
        )}
      </div>
      <small>
        Original priority: {word.priority || "Unassigned"}. Changes apply to
        future quizzes.
      </small>
    </div>
  );
}

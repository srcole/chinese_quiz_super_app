import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyPriorities,
  mergePriorityChanges,
  latestPriorities,
  priorityCSV,
  prioritySQL,
  type PriorityChange,
} from "../lib/priorities";
const word = { id: "1", chinese: "词", priority: "5" };
const event = (
  id: string,
  value: number | null,
  time: string,
): PriorityChange => ({
  id,
  word_id: "1",
  chinese: "词",
  original_priority: "5",
  new_priority: value,
  updated_at: time,
});
test("overrides survive source imports and reset restores the current source priority", () => {
  const change = event("a", 6, "2026-11-12T00:00:00Z");
  assert.equal(applyPriorities([word], [change])[0].priority, "6");
  assert.equal(word.priority, "5");
  assert.equal(
    applyPriorities([{ ...word, priority: "3" }], [change])[0].priority,
    "6",
  );
  const reset = event("b", null, "2026-11-12T00:00:01Z");
  assert.equal(
    applyPriorities([{ ...word, priority: "3" }], [reset, change])[0].priority,
    "3",
  );
});
test("immutable history deduplicates sync retries and deterministically resolves concurrent changes", () => {
  const a = event("a", 6, "2026-11-12T00:00:00Z");
  const b = event("b", 7, "2026-11-12T08:00:00+08:00");
  assert.equal(mergePriorityChanges([a], [a, b]).length, 2);
  assert.equal(latestPriorities([b, a]).get("1")?.new_priority, 7);
  assert.equal(latestPriorities([a, b]).get("1")?.new_priority, 7);
});
test("exports preserve IDs, escape text, and condition shared updates on the original priority", () => {
  const rows = [
    { id: "1", chinese: "a'b,\"c", original_priority: "5", new_priority: 6 },
  ];
  assert.match(priorityCSV(rows), /"a'b,""c"/);
  const sql = prioritySQL(rows);
  assert.ok(sql.includes("'a''b,\"c'"));
  assert.ok(sql.includes("'word:1'"));
  assert.ok(sql.includes("= changes.old_priority"));
  assert.ok(sql.includes("'{priority}'"));
  assert.ok(!sql.includes("delete"));
  assert.equal(prioritySQL([]), "-- No priority changes selected.\n");
});

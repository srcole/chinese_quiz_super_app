import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, itemsForMode } from "../lib/statistics";
import type { Attempt, Content } from "../lib/study";
const content: Content = {
  words: [
    {
      id: "1",
      chinese: "好",
      english: "good",
      priority: "2",
      tone_pattern: "3",
      sentence: "你好",
      part_of_speech: "adjective",
    },
    {
      id: "2",
      chinese: "词",
      english: "word",
      priority: "7",
      tone_pattern: "2",
      sentence: "",
      part_of_speech: "noun",
    },
  ],
  characters: [{ idx: "1", simp: "这", English: "this", priority: "1" }],
  rules: [],
  generatedAt: "",
};
const attempt = (
  n: number,
  id: string,
  correct: boolean,
  direction = "en-zh",
): Attempt => ({
  id: String(n),
  item_id: id,
  correct,
  mode: "vocabulary",
  direction,
  answer: "",
  overridden: false,
  created_at: new Date(n * 1000).toISOString(),
  updated_at: new Date(n * 1000).toISOString(),
});
test("statistics count distinct items against eligible total and respect direction, streak and removed items", () => {
  const items = itemsForMode(content, "vocabulary").filter(
    (i) => i.priority! <= 6,
  );
  const rows = [
    attempt(1, "word:1", true),
    attempt(2, "word:1", true),
    attempt(3, "word:2", true),
    attempt(4, "word:deleted", true),
    attempt(5, "word:1", false, "zh-en"),
  ];
  const stats = summarize(items, rows, "vocabulary", "en-zh", 2);
  assert.equal(stats.total, 1);
  assert.equal(stats.practiced, 1);
  assert.equal(stats.mastered, 1);
  assert.equal(stats.rows.length, 2);
  assert.equal(
    summarize(
      items,
      [...rows, attempt(6, "word:1", false)],
      "vocabulary",
      "en-zh",
      2,
    ).mastered,
    0,
  );
});
test("mode denominators exclude unavailable sentences and include unattempted items", () => {
  assert.equal(itemsForMode(content, "sentences").length, 1);
  assert.equal(itemsForMode(content, "characters").length, 1);
  const stats = summarize(
    itemsForMode(content, "vocabulary"),
    [],
    "vocabulary",
    "en-zh",
    2,
  );
  assert.equal(stats.total, 2);
  assert.equal(stats.unseen, 2);
  assert.equal(stats.mastered, 0);
});

test("recent accuracy and incorrect streaks use chronological filtered attempts", () => {
  const rows = Array.from({ length: 105 }, (_, i) =>
    attempt(i + 1, "word:1", i < 5),
  );
  const stats = summarize(
    itemsForMode(content, "vocabulary"),
    rows.reverse(),
    "vocabulary",
    "en-zh",
    2,
    100,
  );
  assert.equal(stats.recentAccuracy, 0);
  assert.equal(stats.recentCount, 100);
  assert.equal(stats.missedTarget, 1);
  assert.equal(stats.practiced, 1);
  assert.equal(
    summarize(
      itemsForMode(content, "vocabulary"),
      [...rows, attempt(106, "word:1", true)],
      "vocabulary",
      "en-zh",
      2,
    ).missedTarget,
    0,
  );
});

import { accuracyBuckets } from "../lib/statistics";
test("accuracy buckets include partial chunks and group UTC weeks", () => {
  const rows = Array.from({ length: 105 }, (_, i) =>
    attempt(i + 1, "word:1", i < 50),
  );
  assert.deepEqual(
    accuracyBuckets(rows.reverse(), "attempts").map((b) => [
      b.count,
      b.accuracy,
    ]),
    [
      [50, 100],
      [50, 0],
      [5, 0],
    ],
  );
  assert.equal(accuracyBuckets([], "day").length, 0);
  const dated = ["2026-10-04T23:59:59Z", "2026-10-05T00:00:00Z"].map(
    (d, i) => ({ ...attempt(i, "word:1", true), created_at: d }),
  );
  assert.deepEqual(
    accuracyBuckets(dated, "week").map((b) => b.label),
    ["2026-09-28", "2026-10-05"],
  );
});

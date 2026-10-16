import { test } from "node:test";
import assert from "node:assert/strict";
import { multipleChoices, choiceLabel } from "../lib/multiple-choice";
import { Word } from "../lib/study";
const words: Word[] = Array.from({ length: 8 }, (_, i) => ({
  id: String(i),
  chinese: `词${i}`,
  english: `meaning ${i}`,
  pinyin: `ci ${i}`,
  part_of_speech: "noun",
}));
test("choices contain the correct answer exactly once, default to five, and respect direction", () => {
  for (const direction of ["en-zh", "zh-en"] as const) {
    const choices = multipleChoices(
      { id: "word:0", mode: "vocabulary", word: words[0] },
      words,
      direction,
    );
    assert.equal(choices.length, 5);
    assert.equal(choices.filter((w) => w.id === "0").length, 1);
    assert.equal(
      new Set(choices.map((w) => choiceLabel(w, direction))).size,
      5,
    );
  }
});
test("choices exclude duplicate answers and other modes and handle small pools", () => {
  const question = {
    id: "word:0",
    mode: "vocabulary" as const,
    word: words[0],
  };
  const pool = [
    words[0],
    words[1],
    { ...words[2], english: words[0].english },
    { ...words[3], chinese: words[1].chinese },
    { ...words[4], part_of_speech: "idiom" },
  ];
  const choices = multipleChoices(question, pool, "en-zh");
  assert.equal(choices.length, 2);
  assert.ok(choices.some((w) => w.id === "0"));
  assert.equal(
    multipleChoices({ ...question, mode: "tones" }, words, "en-zh").length,
    0,
  );
  const idioms = words.map((w) => ({ ...w, part_of_speech: "idiom" }));
  assert.equal(
    multipleChoices(
      { ...question, mode: "idioms", word: idioms[0] },
      [...words, ...idioms],
      "en-zh",
      3,
    ).length,
    3,
  );
});

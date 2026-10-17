import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findSentences,
  mergeSentences,
  sentenceFeedbackPrompt,
  sentenceRecord,
  WrittenSentence,
} from "../lib/sentences";
const first: WrittenSentence = {
  id: "1",
  word_id: "a",
  chinese: "学习",
  pinyin: "xué xí",
  english: "study",
  priority: "1",
  sentence: "我每天学习中文。",
  created_at: "2026-10-01T10:00:00Z",
};
const second: WrittenSentence = {
  ...first,
  id: "2",
  chinese: "学校",
  pinyin: "xué xiào",
  english: "school",
  sentence: "我去学校。",
  created_at: "2026-10-03T10:00:00Z",
};
test("sentence records preserve the prompted word and trim learner writing", () => {
  const row = sentenceRecord(
    {
      id: "a",
      chinese: "学习",
      pinyin: "xué xí",
      english: "study",
      priority: "1",
    },
    "  我学习中文。\n",
  );
  assert.equal(row.word_id, "a");
  assert.equal(row.chinese, "学习");
  assert.equal(row.sentence, "我学习中文。");
  assert.ok(row.id);
  assert.ok(Number.isFinite(Date.parse(row.created_at)));
});
test("sentence search matches word, pinyin, meaning, text, and inclusive UTC dates", () => {
  const rows = [first, second];
  for (const query of ["学习", "XÍ", "STUDY", "每天", "学习 中文"])
    assert.deepEqual(findSentences(rows, query, "", ""), [first]);
  assert.deepEqual(findSentences(rows, "", "2026-10-03", "2026-10-03"), [
    second,
  ]);
  assert.deepEqual(findSentences(rows, "学校", "2026-10-04", ""), []);
});
test("merging deduplicates synced entries without dropping repeated sentences", () => {
  assert.deepEqual(mergeSentences([first], [second, first]), [second, first]);
  assert.equal(mergeSentences([first, { ...first, id: "another" }]).length, 2);
});
test("AI feedback export includes each selected word and exact learner sentence", () => {
  const row = { ...first, sentence: '学习\n"中文"。' };
  const prompt = sentenceFeedbackPrompt([row]);
  const exported = JSON.parse(prompt.slice(prompt.indexOf("[\n")));
  assert.equal(exported[0].target_word, first.chinese);
  assert.equal(exported[0].learner_sentence, row.sentence);
  assert.equal(exported[0].meaning, first.english);
  assert.equal(exported.length, 1);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  acceptedAnswers,
  Attempt,
  characterExamples,
  defaultFilters,
  grade,
  hsk,
  matches,
  mergeAttempts,
  quizDirection,
  streakMap,
  Word,
} from "../lib/study";
const word: Word = {
  id: "1",
  chinese: "你好",
  english: "hello; hi",
  tone_pattern: "3-3",
  priority: "2",
  movie_words_rank: "",
  hsk_level: "2;4",
  commonness: "3",
  date: "2026-09-01",
  is_slang: "0.5",
  category_l1: "People",
  category_l2: "Greetings",
  category_l3: "Hello",
  part_of_speech: "phrase",
  sentence: "你好，朋友。",
};
const attempt = (
  id: string,
  correct: boolean,
  direction = "en-zh",
): Attempt => ({
  id,
  item_id: "word:1",
  mode: "vocabulary",
  direction,
  answer: "你好",
  correct,
  overridden: false,
  created_at: `2026-09-0${id}T10:00:00Z`,
  updated_at: `2026-09-0${id}T10:00:00Z`,
});
test("normalization tolerates punctuation and whitespace, not different words", () => {
  assert.equal(grade(" 你 好！ ", ["你好。"]), true);
  assert.equal(grade("ＨＥＬＬＯ", ["hello"]), true);
  assert.equal(grade("您好", ["你好"]), false);
  assert.equal(grade("", [""]), false);
});
test("HSK uses lowest level and an advanced band", () => {
  assert.equal(hsk("2;4"), 2);
  assert.equal(hsk("7-9"), 7);
  assert.equal(hsk(""), null);
  assert.equal(
    matches(
      { ...word, hsk_level: "7-9" },
      { ...defaultFilters, hsk_level: "6" },
    ),
    false,
  );
  assert.equal(
    matches(
      { ...word, hsk_level: "7-9" },
      { ...defaultFilters, hsk_level: "7" },
    ),
    true,
  );
});
test("missing values are included only when allowed for active filters", () => {
  assert.equal(matches(word, defaultFilters), true);
  assert.equal(
    matches(word, { ...defaultFilters, movie_words_rank: "500" }),
    false,
  );
  assert.equal(
    matches(word, {
      ...defaultFilters,
      movie_words_rank: "500",
      unknown: true,
    }),
    true,
  );
  assert.equal(
    matches(
      { ...word, date: "" },
      { ...defaultFilters, dateMin: "2020-01-01" },
    ),
    false,
  );
});
test("slang 0.5 counts as non-slang and all filters combine", () => {
  assert.equal(matches(word, { ...defaultFilters, slang: "0" }), true);
  assert.equal(matches(word, { ...defaultFilters, slang: "1" }), false);
  assert.equal(matches(word, { ...defaultFilters, priority: "1" }), false);
  assert.equal(matches(word, { ...defaultFilters, pos: ["noun"] }), false);
  assert.equal(
    matches(word, {
      ...defaultFilters,
      dateMin: "2026-09-01",
      dateMax: "2026-09-01",
    }),
    true,
  );
});
test("streaks reset after a miss and are separate by direction and mode", () => {
  const rows = [
    attempt("1", true),
    attempt("2", true),
    attempt("3", false),
    attempt("4", true),
    attempt("5", true, "zh-en"),
  ];
  const map = streakMap(rows.reverse());
  assert.equal(map.get("word:1:vocabulary:en-zh"), 1);
  assert.equal(map.get("word:1:vocabulary:zh-en"), 1);
  assert.equal(map.get("word:1:tones:fixed"), undefined);
  assert.equal(quizDirection("tones", "en-zh"), "fixed");
});
test("tone answers use dictionary tones, sentences use the sentence", () => {
  assert.deepEqual(acceptedAnswers({ id: "1", mode: "tones", word }, "en-zh"), [
    "33",
  ]);
  assert.equal(
    grade(
      "hi",
      acceptedAnswers({ id: "1", mode: "vocabulary", word }, "zh-en"),
    ),
    true,
  );
  assert.deepEqual(
    acceptedAnswers({ id: "1", mode: "sentences", word }, "zh-en"),
    ["你好，朋友。"],
  );
});
test("character examples align traditional, simplified and translations", () => {
  assert.deepEqual(
    characterExamples({
      examples: "這個(这个);這裡(这里)",
      exampleEnglish: "this one;here",
    }),
    [
      { trad: "這個", simp: "这个", english: "this one" },
      { trad: "這裡", simp: "这里", english: "here" },
    ],
  );
});
test("sync deduplicates attempts and preserves newer overrides", () => {
  const old = attempt("1", false),
    edited = {
      ...old,
      correct: true,
      overridden: true,
      updated_at: "2026-10-01T00:00:00Z",
    };
  assert.deepEqual(mergeAttempts([edited], [old]), [edited]);
  assert.deepEqual(mergeAttempts([old], [edited]), [edited]);
});

test("sync compares instants even when Supabase timestamps use UTC offsets", () => {
  const local = {
    ...attempt("1", true),
    updated_at: "2026-09-01T10:00:00.000Z",
  };
  const remote = {
    ...local,
    correct: false,
    updated_at: "2026-09-01T11:00:01+01:00",
  };
  assert.equal(mergeAttempts([local], [remote])[0].correct, false);
});

test("vocabulary excludes idioms, defaults to no phrases, and supports character limits", async () => {
  const { vocabularyEligible } = await import("../lib/study");
  assert.equal(
    vocabularyEligible({ ...word, part_of_speech: "idiom" }, true),
    false,
  );
  assert.equal(
    vocabularyEligible({ ...word, part_of_speech: "phrase" }),
    false,
  );
  assert.equal(
    vocabularyEligible({ ...word, part_of_speech: "phrase" }, true),
    true,
  );
  assert.equal(
    vocabularyEligible({ ...word, part_of_speech: "noun" }, false, "1"),
    false,
  );
});
test("dash sentences are cleared and traditional answers accept contained simplified characters", async () => {
  const { cleanWord, gradeQuestion } = await import("../lib/study");
  const cleaned = cleanWord({
    ...word,
    sentence: " - ",
    sentence_pinyin: "-",
    sentence_english: "-",
  });
  assert.equal(cleaned.sentence, "");
  assert.equal(cleaned.sentence_english, "");
  assert.equal(
    gradeQuestion(
      "这个",
      { id: "char:1", mode: "characters", character: { simp: "这" } },
      "en-zh",
    ),
    true,
  );
  assert.equal(
    gradeQuestion(
      "這個",
      { id: "char:1", mode: "characters", character: { simp: "这" } },
      "en-zh",
    ),
    false,
  );
  assert.equal(
    gradeQuestion(
      "",
      { id: "char:1", mode: "characters", character: { simp: "这" } },
      "en-zh",
    ),
    false,
  );
});

test("character examples exclude known sentences and phrases", async () => {
  const { characterWordEligible, characterExamples } =
    await import("../lib/study");
  assert.equal(characterWordEligible({ part_of_speech: "sentence" }), false);
  assert.equal(characterWordEligible({ part_of_speech: "phrase" }), false);
  assert.equal(characterWordEligible({ part_of_speech: "noun" }), true);
  const examples = characterExamples(
    {
      examples: "學校(学校);我學中文(我学中文)",
      exampleEnglish: "school;I study Chinese",
    },
    [{ chinese: "我学中文", part_of_speech: "sentence" }],
  );
  assert.equal(examples.length, 1);
  assert.equal(examples[0].english, "school");
});

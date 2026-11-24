import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hasComponent,
  characterWords,
  radicalMatchesSearch,
} from "../lib/radicals";
import { loadRadicals } from "../scripts/radical-data";

test("structural matching separates similar shapes and positional forms", () => {
  assert.equal(hasComponent("⿰氵可", "三点水", "氵"), true);
  assert.equal(hasComponent("⿰冫令", "三点水", "氵"), false);
  assert.equal(hasComponent("⿴囗玉", "国字框", "囗"), true);
  assert.equal(hasComponent("⿴囗玉", "口字旁", "口"), false);
  assert.equal(hasComponent("⿰阝可", "左耳旁", "阝"), true);
  assert.equal(hasComponent("⿰阝可", "右耳旁", "阝"), false);
  assert.equal(hasComponent("⿰者阝", "右耳旁", "阝"), true);
  assert.equal(hasComponent("⿰者阝", "左耳旁", "阝"), false);
  assert.equal(hasComponent("⿰⺼佥", "月字旁", "月"), true);
  assert.equal(hasComponent("⿰足包", "足字旁", "𧾷"), true);
  assert.equal(hasComponent("⿱执灬", "四点底", "灬"), true);
  assert.equal(hasComponent("⿱⺮毛", "竹字头", "⺮"), true);
  assert.equal(hasComponent("⿸尸至", "尸字头", "尸"), true);
});
test("unknown, malformed and implicit subcomponents are not guessed", () => {
  for (const ids of ["？", "⿰氵？", "⿰氵", "⿰氵可木"])
    assert.equal(hasComponent(ids, "三点水", "氵"), false);
  assert.equal(hasComponent("⿰氵胡", "口字旁", "口"), false);
  assert.equal(hasComponent("⿱冂一", "同字框", "冂"), false);
});
test("all 90 CSV names load with recognizable examples and accent-insensitive search", () => {
  const { radicals } = loadRadicals();
  assert.equal(radicals.length, 90);
  assert.equal(new Set(radicals.map((r) => r.id)).size, 90);
  const water = radicals.find((r) => r.name === "三点水")!;
  for (const c of ["河", "海", "洗"]) assert.ok(water.characters.includes(c));
  for (const q of ["三点水", "氵", "san dian shui", "SĀN DIǍN SHUǏ", "water"])
    assert.ok(radicalMatchesSearch(water, q));
  assert.ok(!radicalMatchesSearch(water, "ice"));
  assert.ok(radicals.find((r) => r.name === "羊字旁")!.symbol === "羊");
});
test("vocabulary grouping deduplicates characters and IDs and respects adult filtering", () => {
  const word = {
    id: "1",
    chinese: "河河水",
    pinyin: "hé hé shuǐ",
    english: "test",
  };
  const words: Record<string, string>[] = [
    word,
    word,
    { id: "2", chinese: "海", is_adult: "1" },
    { id: "3", chinese: "abc123" },
  ];
  const groups = characterWords(words, true);
  assert.equal(groups.get("河")?.length, 1);
  assert.equal(groups.has("海"), false);
  assert.equal(groups.has("a"), false);
  assert.equal(characterWords(words, false).get("海")?.length, 1);
});

test("listening chooses one short word per character and skips unsuitable examples", async () => {
  const { radicalAudioExamples } = await import("../lib/radicals");
  const words: Record<string, string>[] = [
    { id: "single", chinese: "汁", priority: "1" },
    {
      id: "long",
      chinese: "我很喜欢喝果汁",
      part_of_speech: "sentence",
      priority: "1",
    },
    { id: "juice", chinese: "果汁", priority: "2" },
    { id: "tomato", chinese: "番茄汁", priority: "1" },
    { id: "exchange", chinese: "汇率", priority: "3" },
    { id: "filtered", chinese: "汁液", priority: "1", is_adult: "1" },
    { id: "no-word", chinese: "汉", priority: "1" },
  ];
  const groups = characterWords(words, true);
  assert.deepEqual(
    radicalAudioExamples(["汁", "汇", "汁", "汉"], groups).map((e) => e.text),
    ["果汁的汁", "汇率的汇"],
  );
  assert.equal(groups.get("汁")?.[0].id, "single");
});

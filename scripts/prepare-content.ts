import fs from "node:fs";
import Papa from "papaparse";
import { cleanWord } from "../lib/study";
import type { Content, Rule, Word } from "../lib/study";
export function loadContent(): Content {
  function csv(path: string, id: string): Word[] {
    const parsed = Papa.parse<Word>(fs.readFileSync(path, "utf8"), {
      header: true,
      skipEmptyLines: "greedy",
    });
    if (parsed.errors.length)
      throw new Error(`${path}: ${JSON.stringify(parsed.errors)}`);
    const seen = new Set<string>();
    for (const row of parsed.data) {
      if (!row[id] || seen.has(row[id]))
        throw new Error(`Missing/duplicate ${id} in ${path}: ${row[id]}`);
      seen.add(row[id]);
    }
    return parsed.data;
  }
  const grammar = JSON.parse(
    fs.readFileSync("data/grammar_content/grammar-exercises.json", "utf8"),
  );
  const rules: Rule[] = grammar.rules;
  const ids = new Set<string>();
  for (const r of rules) {
    if (ids.has(r.id)) throw new Error(`Duplicate rule ${r.id}`);
    ids.add(r.id);
    const exerciseIds = new Set(r.exercises.map((e) => e.id));
    for (const e of r.exercises) {
      if (
        ids.has(e.id) ||
        !e.accepted_answers.includes(e.expected.chinese) ||
        e.feedback_example_ids.some((id) => !exerciseIds.has(id) || id === e.id)
      )
        throw new Error(`Invalid exercise ${e.id}`);
      ids.add(e.id);
    }
  }
  return {
    words: csv(process.env.VOCAB_CSV || "data/mmd_20260909.csv", "id").map(
      cleanWord,
    ),
    characters: csv("data/trad_to_simp_char.csv", "idx"),
    rules,
    generatedAt: new Date().toISOString(),
  };
}
const content = loadContent();
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/content.json", JSON.stringify(content));
console.log(
  `Prepared ${content.words.length} words, ${content.characters.length} characters, ${content.rules.length} rules.`,
);

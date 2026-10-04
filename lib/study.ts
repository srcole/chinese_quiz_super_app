export type Word = Record<string, string>;
export type Exercise = {
  id: string;
  prompt_english: string;
  expected: { chinese: string; pinyin: string; english: string };
  accepted_answers: string[];
  feedback_example_ids: string[];
};
export type Rule = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  pattern: string;
  explanation: string;
  exercises: Exercise[];
};
export type Content = {
  words: Word[];
  characters: Word[];
  rules: Rule[];
  generatedAt: string;
};
export type Mode =
  "vocabulary" | "idioms" | "tones" | "sentences" | "characters" | "grammar";
export type Direction = "en-zh" | "zh-en";
export type Attempt = {
  id: string;
  item_id: string;
  mode: Mode;
  direction: string;
  answer: string;
  correct: boolean;
  overridden: boolean;
  created_at: string;
  updated_at: string;
};
export type Filters = {
  count: number;
  priority: string;
  movie_words_rank: string;
  hsk_level: string;
  commonness: string;
  dateMin: string;
  dateMax: string;
  unknown: boolean;
  slang: string;
  category_l1: string;
  category_l2: string;
  category_l3: string;
  pos: string[];
  streak: number;
};
export const defaultFilters: Filters = {
  count: 20,
  priority: "",
  movie_words_rank: "",
  hsk_level: "",
  commonness: "",
  dateMin: "",
  dateMax: "",
  unknown: false,
  slang: "",
  category_l1: "",
  category_l2: "",
  category_l3: "",
  pos: [],
  streak: 2,
};
export const modeNames: Record<Mode, string> = {
  vocabulary: "Vocabulary",
  idioms: "Idioms",
  tones: "Tones",
  sentences: "Sentence application",
  characters: "Traditional characters",
  grammar: "Grammar",
};
export function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{Z}\s]/gu, "");
}
export function grade(answer: string, accepted: string[]) {
  const value = normalize(answer);
  return !!value && accepted.some((x) => normalize(x) === value);
}
export function hsk(value: string) {
  const levels = value
    .split(";")
    .map((x) => Number(x.trim().split("-")[0]))
    .filter((x) => x > 0 && Number.isFinite(x));
  return levels.length ? Math.min(...levels) : null;
}
export function matches(w: Word, f: Filters) {
  for (const key of [
    "priority",
    "movie_words_rank",
    "hsk_level",
    "commonness",
  ] as const) {
    if (!f[key]) continue;
    const n =
      key === "hsk_level"
        ? hsk(w[key])
        : w[key]?.trim()
          ? Number(w[key])
          : null;
    if (n === null || !Number.isFinite(n)) {
      if (!f.unknown) return false;
    } else if (n > Number(f[key])) return false;
  }
  if (f.dateMin || f.dateMax) {
    if (!w.date) {
      if (!f.unknown) return false;
    } else if (
      (f.dateMin && w.date < f.dateMin) ||
      (f.dateMax && w.date > f.dateMax)
    )
      return false;
  }
  if (f.slang !== "" && (Number(w.is_slang) === 1 ? "1" : "0") !== f.slang)
    return false;
  for (const key of ["category_l1", "category_l2", "category_l3"] as const)
    if (f[key] && w[key] !== f[key]) return false;
  return !f.pos.length || f.pos.includes(w.part_of_speech);
}
export function historyKey(item: string, mode: Mode, direction: string) {
  return `${item}:${mode}:${direction}`;
}
export function streakMap(attempts: Attempt[]) {
  const result = new Map<string, number>();
  for (const a of [...attempts].sort(
    (a, b) =>
      Date.parse(a.created_at) - Date.parse(b.created_at) ||
      a.id.localeCompare(b.id),
  )) {
    const key = historyKey(a.item_id, a.mode, a.direction);
    result.set(key, a.correct ? (result.get(key) || 0) + 1 : 0);
  }
  return result;
}
export function quizDirection(mode: Mode, direction: Direction) {
  return ["vocabulary", "idioms", "sentences"].includes(mode)
    ? direction
    : "fixed";
}
export function shuffled<T>(items: T[], count: number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}
export type Question = {
  id: string;
  mode: Mode;
  word?: Word;
  character?: Word;
  rule?: Rule;
  exercise?: Exercise;
};
export function acceptedAnswers(q: Question, d: Direction) {
  if (q.exercise) return q.exercise.accepted_answers;
  if (q.character) return [q.character.simp];
  const w = q.word!;
  if (q.mode === "tones") return [w.tone_pattern.replace(/[^1-5]/g, "")];
  if (q.mode === "sentences") return [w.sentence];
  if (d === "en-zh") return [w.chinese];
  return [
    w.english,
    ...w.english
      .split(/;|\//)
      .map((x) => x.trim())
      .filter(Boolean),
  ];
}
export function characterExamples(c: Word) {
  const meanings = c.exampleEnglish.split(";");
  return c.examples
    .split(";")
    .filter(Boolean)
    .map((s, i) => {
      const m = s.match(/^(.+?)[(（](.+?)[)）]$/);
      return {
        trad: m?.[1] || s,
        simp: m?.[2] || s,
        english: meanings[i] || "",
      };
    });
}
export function mergeAttempts(local: Attempt[], remote: Attempt[]) {
  const map = new Map<string, Attempt>();
  for (const a of [...local, ...remote]) {
    const existing = map.get(a.id);
    if (!existing || Date.parse(a.updated_at) > Date.parse(existing.updated_at))
      map.set(a.id, a);
  }
  return [...map.values()].sort(
    (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
  );
}

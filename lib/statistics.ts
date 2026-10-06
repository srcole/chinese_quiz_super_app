import {
  Attempt,
  Content,
  Mode,
  cleanWord,
  historyKey,
  streakMap,
} from "./study";
export type StudyItem = {
  id: string;
  chinese: string;
  english: string;
  priority: number | null;
};
export function itemsForMode(content: Content, mode: Mode): StudyItem[] {
  if (mode === "grammar")
    return content.rules.flatMap((r) =>
      r.exercises.map((e) => ({
        id: e.id,
        chinese: e.expected.chinese,
        english: e.expected.english,
        priority: null,
      })),
    );
  if (mode === "characters")
    return content.characters.map((c) => ({
      id: `char:${c.idx}`,
      chinese: c.simp,
      english: c.English,
      priority: Number(c.priority) || null,
    }));
  return content.words
    .map(cleanWord)
    .filter((w) =>
      mode === "vocabulary"
        ? w.part_of_speech !== "idiom"
        : mode === "idioms"
          ? w.part_of_speech === "idiom"
          : mode === "sentences"
            ? !!w.sentence
            : mode === "tones"
              ? /^[1-5](?:-[1-5])*$/.test(w.tone_pattern)
              : true,
    )
    .map((w) => ({
      id: `word:${w.id}`,
      chinese: w.chinese,
      english: w.english,
      priority: Number(w.priority) || null,
    }));
}
export function summarize(
  items: StudyItem[],
  attempts: Attempt[],
  mode: Mode,
  direction: string,
  x: number,
) {
  const ids = new Set(items.map((i) => i.id));
  const rows = attempts.filter(
    (a) => a.mode === mode && a.direction === direction && ids.has(a.item_id),
  );
  const streaks = streakMap(rows);
  const practiced = new Set(rows.map((a) => a.item_id)).size;
  const correct = rows.filter((a) => a.correct).length;
  return {
    rows,
    total: items.length,
    practiced,
    unseen: items.length - practiced,
    correct,
    incorrect: rows.length - correct,
    accuracy: rows.length ? Math.round((correct / rows.length) * 100) : 0,
    mastered: items.filter(
      (i) => (streaks.get(historyKey(i.id, mode, direction)) || 0) >= x,
    ).length,
  };
}

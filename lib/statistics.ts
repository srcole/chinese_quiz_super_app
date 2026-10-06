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
  traditional?: string;
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
      traditional: c.trad,
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
      traditional: w.trad_char,
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
  incorrectX = 1,
) {
  const ids = new Set(items.map((i) => i.id));
  const rows = attempts
    .filter(
      (a) => a.mode === mode && a.direction === direction && ids.has(a.item_id),
    )
    .sort(
      (a, b) =>
        Date.parse(a.created_at) - Date.parse(b.created_at) ||
        a.id.localeCompare(b.id),
    );
  const misses = new Map<string, number>();
  for (const a of rows)
    misses.set(a.item_id, a.correct ? 0 : (misses.get(a.item_id) || 0) + 1);
  const recent = rows.slice(-100);
  const streaks = streakMap(rows);
  const practiced = new Set(rows.map((a) => a.item_id)).size;
  const correct = rows.filter((a) => a.correct).length;
  return {
    rows,
    recentCount: recent.length,
    recentAccuracy: recent.length
      ? Math.round(
          (recent.filter((a) => a.correct).length / recent.length) * 100,
        )
      : null,
    missedTarget: [...misses.values()].filter((n) => n >= incorrectX).length,
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

export function accuracyBuckets(
  attempts: Attempt[],
  mode: "attempts" | "day" | "week" | "month",
  size = 50,
) {
  const rows = [...attempts].sort(
    (a, b) =>
      Date.parse(a.created_at) - Date.parse(b.created_at) ||
      a.id.localeCompare(b.id),
  );
  const groups = new Map<string, Attempt[]>();
  rows.forEach((a, i) => {
    const d = new Date(a.created_at);
    if (mode === "week")
      d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const key =
      mode === "attempts"
        ? `Attempts ${Math.floor(i / Math.max(1, size)) * Math.max(1, size) + 1}–${Math.min(rows.length, (Math.floor(i / Math.max(1, size)) + 1) * Math.max(1, size))}`
        : d.toISOString().slice(0, mode === "month" ? 7 : 10);
    const group = groups.get(key);
    if (group) group.push(a);
    else groups.set(key, [a]);
  });
  return [...groups].map(([label, rows]) => ({
    label,
    count: rows.length,
    accuracy: Math.round(
      (rows.filter((a) => a.correct).length / rows.length) * 100,
    ),
  }));
}

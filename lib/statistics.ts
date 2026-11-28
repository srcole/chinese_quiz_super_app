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
  includeMultipleChoice = false,
) {
  const ids = new Set(items.map((i) => i.id));
  const rows = attempts
    .filter(
      (a) =>
        (!a.multiple_choice || includeMultipleChoice) &&
        a.mode === mode &&
        a.direction === direction &&
        ids.has(a.item_id),
    )
    .sort(
      (a, b) =>
        Date.parse(a.created_at) - Date.parse(b.created_at) ||
        a.id.localeCompare(b.id),
    );
  const misses = new Map<string, number>();
  const afterHistory = [
    {
      label: "Previously correct",
      minimumMisses: 0,
      correct: 0,
      total: 0,
      rows: [] as Attempt[],
    },
    ...[1, 2, 3].map((n) => ({
      label: `Previous ${n} ${n === 1 ? "answer" : "answers"} incorrect`,
      minimumMisses: n,
      correct: 0,
      total: 0,
      rows: [] as Attempt[],
    })),
  ];
  for (const a of rows) {
    const previousMisses = misses.get(a.item_id);
    if (previousMisses !== undefined) {
      for (const bucket of afterHistory) {
        if (
          bucket.minimumMisses === 0
            ? previousMisses === 0
            : previousMisses >= bucket.minimumMisses
        ) {
          bucket.total++;
          bucket.rows.push(a);
          if (a.correct) bucket.correct++;
        }
      }
    }
    misses.set(a.item_id, a.correct ? 0 : (misses.get(a.item_id) || 0) + 1);
  }
  const recent = rows.slice(-100);
  const streaks = streakMap(rows);
  const practiced = new Set(rows.map((a) => a.item_id)).size;
  const correct = rows.filter((a) => a.correct).length;
  return {
    rows,
    afterHistory: afterHistory.map((bucket) => ({
      ...bucket,
      accuracy: bucket.total
        ? Math.round((bucket.correct / bucket.total) * 100)
        : null,
    })),
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

export function practiceBuckets(
  attempts: Attempt[],
  mode: "day" | "week" | "month",
) {
  const groups = new Map<string, Set<string>>();
  for (const attempt of attempts) {
    const date = new Date(attempt.created_at);
    if (!Number.isFinite(date.getTime())) continue;
    if (mode === "week")
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    const label = date.toISOString().slice(0, mode === "month" ? 7 : 10);
    if (!groups.has(label)) groups.set(label, new Set());
    groups.get(label)!.add(attempt.item_id);
  }
  const labels = [...groups.keys()].sort();
  if (!labels.length) return [];
  const date = new Date(
    `${labels[0]}${mode === "month" ? "-01" : ""}T00:00:00Z`,
  );
  const buckets: { label: string; count: number }[] = [];
  while (true) {
    const label = date.toISOString().slice(0, mode === "month" ? 7 : 10);
    if (label > labels.at(-1)!) break;
    buckets.push({ label, count: groups.get(label)?.size ?? 0 });
    if (mode === "month") date.setUTCMonth(date.getUTCMonth() + 1);
    else date.setUTCDate(date.getUTCDate() + (mode === "week" ? 7 : 1));
  }
  return buckets;
}

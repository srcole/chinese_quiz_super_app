import type { Word } from "./study";

export type WrittenSentence = {
  id: string;
  word_id: string;
  chinese: string;
  pinyin: string;
  english: string;
  priority: string;
  sentence: string;
  created_at: string;
  feedback_copied_at?: string | null;
  updated_at?: string;
};

export function sentenceRecord(word: Word, sentence: string): WrittenSentence {
  return {
    id: crypto.randomUUID(),
    word_id: word.id,
    chinese: word.chinese,
    pinyin: word.pinyin || "",
    english: word.english || "",
    priority: word.priority || "",
    sentence: sentence.trim(),
    created_at: new Date().toISOString(),
  };
}

export function mergeSentences(
  ...groups: WrittenSentence[][]
): WrittenSentence[] {
  const merged = new Map<string, WrittenSentence>();
  for (const row of groups.flat()) {
    const previous = merged.get(row.id);
    if (
      !previous ||
      Date.parse(row.updated_at || row.created_at) >
        Date.parse(previous.updated_at || previous.created_at)
    )
      merged.set(row.id, row);
  }
  return [...merged.values()].sort(
    (a, b) =>
      b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id),
  );
}

export function findSentences(
  rows: WrittenSentence[],
  query: string,
  from: string,
  through: string,
) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    const date = row.created_at.slice(0, 10);
    const text = [row.chinese, row.pinyin, row.english, row.sentence]
      .join(" ")
      .toLocaleLowerCase();
    return (
      (!from || date >= from) &&
      (!through || date <= through) &&
      terms.every((term) => text.includes(term))
    );
  });
}

export function sentenceFeedbackPrompt(rows: WrittenSentence[]) {
  return JSON.stringify(
    rows.map(({ chinese, sentence }) => ({
      target_word: chinese,
      learner_sentence: sentence,
    })),
    null,
    2,
  );
}

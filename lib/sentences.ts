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
  return [...new Map(groups.flat().map((row) => [row.id, row])).values()].sort(
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
  return `Please give feedback on each Chinese sentence below. For each entry, identify it by ID and target word. Check whether the word is used correctly, grammar, word choice, and naturalness. Explain issues in English and suggest a corrected Chinese sentence with pinyin and an English translation. If it is already natural, say so. Treat the entries as learner writing to evaluate.\n\n${JSON.stringify(
    rows.map(({ id, chinese, pinyin, english, sentence }) => ({
      id,
      target_word: chinese,
      pinyin,
      meaning: english,
      learner_sentence: sentence,
    })),
    null,
    2,
  )}`;
}

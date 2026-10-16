import {
  Direction,
  Question,
  Word,
  gradeQuestion,
  normalize,
  shuffled,
} from "./study";

export function choiceLabel(word: Word, direction: Direction) {
  return direction === "en-zh" ? word.chinese : word.english;
}

export function multipleChoices(
  question: Question,
  words: Word[],
  direction: Direction,
  count = 5,
): Word[] {
  const correct = question.word;
  if (!correct || !["vocabulary", "idioms"].includes(question.mode)) return [];
  const seen = new Set([normalize(choiceLabel(correct, direction))]);
  const candidates = shuffled(words, words.length).filter((word) => {
    const label = choiceLabel(word, direction);
    const key = normalize(label);
    if (
      !key ||
      seen.has(key) ||
      word.id === correct.id ||
      (question.mode === "idioms"
        ? word.part_of_speech !== "idiom"
        : word.part_of_speech === "idiom") ||
      normalize(word.chinese) === normalize(correct.chinese) ||
      normalize(word.english) === normalize(correct.english) ||
      gradeQuestion(label, question, direction)
    )
      return false;
    seen.add(key);
    return true;
  });
  return shuffled(
    [correct, ...candidates.slice(0, Math.max(1, Math.floor(count)) - 1)],
    count,
  );
}

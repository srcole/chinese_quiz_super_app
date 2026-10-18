"use client";
import { useMemo, useRef, useState } from "react";
import { vocabularyEligible, Word } from "@/lib/study";
import { sentenceRecord, WrittenSentence } from "@/lib/sentences";

export default function SentenceWriting({
  words,
  ready,
  save,
  status,
}: {
  words: Word[];
  ready: boolean;
  save: (row: WrittenSentence) => boolean;
  status: string;
}) {
  const [priority, setPriority] = useState("5");
  const [selected, setSelected] = useState<Word | null>(null);
  const [sentence, setSentence] = useState("");
  const [saved, setSaved] = useState(false);
  const sentenceInput = useRef<HTMLTextAreaElement>(null);
  const [showHints, setShowHints] = useState(false);
  const pool = useMemo(
    () =>
      words.filter(
        (word) =>
          vocabularyEligible(word) &&
          (!priority ||
            (!!word.priority && Number(word.priority) <= Number(priority))),
      ),
    [words, priority],
  );
  const word =
    selected && pool.some((w) => w.id === selected.id) ? selected : pool[0];
  function next() {
    const alternatives = pool.filter((w) => w.id !== word?.id);
    setSelected(
      alternatives[Math.floor(Math.random() * alternatives.length)] ||
        word ||
        null,
    );
    setSentence("");
    setSaved(false);
    sentenceInput.current?.focus();
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKE THE WORD YOURS</div>
          <h1>
            Write an <em>example.</em>
          </h1>
          <p>Use the prompted vocabulary word in your own Chinese sentence.</p>
        </div>
      </div>
      <section className="panel setup">
        <label className="field">
          <span>Writing maximum priority</span>
          <input
            type="number"
            min="1"
            placeholder="Any"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setSelected(null);
              setSentence("");
              setSaved(false);
            }}
          />
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => setShowHints(e.target.checked)}
          />
          Show pinyin and English
        </label>
        <p className="helper">
          {pool.length.toLocaleString()} vocabulary words available
        </p>
      </section>
      {word ? (
        <section className="panel sentence-writing">
          <h2>
            <span lang="zh-Hans">{word.chinese}</span>{" "}
            <span lang="zh-Hant">({word.trad_char || word.chinese})</span>
          </h2>
          {showHints && (
            <>
              <p className="pinyin">{word.pinyin}</p>
              <p>{word.english}</p>
            </>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                ready &&
                sentence.trim() &&
                save(sentenceRecord(word, sentence))
              ) {
                next();
                setSaved(true);
              }
            }}
          >
            <label className="field">
              <span>Your example sentence</span>
              <textarea
                lang="zh-Hans"
                rows={4}
                value={sentence}
                required
                ref={sentenceInput}
                onKeyDown={(e) => {
                  if (
                    e.key !== "Enter" ||
                    e.shiftKey ||
                    e.nativeEvent.isComposing ||
                    e.keyCode === 229
                  )
                    return;
                  e.preventDefault();
                  if (!e.repeat && ready && sentence.trim())
                    e.currentTarget.form?.requestSubmit();
                }}
                onChange={(e) => {
                  setSentence(e.target.value);
                  setSaved(false);
                }}
                placeholder={`Write a Chinese sentence using ${word.chinese}…`}
              />
            </label>
            <p className="helper">
              Enter to save · Shift+Enter for a new line.
            </p>
            <div className="inline">
              <button
                type="submit"
                className="primary"
                disabled={!ready || !sentence.trim()}
              >
                Save sentence
              </button>
              <button type="button" onClick={next}>
                Skip word →
              </button>
            </div>
          </form>
          {saved && (
            <p role="status">
              Saved. Find this sentence in Progress → Your written sentences.
            </p>
          )}
          <p className="helper">
            Your writing is saved for later review and is not automatically
            graded.
          </p>
        </section>
      ) : (
        <p className="panel empty">
          No vocabulary words match this priority. Try a higher maximum or clear
          it.
        </p>
      )}
      <p role="status" className="helper">
        {status}
      </p>
    </>
  );
}

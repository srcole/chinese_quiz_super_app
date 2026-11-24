"use client";
import { useEffect, useMemo, useState } from "react";
import type { Word } from "@/lib/study";
import type { PriorityChange } from "@/lib/priorities";
import {
  characterWords,
  radicalMatchesSearch,
  radicalAudioExamples,
  type RadicalCatalog,
} from "@/lib/radicals";
import PriorityControls from "./priority-controls";

type Props = {
  words: Word[];
  originalWords: Map<string, Word>;
  changes: Map<string, PriorityChange>;
  ready: boolean;
  status: string;
  save: (word: Word, value: number | null) => boolean;
  play: (text: string) => void;
  playExamples: (texts: string[]) => void;
  stop: () => void;
};
function CharacterCard({
  character,
  words,
  ...props
}: Props & { character: string }) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  return (
    <details
      className="panel radical-character"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span lang="zh-Hans" className="radical-glyph">
          {character}
        </span>
        <span>
          {words.length} vocabulary {words.length === 1 ? "entry" : "entries"}
        </span>
      </summary>
      {open && (
        <div className="radical-examples">
          {words.slice(0, limit).map((word) => (
            <div className="example" key={word.id}>
              <p lang="zh-Hans">{word.chinese}</p>
              <p className="pinyin">{word.pinyin}</p>
              <p>{word.english}</p>
              <button
                type="button"
                className="quiet"
                aria-label={`Listen to ${word.chinese}`}
                onClick={() => props.play(word.chinese)}
              >
                ◖)) Listen
              </button>
              <PriorityControls
                word={props.originalWords.get(word.id) || word}
                change={props.changes.get(word.id)}
                ready={props.ready}
                save={(w, value) => {
                  props.stop();
                  return props.save(w, value);
                }}
              />
            </div>
          ))}
          {limit < words.length && (
            <button type="button" onClick={() => setLimit((n) => n + 10)}>
              Show more vocabulary
            </button>
          )}
        </div>
      )}
    </details>
  );
}
export default function RadicalReview(props: Props) {
  const [catalog, setCatalog] = useState<RadicalCatalog | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("三点水");
  const [excludeAdult, setExcludeAdult] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    fetch("/radicals.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Radical data could not be loaded.");
        return response.json();
      })
      .then((data: RadicalCatalog) => {
        if (
          !Array.isArray(data.radicals) ||
          !data.radicals.length ||
          data.radicals.some((r) => !r.id || !Array.isArray(r.characters))
        )
          throw new Error("Radical data is incomplete.");
        if (!controller.signal.aborted) setCatalog(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Could not load radical review. Please try again.");
      });
    return () => controller.abort();
  }, [retry]);
  const groups = useMemo(
    () => characterWords(props.words, excludeAdult),
    [props.words, excludeAdult],
  );
  const options = useMemo(
    () => catalog?.radicals.filter((r) => radicalMatchesSearch(r, query)) || [],
    [catalog, query],
  );
  const radical = catalog?.radicals.find((r) => r.id === selected);
  const characters = useMemo(
    () => radical?.characters.filter((c) => groups.has(c)) || [],
    [radical, groups],
  );
  const examples = useMemo(
    () => radicalAudioExamples(characters, groups),
    [characters, groups],
  );
  if (error)
    return (
      <section className="panel">
        <p role="alert">{error}</p>
        <button onClick={() => setRetry((n) => n + 1)}>
          Retry radical review
        </button>
      </section>
    );
  if (!catalog) return <p role="status">Loading radical review…</p>;
  return (
    <>
      <section className="panel setup">
        <div className="field-grid">
          <label className="field">
            <span>Find a radical</span>
            <input
              value={query}
              placeholder="三点水, 氵, san dian shui, water…"
              onChange={(event) => {
                props.stop();
                const next = event.target.value;
                setQuery(next);
                const matches = catalog.radicals.filter((r) =>
                  radicalMatchesSearch(r, next),
                );
                if (!matches.some((r) => r.id === selected))
                  setSelected(matches[0]?.id || "");
              }}
            />
          </label>
          <label className="field">
            <span>Radical name</span>
            <select
              value={options.some((r) => r.id === selected) ? selected : ""}
              onChange={(event) => {
                props.stop();
                setSelected(event.target.value);
              }}
              disabled={!options.length}
            >
              <option value="" disabled>
                {options.length ? "Choose a radical" : "No matching radicals"}
              </option>
              {options.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.name} · {r.symbol} · {r.pinyin}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!options.length && (
          <p role="status">
            No radical names match your search. Try a different name, symbol,
            pinyin, or English word.
          </p>
        )}
        <label className="check-field">
          <input
            type="checkbox"
            checked={excludeAdult}
            onChange={(event) => {
              props.stop();
              setExcludeAdult(event.target.checked);
            }}
          />
          Exclude adult-themed vocabulary
        </label>
        <p className="helper">
          Browse recognizable components in simplified vocabulary headwords.
          Coverage is partial; some characters and component variants may be
          missing. Other review filters do not apply here.
        </p>
      </section>
      {radical && (
        <>
          <div className="radical-heading">
            <h2>
              {radical.name} <span lang="zh-Hans">{radical.symbol}</span>
            </h2>
            <p className="pinyin">{radical.pinyin}</p>
            <p>{radical.english}</p>
            <button
              type="button"
              className="quiet"
              onClick={() => props.play(radical.name)}
            >
              ◖)) Listen to radical name
            </button>
            <p role="status">
              {characters.length} matching characters in your vocabulary
            </p>
            <button
              type="button"
              className="primary"
              disabled={!examples.length}
              onClick={() =>
                props.playExamples(examples.map((example) => example.text))
              }
            >
              ◖)) Listen to examples ({examples.length})
            </button>
            <p className="helper">
              One short word per character, read as “果汁的汁”. Characters
              without a suitable word are skipped. Use the audio controls to
              pause or stop.
            </p>
            {!!examples.length && (
              <details>
                <summary>Preview listening examples</summary>
                <p lang="zh-Hans">
                  {examples.map((example) => example.text).join("，")}。
                </p>
              </details>
            )}
            <p className="helper">
              Open a character to see words, their pronunciations and meanings.
            </p>
          </div>
          <p role="status" className="helper">
            {props.status}
          </p>
          {!characters.length && (
            <p className="panel">
              No indexed characters for this radical appear in your current
              vocabulary. Try another radical or include adult-themed
              vocabulary.
            </p>
          )}
          <div className="radical-grid" key={selected}>
            {characters.map((character) => (
              <CharacterCard
                {...props}
                key={character}
                character={character}
                words={groups.get(character)!}
              />
            ))}
          </div>
        </>
      )}
      <p className="helper">
        Component data:{" "}
        <a
          href="https://github.com/skishore/makemeahanzi"
          target="_blank"
          rel="noreferrer"
        >
          Make Me a Hanzi
        </a>{" "}
        ·{" "}
        <a href="/radical-source/NOTICE.txt" target="_blank" rel="noreferrer">
          Source and license
        </a>
      </p>
    </>
  );
}

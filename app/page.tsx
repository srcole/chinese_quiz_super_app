"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cleanWord,
  characterWordEligible,
  vocabularyEligible,
  gradeQuestion,
  questionChinese,
  questionEnglish,
  Attempt,
  characterExamples,
  Content,
  defaultFilters,
  Direction,
  Filters,
  historyKey,
  matches,
  Mode,
  modeNames,
  Question,
  quizDirection,
  Rule,
  shuffled,
  streakMap,
  Word,
} from "@/lib/study";
import { usePreference } from "@/lib/use-preference";
import { useAudio } from "@/lib/use-audio";
import TraditionalText from "./traditional-text";
import ProgressPanel from "./progress-panel";
import { useProgress } from "@/lib/use-progress";
import { supabase } from "@/lib/supabase";
const descriptions: Record<Mode, string> = {
  vocabulary: "Find the meaning, build your vocabulary.",
  idioms: "Discover the stories inside expressions.",
  tones: "Train your ear for the shape of a word.",
  sentences: "Put your vocabulary into practice.",
  characters: "Connect traditional and simplified forms.",
  grammar: "Make the patterns feel natural.",
};
const icons: Record<Mode, string> = {
  vocabulary: "字",
  idioms: "言",
  tones: "声",
  sentences: "句",
  characters: "體",
  grammar: "法",
};
const reviewNames = {
  category: "By category",
  history: "Focus on tricky words",
  character: "By Chinese character",
  grammar: "Grammar listening",
};
type ReviewMode = keyof typeof reviewNames;
type Preset = {
  name: string;
  filters: Filters;
  mode: Mode;
  direction: Direction;
};
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Select({
  value,
  onChange,
  options,
  placeholder = "Any",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((v) => (
        <option key={v} value={v}>
          {v.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
function WordDetails({
  w,
  compact = false,
  feedback = false,
  idiom = false,
}: {
  w: Word;
  compact?: boolean;
  feedback?: boolean;
  idiom?: boolean;
}) {
  return (
    <>
      <div className="word-title">
        <span lang="zh-Hans">{w.chinese}</span>
        <span className="traditional" lang="zh-Hant">
          <TraditionalText traditional={w.trad_char} simplified={w.chinese} />
        </span>
      </div>
      <p className="pinyin">{w.pinyin}</p>
      <p className="meaning">{w.english}</p>
      {feedback && w.component_explanation && (
        <p className="components">{w.component_explanation}</p>
      )}
      {feedback && (w.literal_translation || idiom) && (
        <div className="literal-breakdown">
          <span>Literal translation</span>
          <p>{w.literal_translation || "Not provided in the source data."}</p>
        </div>
      )}
      {!compact && (
        <>
          {w.sentence && (
            <div className="example">
              <p lang="zh-Hans">{w.sentence}</p>
              <p className="pinyin">{w.sentence_pinyin}</p>
              <p>{w.sentence_english}</p>
            </div>
          )}
          {!feedback && w.component_explanation && (
            <p className="components">{w.component_explanation}</p>
          )}
        </>
      )}
    </>
  );
}
export default function Home() {
  const [content, setContent] = useState<Content | null>(null),
    [loadError, setLoadError] = useState(""),
    [contentNote, setContentNote] = useState("");
  const [tab, setTab] = useState<"quiz" | "review" | "progress" | "settings">(
      "quiz",
    ),
    [mode, setMode] = useState<Mode>("vocabulary"),
    [direction, setDirection] = useState<Direction>("en-zh"),
    [filters, setFilters] = useState<Filters>(defaultFilters);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("category"),
    [reviewQuiz, setReviewQuiz] = useState<Mode>("vocabulary"),
    [reviewPriority, setReviewPriority] = useState(""),
    [character, setCharacter] = useState(""),
    [ruleId, setRuleId] = useState(""),
    [grammarCategory, setGrammarCategory] = useState(""),
    [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]),
    [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [submitted, setSubmitted] = useState<Attempt | null>(null),
    [finished, setFinished] = useState(false),
    [sessionIds, setSessionIds] = useState<string[]>([]);
  const [reviewStarted, setReviewStarted] = useState(false),
    [reviewLimit, setReviewLimit] = useState(50),
    [email, setEmail] = useState(""),
    [authMessage, setAuthMessage] = useState(""),
    [autoAudio, setAutoAudio] = usePreference("zili-auto-audio", true),
    [presets, setPresets] = useState<Preset[]>([]),
    [presetName, setPresetName] = useState(""),
    [notice, setNotice] = useState("");
  const [toneMax, setToneMax] = useState("2"),
    [tonePrompt, setTonePrompt] = useState(true),
    [charMin, setCharMin] = useState(""),
    [charMax, setCharMax] = useState("");
  const [includePhrases, setIncludePhrases] = useState(false),
    [includeSentences, setIncludeSentences] = useState(false),
    [vocabMax, setVocabMax] = useState(""),
    [audioOnly, setAudioOnly] = useState(false);
  const [reviewSentences, setReviewSentences] = useState(false);
  const audio = useAudio(),
    progress = useProgress(),
    input = useRef<HTMLInputElement>(null),
    activeRow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    fetch("/content.json")
      .then((r) => {
        if (!r.ok) throw new Error("Content could not be loaded.");
        return r.json();
      })
      .then((data) => {
        if (alive) setContent({ ...data, words: data.words.map(cleanWord) });
      })
      .catch((e) => {
        if (alive) setLoadError(e.message);
      });
    try {
      setPresets(JSON.parse(localStorage.getItem("zili-presets") || "[]"));
    } catch {}
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!supabase || !progress.user) return;
    let alive = true;
    async function load() {
      try {
        let records: { kind: string; payload: Word | Rule }[] = [];
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabase!
            .from("study_content")
            .select("kind,payload")
            .eq("active", true)
            .order("id")
            .range(offset, offset + 999);
          if (error) throw error;
          records.push(...data);
          if (data.length < 1000) break;
        }
        if (!alive) return;
        if (!records.length) {
          setContentNote(
            "Using bundled content. Import your data into Supabase to enable content updates.",
          );
          return;
        }
        setContent({
          words: records
            .filter((x) => x.kind === "word")
            .map((x) => cleanWord(x.payload as Word)),
          characters: records
            .filter((x) => x.kind === "character")
            .map((x) => x.payload as Word),
          rules: records
            .filter((x) => x.kind === "rule")
            .map((x) => x.payload as Rule),
          generatedAt: new Date().toISOString(),
        });
        setContentNote("");
      } catch {
        if (alive)
          setContentNote(
            "Cloud content unavailable. Using the bundled data; your answers still save locally.",
          );
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [progress.user]);
  const streaks = useMemo(
    () => streakMap(progress.attempts),
    [progress.attempts],
  );
  const words = content?.words || [],
    rules = content?.rules || [];
  const pos = useMemo(
    () => [...new Set(words.map((w) => w.part_of_speech))].sort(),
    [words],
  );
  const categories = (level: "category_l1" | "category_l2" | "category_l3") =>
    [
      ...new Set(
        words
          .filter(
            (w) =>
              (level === "category_l1" ||
                !filters.category_l1 ||
                w.category_l1 === filters.category_l1) &&
              (level !== "category_l3" ||
                !filters.category_l2 ||
                w.category_l2 === filters.category_l2),
          )
          .map((w) => w[level])
          .filter(Boolean),
      ),
    ].sort();
  const eligible = useMemo(() => {
    if (!content) return [];
    if (mode === "characters")
      return content.characters
        .filter(
          (c) =>
            (!charMin || Number(c.priority) >= Number(charMin)) &&
            (!charMax || Number(c.priority) <= Number(charMax)),
        )
        .map((character) => ({
          id: `char:${character.idx}`,
          mode,
          character,
        }));
    if (mode === "grammar")
      return content.rules
        .filter(
          (r) =>
            (!ruleId || r.id === ruleId) &&
            (!grammarCategory || r.category === grammarCategory) &&
            (!difficulty || r.difficulty === difficulty),
        )
        .flatMap((rule) =>
          rule.exercises.map((exercise) => ({
            id: exercise.id,
            mode,
            rule,
            exercise,
          })),
        );
    return content.words
      .filter(
        (w) =>
          matches(w, filters) &&
          (mode !== "vocabulary" ||
            vocabularyEligible(
              w,
              includePhrases || filters.pos.includes("phrase"),
              vocabMax,
              includeSentences || filters.pos.includes("sentence"),
            )) &&
          (mode !== "idioms" || w.part_of_speech === "idiom") &&
          (mode !== "sentences" || !!w.sentence) &&
          (mode !== "tones" ||
            (/^[1-5](?:-[1-5])*$/.test(w.tone_pattern) &&
              (!toneMax ||
                (w.chinese.match(/\p{Script=Han}/gu) || []).length <=
                  Number(toneMax)))) &&
          (!filters.streak ||
            (streaks.get(
              historyKey(`word:${w.id}`, mode, quizDirection(mode, direction)),
            ) || 0) < filters.streak),
      )
      .map((word) => ({ id: `word:${word.id}`, mode, word }));
  }, [
    content,
    mode,
    direction,
    filters,
    streaks,
    ruleId,
    grammarCategory,
    difficulty,
    includePhrases,
    includeSentences,
    vocabMax,
    toneMax,
    charMin,
    charMax,
  ]);
  const reviewWords = useMemo(
    () =>
      words.filter((w) => {
        if (filters.pos.length && !filters.pos.includes(w.part_of_speech))
          return false;
        if (reviewMode === "character")
          return (
            !!character.trim() &&
            characterWordEligible(w) &&
            (w.chinese.includes(character.trim()) ||
              w.trad_char.includes(character.trim()))
          );
        if (reviewMode === "history")
          return (
            (!reviewPriority || w.priority === reviewPriority) &&
            (reviewQuiz !== "vocabulary" || w.part_of_speech !== "idiom") &&
            (reviewQuiz !== "idioms" || w.part_of_speech === "idiom") &&
            (reviewQuiz !== "sentences" || !!w.sentence) &&
            (reviewQuiz !== "tones" ||
              /^[1-5](?:-[1-5])*$/.test(w.tone_pattern)) &&
            (streaks.get(
              historyKey(
                `word:${w.id}`,
                reviewQuiz,
                quizDirection(reviewQuiz, direction),
              ),
            ) || 0) < Math.max(1, filters.streak)
          );
        return (
          (!filters.category_l1 || w.category_l1 === filters.category_l1) &&
          (!filters.category_l2 || w.category_l2 === filters.category_l2) &&
          (!filters.category_l3 || w.category_l3 === filters.category_l3)
        );
      }),
    [
      words,
      filters,
      reviewMode,
      character,
      reviewPriority,
      reviewQuiz,
      streaks,
      direction,
    ],
  );
  const reviewRule = rules.find((r) => r.id === ruleId);
  const q = questions[index];
  const sessionResults = progress.attempts.filter((a) =>
    sessionIds.includes(a.id),
  );
  useEffect(() => {
    activeRow.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [audio.row]);
  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    audio.stop();
    setReviewStarted(false);
    setReviewLimit(50);
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key === "category_l1"
        ? { category_l2: "", category_l3: "" }
        : key === "category_l2"
          ? { category_l3: "" }
          : {}),
    }));
  }
  function changeTab(next: typeof tab) {
    audio.stop();
    setTab(next);
    setQuestions([]);
    setFinished(false);
    setReviewStarted(false);
    setNotice("");
  }
  function promptSpeech(question: Question) {
    if (
      (!autoAudio &&
        !(
          question.mode === "vocabulary" &&
          direction === "zh-en" &&
          audioOnly
        )) ||
      (question.mode === "tones" && !tonePrompt)
    )
      return;
    const w = question.word;
    if (w && (question.mode === "tones" || direction === "zh-en"))
      audio.play([{ text: w.chinese, row: 0 }]);
  }
  function start() {
    const requested = Math.max(1, Math.floor(Number(filters.count) || 3));
    if (requested > eligible.length) {
      setFilters({ ...filters, count: eligible.length });
      setNotice(
        `Only ${eligible.length} questions are eligible. Reduce the question count to ${eligible.length} or fewer. I've filled in the maximum; press Start when ready.`,
      );
      return;
    }
    setNotice("");
    const list = shuffled<Question>(
      eligible,
      Math.max(1, Math.min(500, Number(filters.count) || 3)),
    );
    setQuestions(list);
    setIndex(0);
    setAnswer("");
    setSubmitted(null);
    setFinished(false);
    setSessionIds([]);
    audio.stop();
    if (list[0]) promptSpeech(list[0]);
    setTimeout(() => input.current?.focus(), 50);
  }
  function feedbackSpeech(question: Question) {
    if (question.character)
      return [
        question.character.simp,
        ...characterExamples(question.character, words).map((e) => e.simp),
      ];
    if (question.exercise)
      return [
        question.exercise.expected.chinese,
        ...question.exercise.feedback_example_ids.map(
          (id) =>
            question.rule!.exercises.find((e) => e.id === id)?.expected
              .chinese || "",
        ),
      ];
    return [question.word!.chinese, question.word!.sentence].filter(Boolean);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q) return;
    if (submitted) {
      next();
      return;
    }
    const now = new Date().toISOString();
    const a: Attempt = {
      id: crypto.randomUUID(),
      item_id: q.id,
      mode: q.mode,
      direction: quizDirection(q.mode, direction),
      answer,
      correct: gradeQuestion(answer, q, direction),
      overridden: false,
      created_at: now,
      updated_at: now,
    };
    progress.record(a);
    setSubmitted(a);
    setSessionIds((ids) => [...ids, a.id]);
    if (autoAudio)
      audio.play(
        feedbackSpeech(q).map((text) => ({ text, row: 0 })),
        { gap: q.mode === "tones" || q.mode === "characters" ? 0 : audio.gap },
      );
  }
  function next() {
    audio.stop();
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setAnswer("");
    setSubmitted(null);
    promptSpeech(questions[index + 1]);
    setTimeout(() => input.current?.focus(), 50);
  }
  useEffect(() => {
    if (!submitted || finished || tab !== "quiz") return;
    const advance = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.isComposing || e.keyCode === 229 || e.repeat)
        return;
      const target = e.target as HTMLElement;
      if (
        target.closest("button,select,textarea,summary,a") ||
        target.isContentEditable
      )
        return;
      e.preventDefault();
      next();
    };
    window.addEventListener("keydown", advance);
    return () => window.removeEventListener("keydown", advance);
  });
  function savePreset() {
    if (!presetName.trim()) return;
    const next = [
      ...presets.filter((p) => p.name !== presetName.trim()),
      { name: presetName.trim(), filters, mode, direction },
    ];
    try {
      localStorage.setItem("zili-presets", JSON.stringify(next));
      setPresets(next);
      setPresetName("");
      setNotice("Study setup saved on this device.");
    } catch {
      setNotice("Could not save this setup. Device storage may be full.");
    }
  }
  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setAuthMessage("Sending sign-in link…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setAuthMessage(
      error
        ? error.message
        : "Check your email for a sign-in link. Open it on this device.",
    );
  }
  function exportProgress() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(progress.attempts, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `zili-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function categoryFields() {
    return (
      <div className="field-grid">
        <Field label="Category">
          <Select
            value={filters.category_l1}
            onChange={(v) => updateFilter("category_l1", v)}
            options={categories("category_l1")}
          />
        </Field>
        <Field label="Subcategory">
          <Select
            value={filters.category_l2}
            onChange={(v) => updateFilter("category_l2", v)}
            options={categories("category_l2")}
          />
        </Field>
        <Field label="Topic">
          <Select
            value={filters.category_l3}
            onChange={(v) => updateFilter("category_l3", v)}
            options={categories("category_l3")}
          />
        </Field>
      </div>
    );
  }
  function posFields() {
    return (
      <fieldset className="pos">
        <legend>
          Parts of speech <small>· none selected means all</small>
        </legend>
        {pos.map((p) => (
          <label
            key={p}
            className={filters.pos.includes(p) ? "chip checked" : "chip"}
          >
            <input
              type="checkbox"
              checked={filters.pos.includes(p)}
              onChange={() =>
                updateFilter(
                  "pos",
                  filters.pos.includes(p)
                    ? filters.pos.filter((x) => x !== p)
                    : [...filters.pos, p],
                )
              }
            />
            {p.replaceAll("_", " ")}
          </label>
        ))}
      </fieldset>
    );
  }
  function grammarFields(review = false) {
    return (
      <div className="field-grid">
        <Field label="Grammar rule">
          <select
            value={ruleId}
            onChange={(e) => {
              audio.stop();
              setRuleId(e.target.value);
              setReviewStarted(false);
            }}
          >
            <option value="">{review ? "Choose a rule" : "All rules"}</option>
            {rules
              .filter(
                (r) =>
                  (!grammarCategory || r.category === grammarCategory) &&
                  (!difficulty || r.difficulty === difficulty),
              )
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
          </select>
        </Field>
        {!review && (
          <>
            <Field label="Grammar category">
              <Select
                value={grammarCategory}
                onChange={(v) => {
                  setGrammarCategory(v);
                  setRuleId("");
                }}
                options={[...new Set(rules.map((r) => r.category))]}
              />
            </Field>
            <Field label="Difficulty">
              <Select
                value={difficulty}
                onChange={(v) => {
                  setDifficulty(v);
                  setRuleId("");
                }}
                options={["review", "core", "stretch"]}
              />
            </Field>
          </>
        )}
      </div>
    );
  }
  if (!content)
    return (
      <main className="loading">
        <div className="brand-mark">字</div>
        <h1>Opening your study room</h1>
        <p>{loadError || "Preparing your words, characters, and grammar…"}</p>
        {loadError && (
          <button onClick={() => location.reload()}>Try again</button>
        )}
      </main>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-mark">字</span>
          <span>
            字里 <small>YOUR CHINESE STUDY ROOM</small>
          </span>
        </a>
        <div className="sidebar-label">YOUR PRACTICE</div>
        <nav>
          {(["quiz", "review", "progress", "settings"] as const).map((t, i) => (
            <button
              className={tab === t ? "nav-item active" : "nav-item"}
              key={t}
              onClick={() => changeTab(t)}
            >
              <span>{["◈", "▤", "◴", "⚙"][i]}</span>
              {t === "quiz"
                ? "Practice"
                : t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && <b>•</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="daily-note">
            <span lang="zh">温故而知新</span>
            <p>
              Find something new
              <br />
              in what you already know.
            </p>
          </div>
          <div className="account-dot">
            <span>{progress.user ? "●" : "○"}</span>
            <div>
              {progress.user ? "Personal account" : "Local study mode"}
              <small>{progress.status}</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            一点一滴，每天进步。{" "}
            <span className="muted">A little progress, every day.</span>
          </span>
          <button className="quiet" onClick={() => changeTab("settings")}>
            {progress.user ? "Account & audio" : "Enable sync"} <span>↗</span>
          </button>
        </header>
        <main>
          {contentNote && <div className="notice">{contentNote}</div>}
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
          {tab === "quiz" && !questions.length && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">MAKE IT PART OF YOUR DAY</div>
                  <h1>
                    A little practice.
                    <br />
                    <em>A world of words.</em>
                  </h1>
                  <p>Choose your focus, find your rhythm, and keep growing.</p>
                </div>
                <div className="heading-seal" lang="zh">
                  学<br />习
                </div>
              </div>
              <div className="section-line">
                <h2>What would you like to practice?</h2>
                <span>06 WAYS TO LEARN</span>
              </div>
              <div className="mode-grid">
                {(Object.keys(modeNames) as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      audio.stop();
                      setMode(m);
                    }}
                    className={`mode-card ${mode === m ? "selected" : ""}`}
                  >
                    <div className="card-top">
                      <span lang="zh">{icons[m]}</span>
                      <i>{mode === m ? "●" : "↗"}</i>
                    </div>
                    <h3>{modeNames[m]}</h3>
                    <p>{descriptions[m]}</p>
                  </button>
                ))}
              </div>
              <section className="panel setup">
                <div className="section-line">
                  <div>
                    <h2>Make it your own</h2>
                    <p>Build a session that meets you where you are.</p>
                  </div>
                  <span className="tag">
                    {eligible.length.toLocaleString()} eligible
                  </span>
                </div>
                <div className="field-grid">
                  <Field label="Questions">
                    <input
                      type="number"
                      max="500"
                      value={filters.count}
                      onChange={(e) =>
                        updateFilter(
                          "count",
                          e.target.value === ""
                            ? ""
                            : Math.floor(Number(e.target.value)),
                        )
                      }
                    />
                  </Field>
                  {["vocabulary", "idioms", "sentences"].includes(mode) && (
                    <Field
                      label={
                        mode === "sentences"
                          ? "Vocabulary shown in"
                          : "Prompt direction"
                      }
                    >
                      <select
                        value={direction}
                        onChange={(e) => {
                          setDirection(e.target.value as Direction);
                          if (e.target.value === "en-zh") setAudioOnly(false);
                        }}
                      >
                        <option value="en-zh">
                          {mode === "sentences"
                            ? "English"
                            : "English → Chinese"}
                        </option>
                        <option value="zh-en">
                          {mode === "sentences"
                            ? "Chinese"
                            : "Chinese → English"}
                        </option>
                      </select>
                    </Field>
                  )}
                  {!["grammar", "characters"].includes(mode) && (
                    <Field label="Exclude after correct streak">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.streak}
                        onChange={(e) =>
                          updateFilter(
                            "streak",
                            Math.max(0, Number(e.target.value)),
                          )
                        }
                      />
                      <small>
                        Last X correct in this mode and direction. 0 = off.
                      </small>
                    </Field>
                  )}
                </div>
                {mode === "vocabulary" && (
                  <div className="field-grid">
                    <Field label="Maximum Chinese characters">
                      <input
                        type="number"
                        min="1"
                        placeholder="Any"
                        value={vocabMax}
                        onChange={(e) => setVocabMax(e.target.value)}
                      />
                    </Field>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={includePhrases}
                        onChange={(e) => setIncludePhrases(e.target.checked)}
                      />
                      Include phrases (excluded by default)
                    </label>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={includeSentences}
                        onChange={(e) => setIncludeSentences(e.target.checked)}
                      />
                      Include sentences (excluded by default)
                    </label>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={audioOnly}
                        onChange={(e) => {
                          setAudioOnly(e.target.checked);
                          if (e.target.checked) setDirection("zh-en");
                        }}
                      />
                      Audio-only Chinese prompt
                    </label>
                    <p className="helper">
                      Audio-only uses Chinese → English; characters appear in
                      feedback. Explicitly selecting phrase or sentence in the
                      part-of-speech filter also includes that category. Idioms
                      have their own quiz.
                    </p>
                  </div>
                )}
                {mode === "tones" && (
                  <div className="field-grid">
                    <Field label="Maximum characters in word">
                      <input
                        type="number"
                        min="1"
                        value={toneMax}
                        placeholder="Any"
                        onChange={(e) => setToneMax(e.target.value)}
                      />
                    </Field>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={tonePrompt}
                        onChange={(e) => setTonePrompt(e.target.checked)}
                      />
                      Play Chinese audio with tone prompt
                    </label>
                  </div>
                )}
                {mode === "grammar" ? (
                  grammarFields()
                ) : mode === "characters" ? (
                  <div className="field-grid">
                    <Field label="Minimum character priority">
                      <input
                        type="number"
                        value={charMin}
                        placeholder="Any"
                        onChange={(e) => setCharMin(e.target.value)}
                      />
                    </Field>
                    <Field label="Maximum character priority">
                      <input
                        type="number"
                        value={charMax}
                        placeholder="Any"
                        onChange={(e) => setCharMax(e.target.value)}
                      />
                    </Field>
                  </div>
                ) : (
                  <details className="filter-details" open>
                    <summary>
                      Fine-tune your word collection <span>Filters</span>
                    </summary>
                    <div className="field-grid four">
                      {(
                        [
                          "priority",
                          "movie_words_rank",
                          "hsk_level",
                          "commonness",
                        ] as const
                      ).map((k, i) => (
                        <Field
                          label={
                            [
                              "Maximum priority",
                              "Maximum movie rank",
                              "Maximum HSK level",
                              "Maximum commonness",
                            ][i]
                          }
                          key={k}
                        >
                          {k === "hsk_level" ? (
                            <select
                              value={filters[k]}
                              onChange={(e) => updateFilter(k, e.target.value)}
                            >
                              <option value="">Any</option>
                              {["1", "2", "3", "4", "5", "6", "7"].map((n) => (
                                <option value={n} key={n}>
                                  {n === "7" ? "7–9" : n}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              placeholder="Any"
                              value={filters[k]}
                              onChange={(e) => updateFilter(k, e.target.value)}
                            />
                          )}
                        </Field>
                      ))}
                      <Field label="Added from">
                        <input
                          type="date"
                          value={filters.dateMin}
                          onChange={(e) =>
                            updateFilter("dateMin", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Added through">
                        <input
                          type="date"
                          value={filters.dateMax}
                          onChange={(e) =>
                            updateFilter("dateMax", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Slang">
                        <select
                          value={filters.slang}
                          onChange={(e) =>
                            updateFilter("slang", e.target.value)
                          }
                        >
                          <option value="">All words</option>
                          <option value="0">Non-slang</option>
                          <option value="1">Slang only</option>
                        </select>
                      </Field>
                      <label className="check-field">
                        <input
                          type="checkbox"
                          checked={filters.unknown}
                          onChange={(e) =>
                            updateFilter("unknown", e.target.checked)
                          }
                        />
                        Include unknown filter values
                      </label>
                    </div>
                    {categoryFields()}
                    {posFields()}
                    <p className="helper">
                      Lower numbers pass maximum filters. HSK uses the lowest
                      listed level; 7–9 is one band. Slang 0.5 is treated as
                      non-slang.
                    </p>
                  </details>
                )}
                <details className="preset-details">
                  <summary>Saved study setups</summary>
                  <div className="inline">
                    <input
                      aria-label="Setup name"
                      placeholder="Name this setup"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                    />
                    <button onClick={savePreset} disabled={!presetName.trim()}>
                      Save setup
                    </button>
                  </div>
                  {presets.map((p) => (
                    <div className="preset" key={p.name}>
                      <button
                        onClick={() => {
                          setMode(p.mode);
                          setDirection(p.direction);
                          setFilters(p.filters);
                        }}
                      >
                        {p.name} ↗
                      </button>
                      <button
                        className="quiet"
                        onClick={() => {
                          const next = presets.filter((x) => x.name !== p.name);
                          try {
                            localStorage.setItem(
                              "zili-presets",
                              JSON.stringify(next),
                            );
                            setPresets(next);
                          } catch {
                            setNotice("Could not remove setup.");
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </details>
                <div className="start-bar">
                  <span>
                    {eligible.length
                      ? `${Math.min(Math.max(1, Number(filters.count) || 3), 500, eligible.length)} questions · one step closer`
                      : "No matching items. Adjust your filters or streak exclusion."}
                  </span>
                  <button
                    className="primary"
                    disabled={!eligible.length || !progress.ready}
                    onClick={start}
                  >
                    Start practicing <span>→</span>
                  </button>
                </div>
              </section>
              <p className="footer-note">
                {words.length.toLocaleString()} words & phrases <span>·</span>{" "}
                {content.characters.length} characters <span>·</span>{" "}
                {rules.length} grammar rules <span>·</span> Your own pace
              </p>
            </>
          )}
          {tab === "quiz" &&
            questions.length > 0 &&
            (finished ? (
              <section className="panel completion">
                <div className="eyebrow">SESSION COMPLETE</div>
                <h1>Another step forward.</h1>
                <div className="score">
                  {sessionResults.filter((a) => a.correct).length}
                  <span> / {questions.length}</span>
                </div>
                <p>Answers correct, including your accepted alternatives.</p>
                <div className="session-misses">
                  <h2>Incorrect answers</h2>
                  {sessionResults.some((a) => !a.correct) ? (
                    <>
                      <button
                        onClick={() =>
                          audio.play(
                            questions
                              .filter((q) =>
                                sessionResults.some(
                                  (a) => a.item_id === q.id && !a.correct,
                                ),
                              )
                              .map((q, row) => ({
                                text: questionChinese(q),
                                row,
                              })),
                          )
                        }
                      >
                        ◖)) Read all incorrect answers in Chinese
                      </button>
                      {questions
                        .filter((q) =>
                          sessionResults.some(
                            (a) => a.item_id === q.id && !a.correct,
                          ),
                        )
                        .map((q) => (
                          <div className="example" key={q.id}>
                            <p lang="zh">{questionChinese(q)}</p>
                            <p>{questionEnglish(q)}</p>
                            <p className="helper">
                              Your answer:{" "}
                              {sessionResults.find((a) => a.item_id === q.id)
                                ?.answer || "(blank)"}
                            </p>
                            {q.mode === "tones" && (
                              <p>Dictionary tones: {q.word?.tone_pattern}</p>
                            )}
                          </div>
                        ))}
                    </>
                  ) : (
                    <p>No incorrect answers this session.</p>
                  )}
                </div>
                <div className="inline centered">
                  <button
                    className="primary"
                    onClick={() => {
                      audio.stop();
                      setQuestions([]);
                      setFinished(false);
                    }}
                  >
                    Choose your next practice →
                  </button>
                  <button
                    onClick={() => {
                      audio.stop();
                      const missed = sessionResults
                        .filter((a) => !a.correct)
                        .map((a) => a.item_id);
                      const nextQuestions = questions.filter((x) =>
                        missed.includes(x.id),
                      );
                      if (nextQuestions.length) {
                        setQuestions(nextQuestions);
                        setIndex(0);
                        setSubmitted(null);
                        setAnswer("");
                        setFinished(false);
                        setSessionIds([]);
                        promptSpeech(nextQuestions[0]);
                      }
                    }}
                    disabled={!sessionResults.some((a) => !a.correct)}
                  >
                    Retry missed questions
                  </button>
                </div>
              </section>
            ) : (
              <>
                <div className="section-line">
                  <button
                    className="quiet"
                    onClick={() => {
                      audio.stop();
                      setQuestions([]);
                    }}
                  >
                    ← End session
                  </button>
                  <span>
                    {modeNames[mode]} · {index + 1} / {questions.length}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    style={{ width: `${(index / questions.length) * 100}%` }}
                  />
                </div>
                {!submitted && (
                  <section className="panel question">
                    <div className="eyebrow">
                      {q.mode === "tones"
                        ? "LISTEN FOR THE DICTIONARY TONES"
                        : q.mode === "characters"
                          ? "WRITE THE SIMPLIFIED CHARACTER"
                          : q.mode === "grammar" || q.mode === "sentences"
                            ? "WRITE THE SENTENCE IN CHINESE"
                            : direction === "en-zh"
                              ? "WRITE THE CHINESE"
                              : "WHAT DOES THIS MEAN?"}
                    </div>
                    {q.word && (
                      <>
                        {q.mode === "vocabulary" &&
                        direction === "zh-en" &&
                        audioOnly ? (
                          <h1>Listen and give the English meaning</h1>
                        ) : (
                          <h1
                            lang={
                              q.mode === "tones" || direction === "zh-en"
                                ? "zh-Hans"
                                : "en"
                            }
                          >
                            {q.mode === "tones" || direction === "zh-en"
                              ? q.word.chinese
                              : q.word.english}
                          </h1>
                        )}
                        {q.mode === "sentences" && (
                          <p className="sentence-prompt">
                            {q.word.sentence_english}
                          </p>
                        )}
                        {(q.mode === "tones" || direction === "zh-en") && (
                          <button
                            className="audio-button"
                            onClick={() =>
                              audio.play([{ text: q.word!.chinese, row: 0 }])
                            }
                          >
                            ◖)) Listen again
                          </button>
                        )}
                      </>
                    )}
                    {q.character && (
                      <h1 className="character-prompt" lang="zh-Hant">
                        <TraditionalText
                          traditional={q.character.trad}
                          simplified={q.character.simp}
                        />
                      </h1>
                    )}
                    {q.exercise && (
                      <>
                        <div className="pattern">
                          {q.rule!.title} <span>{q.rule!.pattern}</span>
                        </div>
                        <h1 className="sentence-prompt">
                          {q.exercise.prompt_english}
                        </h1>
                      </>
                    )}
                    <form onSubmit={submit}>
                      <Field
                        label={
                          q.mode === "tones"
                            ? "Tone numbers (neutral tone = 5)"
                            : "Your answer"
                        }
                      >
                        <input
                          autoFocus
                          ref={input}
                          autoComplete="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          inputMode={q.mode === "tones" ? "numeric" : "text"}
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing && e.key === "Enter")
                              e.preventDefault();
                          }}
                          placeholder={
                            q.mode === "tones" ? "e.g. 13" : "Type your answer…"
                          }
                          readOnly={!!submitted}
                        />
                      </Field>
                      {!submitted && (
                        <button className="primary" type="submit">
                          Check answer →
                        </button>
                      )}
                    </form>
                  </section>
                )}
                {submitted && (
                  <section className="panel feedback" aria-live="polite">
                    <div className="section-line">
                      <h2
                        className={submitted.correct ? "correct" : "unmatched"}
                      >
                        {submitted.correct
                          ? submitted.overridden
                            ? "✓ Answer accepted"
                            : "✓ You got it"
                          : "○ Not in the accepted answer list"}
                      </h2>
                      <button
                        className="quiet"
                        onClick={() =>
                          audio.play(
                            feedbackSpeech(q).map((text) => ({ text, row: 0 })),
                            {
                              gap:
                                q.mode === "tones" || q.mode === "characters"
                                  ? 0
                                  : audio.gap,
                            },
                          )
                        }
                      >
                        ◖)) Replay feedback
                      </button>
                    </div>
                    {!submitted.correct && (
                      <p>
                        Your answer: <strong>{submitted.answer}</strong>.
                        Compare with the answer below; other translations may
                        also be valid.
                      </p>
                    )}
                    {q.word && (
                      <>
                        <WordDetails
                          w={q.word}
                          feedback
                          idiom={q.mode === "idioms"}
                        />
                        {q.mode === "tones" && (
                          <div className="pattern">
                            Dictionary tones:{" "}
                            <strong>{q.word.tone_pattern}</strong>
                            {q.word.tone_change && <p>{q.word.tone_change}</p>}
                          </div>
                        )}
                        <div className="extra-fields">
                          {[
                            ["Synonyms", q.word["synonym(s)"]],
                            ["Common collocations", q.word.common_collocations],
                            ["Measure word", q.word.measure_word],
                          ]
                            .filter(([, v]) => v)
                            .map(([label, value]) => (
                              <div key={label}>
                                <span>{label}</span>
                                <p>{value}</p>
                              </div>
                            ))}
                        </div>
                        <div className="character-exploration">
                          <h3>Explore the characters</h3>
                          {[
                            ...new Set(
                              q.word.chinese.match(/\p{Script=Han}/gu) || [],
                            ),
                          ].map((c) => {
                            const related = words.filter(
                              (w) =>
                                characterWordEligible(w) &&
                                w.id !== q.word!.id &&
                                w.chinese.includes(c),
                            );
                            return (
                              <details key={c}>
                                <summary>
                                  <span lang="zh">{c}</span> Words containing
                                  this character <small>{related.length}</small>
                                </summary>
                                <button
                                  disabled={!related.length}
                                  onClick={() =>
                                    audio.play(
                                      related.map((w, row) => ({
                                        text: w.chinese,
                                        row,
                                      })),
                                      { gap: 0 },
                                    )
                                  }
                                >
                                  ◖)) Listen to all words containing {c}
                                </button>
                                {related.slice(0, 30).map((w) => (
                                  <div className="related-word" key={w.id}>
                                    <span lang="zh">{w.chinese}</span>
                                    <span>{w.pinyin}</span>
                                    <span>{w.english}</span>
                                    <button
                                      className="quiet"
                                      aria-label={`Listen to ${w.chinese}`}
                                      onClick={() =>
                                        audio.play([
                                          { text: w.chinese, row: 0 },
                                        ])
                                      }
                                    >
                                      ◖))
                                    </button>
                                  </div>
                                ))}
                                {related.length > 30 && (
                                  <p className="helper">
                                    Showing 30 of {related.length}. Use
                                    character review to explore the complete
                                    list.
                                  </p>
                                )}
                                {!related.length && (
                                  <p>No other words in this collection.</p>
                                )}
                              </details>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {q.character && (
                      <>
                        <div className="word-title" lang="zh">
                          <span>
                            <TraditionalText
                              traditional={q.character.trad}
                              simplified={q.character.simp}
                            />{" "}
                            → {q.character.simp}
                          </span>
                        </div>
                        <p className="pinyin">{q.character.pinyin}</p>
                        <p>{q.character.English}</p>
                        <div className="example character-examples">
                          {characterExamples(q.character, words).map((e, i) => (
                            <p key={i}>
                              <span lang="zh">
                                <TraditionalText
                                  traditional={e.trad}
                                  simplified={e.simp}
                                />{" "}
                                ({e.simp})
                              </span>
                              : {e.english}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                    {q.exercise && (
                      <>
                        <div className="word-title" lang="zh-Hans">
                          {q.exercise.expected.chinese}
                        </div>
                        <p className="pinyin">{q.exercise.expected.pinyin}</p>
                        <p>{q.exercise.expected.english}</p>
                        <div className="pattern">
                          <strong>{q.rule!.pattern}</strong>
                          <p>{q.rule!.explanation}</p>
                        </div>
                        {q.exercise.accepted_answers.length > 1 && (
                          <details>
                            <summary>Other accepted answers</summary>
                            {q.exercise.accepted_answers.slice(1).map((a) => (
                              <p key={a} lang="zh">
                                {a}
                              </p>
                            ))}
                          </details>
                        )}
                        <h3>More examples of this rule</h3>
                        {q.exercise.feedback_example_ids
                          .map((id) =>
                            q.rule!.exercises.find((e) => e.id === id)!,
                          )
                          .filter(Boolean)
                          .map((e) => (
                            <div className="example" key={e.id}>
                              <p lang="zh">{e.expected.chinese}</p>
                              <p className="pinyin">{e.expected.pinyin}</p>
                              <p>{e.expected.english}</p>
                            </div>
                          ))}
                      </>
                    )}
                    <div className="start-bar">
                      {!submitted.correct ? (
                        <button
                          onClick={() => {
                            progress.override(submitted.id);
                            setSubmitted({
                              ...submitted,
                              correct: true,
                              overridden: true,
                            });
                          }}
                        >
                          Accept my answer
                        </button>
                      ) : (
                        <span>Progress saved</span>
                      )}
                      <button className="primary" onClick={next}>
                        {index + 1 === questions.length
                          ? "Finish session"
                          : "Next question"}{" "}
                        →
                      </button>
                    </div>
                  </section>
                )}
              </>
            ))}
          {tab === "review" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">LET IT SINK IN</div>
                  <h1>
                    Revisit. Listen. <em>Remember.</em>
                  </h1>
                  <p>Take a slower walk through your collection.</p>
                </div>
              </div>
              <div className="review-tabs">
                {(Object.keys(reviewNames) as ReviewMode[]).map((m) => (
                  <button
                    className={reviewMode === m ? "selected" : ""}
                    key={m}
                    onClick={() => {
                      audio.stop();
                      setReviewMode(m);
                      setReviewStarted(false);
                      setReviewLimit(50);
                    }}
                  >
                    {reviewNames[m]}
                  </button>
                ))}
              </div>
              <section className="panel setup">
                {reviewMode === "category" && categoryFields()}
                {reviewMode === "character" && (
                  <Field label="Chinese character">
                    <input
                      value={character}
                      placeholder="e.g. 学 or 學"
                      onChange={(e) => {
                        audio.stop();
                        setCharacter(e.target.value);
                        setReviewStarted(false);
                        setReviewLimit(50);
                      }}
                    />
                  </Field>
                )}
                {reviewMode === "history" && (
                  <div className="field-grid">
                    <Field label="Priority level">
                      <Select
                        value={reviewPriority}
                        onChange={(v) => {
                          audio.stop();
                          setReviewPriority(v);
                          setReviewStarted(false);
                        }}
                        options={["1", "2", "3", "4", "5", "6", "7", "8"]}
                      />
                    </Field>
                    <Field label="Quiz type">
                      <select
                        value={reviewQuiz}
                        onChange={(e) => {
                          audio.stop();
                          setReviewQuiz(e.target.value as Mode);
                          setReviewStarted(false);
                        }}
                      >
                        {(
                          [
                            "vocabulary",
                            "idioms",
                            "tones",
                            "sentences",
                          ] as Mode[]
                        ).map((m) => (
                          <option value={m} key={m}>
                            {modeNames[m]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Correct streak below">
                      <input
                        type="number"
                        min="1"
                        value={Math.max(1, filters.streak)}
                        onChange={(e) =>
                          updateFilter(
                            "streak",
                            Math.max(1, Math.floor(Number(e.target.value))),
                          )
                        }
                      />
                    </Field>
                    {reviewQuiz !== "tones" && (
                      <Field label="Prompt direction">
                        <select
                          value={direction}
                          onChange={(e) => {
                            audio.stop();
                            setDirection(e.target.value as Direction);
                            setReviewStarted(false);
                          }}
                        >
                          <option value="en-zh">English → Chinese</option>
                          <option value="zh-en">Chinese → English</option>
                        </select>
                      </Field>
                    )}
                  </div>
                )}
                {reviewMode === "grammar" ? grammarFields(true) : posFields()}
                <div className="start-bar">
                  <span>
                    {reviewMode === "grammar"
                      ? `${reviewRule?.exercises.length || 0} examples`
                      : `${reviewWords.length.toLocaleString()} words`}
                  </span>
                  <button
                    className="primary"
                    disabled={
                      reviewMode === "grammar"
                        ? !reviewRule
                        : !reviewWords.length
                    }
                    onClick={() => {
                      audio.stop();
                      setReviewStarted(true);
                    }}
                  >
                    Open review →
                  </button>
                </div>
              </section>
              {reviewMode !== "grammar" && reviewMode !== "character" && (
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={reviewSentences}
                    onChange={(e) => {
                      audio.stop();
                      setReviewSentences(e.target.checked);
                    }}
                  />
                  Also read Chinese example sentences
                </label>
              )}
              {reviewStarted && (
                <>
                  <div className="review-toolbar">
                    <span>
                      {reviewMode === "grammar"
                        ? reviewRule?.title
                        : `${reviewWords.length.toLocaleString()} words in your review`}
                    </span>
                    <button
                      className="primary"
                      onClick={() =>
                        audio.play(
                          reviewMode === "grammar"
                            ? reviewRule!.exercises.map((e, row) => ({
                                text: e.expected.chinese,
                                row,
                              }))
                            : reviewWords.flatMap((w, row) => [
                                { text: w.chinese, row },
                                ...(reviewSentences &&
                                reviewMode !== "character" &&
                                w.sentence
                                  ? [{ text: w.sentence, row }]
                                  : []),
                              ]),
                        )
                      }
                    >
                      ◖)) Listen to all
                    </button>
                  </div>
                  {reviewMode === "grammar" && reviewRule ? (
                    <>
                      <div className="panel pattern">
                        <h2>{reviewRule.title}</h2>
                        <p>{reviewRule.pattern}</p>
                        <p>{reviewRule.explanation}</p>
                      </div>
                      {reviewRule.exercises.map((e, i) => (
                        <div
                          ref={audio.row === i ? activeRow : undefined}
                          key={e.id}
                          className={`panel review-row ${audio.row === i ? "reading" : ""}`}
                        >
                          <span className="row-number">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <div className="word-title" lang="zh">
                              {e.expected.chinese}
                            </div>
                            <p className="pinyin">{e.expected.pinyin}</p>
                            <p>{e.expected.english}</p>
                          </div>
                          <button
                            className="quiet"
                            aria-label={`Listen to example ${i + 1}`}
                            onClick={() =>
                              audio.play([{ text: e.expected.chinese, row: i }])
                            }
                          >
                            ◖))
                          </button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {reviewWords
                        .slice(0, Math.max(reviewLimit, audio.row + 1))
                        .map((w, i) => (
                          <div
                            ref={audio.row === i ? activeRow : undefined}
                            key={w.id}
                            className={`panel review-row ${audio.row === i ? "reading" : ""}`}
                          >
                            <span className="row-number">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <WordDetails
                                w={w}
                                compact={reviewMode === "character"}
                              />
                            </div>
                            <button
                              className="quiet"
                              aria-label={`Listen to ${w.chinese}`}
                              onClick={() =>
                                audio.play([
                                  { text: w.chinese, row: i },
                                  ...(reviewSentences &&
                                  reviewMode !== "character" &&
                                  w.sentence
                                    ? [{ text: w.sentence, row: i }]
                                    : []),
                                ])
                              }
                            >
                              ◖))
                            </button>
                          </div>
                        ))}
                      {Math.max(reviewLimit, audio.row + 1) <
                        reviewWords.length && (
                        <button
                          onClick={() =>
                            setReviewLimit(
                              (n) => Math.max(n, audio.row + 1) + 50,
                            )
                          }
                        >
                          Show next 50 words
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
          {tab === "progress" && (
            <ProgressPanel
              content={content}
              attempts={progress.attempts}
              play={audio.play}
              stop={audio.stop}
              exportHistory={exportProgress}
            />
          )}
          {tab === "settings" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">MAKE YOURSELF AT HOME</div>
                  <h1>
                    Your study <em>preferences.</em>
                  </h1>
                  <p>
                    Connect your devices and find a comfortable listening pace.
                  </p>
                </div>
              </div>
              <section className="panel">
                <h2>Account & device sync</h2>
                <p>{progress.status}</p>
                {!supabase ? (
                  <div className="notice">
                    You can study now; progress saves in this browser. Connect
                    Supabase to sync your MacBook and Pixel. Setup instructions
                    are in the project README.
                  </div>
                ) : progress.user ? (
                  <>
                    <p>
                      Signed in as <strong>{progress.user.email}</strong>
                    </p>
                    <div className="inline">
                      <button onClick={() => void progress.sync()}>
                        Sync now
                      </button>
                      <button onClick={progress.importGuest}>
                        Import this device’s guest progress
                      </button>
                      <button
                        onClick={async () => {
                          const { error } = await supabase!.auth.signOut();
                          if (error) setAuthMessage(error.message);
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                ) : (
                  <form className="inline" onSubmit={signIn}>
                    <Field label="Email address">
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <button className="primary" type="submit">
                      Send sign-in link
                    </button>
                  </form>
                )}
                {authMessage && <p role="status">{authMessage}</p>}
                <p className="helper">
                  Guest and signed-in histories are separate. After signing in,
                  import guest progress once on each device if needed.
                </p>
              </section>
              <section className="panel">
                <h2>Mandarin audio</h2>
                <div className="field-grid">
                  <Field label="Voice">
                    <select
                      value={audio.voice}
                      onChange={(e) => audio.setVoice(e.target.value)}
                    >
                      <option value="">Default Mandarin voice</option>
                      {audio.voices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`Speaking speed · ${audio.rate}×`}>
                    <input
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.05"
                      value={audio.rate}
                      onChange={(e) => audio.setRate(Number(e.target.value))}
                    />
                  </Field>
                  <Field label={`Pause between clips · ${audio.gap}s`}>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.2"
                      value={audio.gap}
                      onChange={(e) => audio.setGap(Number(e.target.value))}
                    />
                  </Field>
                </div>
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={autoAudio}
                    onChange={(e) => setAutoAudio(e.target.checked)}
                  />
                  Automatically play Chinese prompts and feedback
                </label>
                <button
                  onClick={() =>
                    audio.play([{ text: "每天进步一点点。", row: 0 }])
                  }
                >
                  ◖)) Test Mandarin voice
                </button>
                <p className="helper">
                  Voices depend on your device. If none appear, enable Mandarin
                  in your system’s text-to-speech settings. Keep this page open
                  while listening.
                </p>
              </section>
              <section className="panel">
                <h2>Your collection</h2>
                <p>
                  {words.length.toLocaleString()} words ·{" "}
                  {content.characters.length} characters · {rules.length}{" "}
                  grammar rules ·{" "}
                  {rules
                    .reduce((n, r) => n + r.exercises.length, 0)
                    .toLocaleString()}{" "}
                  grammar examples
                </p>
                <p className="helper">
                  Content updates preserve progress using stable source IDs.
                  Deleted entries leave study lists but remain in your history.
                </p>
                <button onClick={exportProgress}>
                  Export progress as JSON
                </button>
              </section>
            </>
          )}
        </main>
        <footer className="main-footer">
          字里 <span>A little Chinese. Every day.</span>
        </footer>
      </div>
      {(audio.playing || audio.error) && (
        <div className="audio-dock" role="status">
          {audio.error ? (
            <>
              <span>{audio.error}</span>
              <button onClick={audio.stop}>Stop</button>
            </>
          ) : (
            <>
              <span className="sound-waves">▂ ▅ ▃ ▆</span>
              <span>{audio.paused ? "Paused" : "Listening in Mandarin"}</span>
              <button onClick={audio.togglePause}>
                {audio.paused ? "Resume" : "Pause"}
              </button>
              <button onClick={audio.stop}>Stop</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

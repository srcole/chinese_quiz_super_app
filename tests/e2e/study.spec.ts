import { test, expect } from "@playwright/test";
import fs from "node:fs";
const content = JSON.parse(fs.readFileSync("public/content.json", "utf8"));
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: string[] = [];
    (window as unknown as { spoken: string[] }).spoken = spoken;
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        getVoices: () => [
          { voiceURI: "test", name: "Test Mandarin", lang: "zh-CN" },
        ],
        addEventListener: () => {},
        removeEventListener: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
        speak: (u: SpeechSynthesisUtterance) => {
          spoken.push(u.text);
          (window as unknown as { finishSpeech: () => void }).finishSpeech =
            () => u.onend?.(new Event("end") as SpeechSynthesisEvent);
        },
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Start practicing" }),
  ).toBeEnabled();
});
test("all six quiz modes submit, override, and preserve history", async ({
  page,
}) => {
  for (const name of [
    "Vocabulary",
    "Idioms",
    "Tones",
    "Sentence application",
    "Traditional characters",
    "Grammar",
  ]) {
    await page
      .locator(".mode-card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) })
      .click();
    await page.getByLabel("Questions", { exact: true }).fill("1");
    await page.getByRole("button", { name: "Start practicing" }).click();
    await page.locator(".question input").fill("wrong answer");
    await page.getByRole("button", { name: "Check answer" }).click();
    await expect(
      page.getByText("Not in the accepted answer list", { exact: false }),
    ).toBeVisible();
    await expect(page.locator(".feedback")).toBeVisible();
    if (name === "Idioms")
      await expect(
        page.getByText("Literal translation", { exact: true }),
      ).toBeVisible();
    if (name === "Tones")
      await expect(
        page.getByText("Dictionary tones:", { exact: false }),
      ).toBeVisible();
    if (name === "Grammar")
      await expect(
        page.getByRole("heading", { name: "More examples of this rule" }),
      ).toBeVisible();
    await page
      .getByRole("button", { name: "Accept my answer", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "✓ Answer accepted" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Finish session" }).click();
    await expect(page.locator(".score")).toHaveText("1 / 1");
    await page
      .getByRole("button", { name: "Choose your next practice" })
      .click();
  }
  await page.reload();
  await page.getByRole("button", { name: /Progress/ }).click();
  await page.getByLabel("Progress maximum priority").fill("");
  await expect(page.locator(".stat-grid strong").first()).toHaveText("1");
  await expect(page.locator(".stat-grid strong").nth(1)).toHaveText("100%");
});
test("dictionary tones grade correctly and feedback audio starts with word", async ({
  page,
}) => {
  await page
    .locator(".mode-card")
    .filter({ has: page.getByRole("heading", { name: "Tones", exact: true }) })
    .click();
  await page.getByLabel("Questions", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Start practicing" }).click();
  const chinese = await page.locator(".question h1").innerText();
  const word = content.words.find(
    (w: { chinese: string }) => w.chinese === chinese,
  );
  await page
    .getByLabel("Tone numbers")
    .fill(word.tone_pattern.replaceAll("-", ""));
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(
    page.getByRole("heading", { name: "✓ You got it" }),
  ).toBeVisible();
  const spoken = await page.evaluate(
    () => (window as unknown as { spoken: string[] }).spoken,
  );
  expect(spoken[0]).toBe(chinese);
  expect(spoken[1]).toBe(chinese);
});
test("review modes show appropriate content and mobile layout stays in viewport", async ({
  page,
}, info) => {
  await page.screenshot({
    path: `/tmp/zili-${info.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /Review/ }).click();
  await page
    .getByRole("button", { name: "By Chinese character", exact: true })
    .click();
  await page.getByLabel("Chinese character", { exact: true }).fill("学");
  await page.getByRole("button", { name: "Open review" }).click();
  await expect(page.locator(".review-row").first()).toBeVisible();
  await expect(page.locator(".review-row .example")).toHaveCount(0);
  await page.getByRole("button", { name: "Listen to all" }).click();
  await expect(
    page.getByText("Listening in Mandarin", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Grammar listening", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Grammar rule", exact: true })
    .selectOption("grammar-001");
  await page.getByRole("button", { name: "Open review" }).click();
  await expect(page.locator(".review-row")).toHaveCount(10);
  await page
    .getByRole("button", { name: "Focus on tricky words", exact: true })
    .click();
  await page.getByRole("button", { name: "Open review" }).click();
  await expect(page.locator(".review-row").first()).toBeVisible();
  await page.getByRole("button", { name: "By category", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("Work and money");
  await page.getByRole("button", { name: "Open review" }).click();
  await expect(page.locator(".review-row").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("filters treat unknown movie ranks explicitly and presets restore configuration", async ({
  page,
}) => {
  await page
    .getByText("Fine-tune your word selection", { exact: false })
    .click();
  await page.getByLabel("Maximum priority", { exact: true }).fill("");
  await page.getByLabel("Maximum movie rank", { exact: true }).fill("1");
  await expect(page.locator(".tag")).toHaveText("0 eligible");
  await page.getByLabel("Include unknown filter values").check();
  await expect(page.locator(".tag")).toHaveText(
    `${content.words.filter((w: Record<string, string>) => w.part_of_speech !== "idiom" && w.part_of_speech !== "phrase" && w.part_of_speech !== "sentence" && (!w.movie_words_rank || Number(w.movie_words_rank) <= 1)).length.toLocaleString()} eligible`,
  );
  await page.getByText("Saved study setups", { exact: true }).click();
  await page.getByLabel("Setup name").fill("Movie collection");
  await page.getByRole("button", { name: "Save setup", exact: true }).click();
  await page.getByLabel("Maximum movie rank", { exact: true }).fill("500");
  await page
    .getByRole("button", { name: "Movie collection ↗", exact: true })
    .click();
  await expect(
    page.getByLabel("Maximum movie rank", { exact: true }),
  ).toHaveValue("1");
});

test("review audio reads word then sentence, advances, and cancels on navigation", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Review/ }).click();
  await page.getByLabel("Also read Chinese example sentences").check();
  await page.getByRole("button", { name: "Open review" }).click();
  await page.getByRole("button", { name: "Listen to all" }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { spoken: string[] }).spoken,
    ),
  ).toEqual([content.words[0].chinese]);
  await page.evaluate(() =>
    (window as unknown as { finishSpeech: () => void }).finishSpeech(),
  );
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { spoken: string[] }).spoken),
    )
    .toEqual([content.words[0].chinese, content.words[0].sentence]);
  await page.evaluate(() =>
    (window as unknown as { finishSpeech: () => void }).finishSpeech(),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { spoken: string[] }).spoken.length,
      ),
    )
    .toBe(3);
  await expect(page.locator(".reading .word-title")).toContainText(
    content.words[1].chinese,
  );
  await page.getByRole("button", { name: /Settings/ }).click();
  await expect(page.locator(".audio-dock")).toHaveCount(0);
  await page.evaluate(() =>
    (window as unknown as { finishSpeech: () => void }).finishSpeech(),
  );
  await page.getByRole("heading", { name: "Mandarin audio" }).waitFor();
  expect(
    await page.evaluate(
      () => (window as unknown as { spoken: string[] }).spoken.length,
    ),
  ).toBe(3);
});

test("two correct answers exclude a word only in the practiced direction", async ({
  page,
}) => {
  await page.route("**/content.json", (route) =>
    route.fulfill({ json: { ...content, words: [content.words[0]] } }),
  );
  await page.reload();
  await expect(page.locator(".tag")).toHaveText("1 eligible");
  await page.getByLabel("Questions", { exact: true }).fill("1");
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Start practicing" }).click();
    await page
      .getByLabel("Your answer", { exact: true })
      .fill(content.words[0].chinese);
    await page.getByRole("button", { name: "Check answer" }).click();
    await page.getByRole("button", { name: "Finish session" }).click();
    await page
      .getByRole("button", { name: "Choose your next practice" })
      .click();
  }
  await expect(page.locator(".tag")).toHaveText("0 eligible");
  await expect(
    page.getByRole("button", { name: "Start practicing" }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "Prompt direction", exact: true })
    .selectOption("zh-en");
  await expect(page.locator(".tag")).toHaveText("1 eligible");
});

test("question count clears, blank answers are wrong, and Enter advances feedback", async ({
  page,
}) => {
  await expect(page.getByLabel("Questions", { exact: true })).toHaveValue("30");
  await page.getByLabel("Questions", { exact: true }).fill("");
  await expect(page.getByLabel("Questions", { exact: true })).toHaveValue("");
  await page.getByLabel("Questions", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.locator(".feedback")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Vocabulary · 2 / 5", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".feedback")).toHaveCount(0);
});
test("tone limits and prompt audio can be configured, character priority bounds apply", async ({
  page,
}) => {
  await page
    .locator(".mode-card")
    .filter({ has: page.getByRole("heading", { name: "Tones", exact: true }) })
    .click();
  await page.getByLabel("Maximum priority", { exact: true }).fill("");
  await page
    .getByText("Fine-tune your word selection", { exact: false })
    .click();
  await expect(page.getByLabel("Maximum characters in word")).toHaveValue("2");
  const expected = content.words.filter(
    (w: Record<string, string>) =>
      /^[1-5](?:-[1-5])*$/.test(w.tone_pattern) &&
      (w.chinese.match(/\p{Script=Han}/gu) || []).length <= 2,
  ).length;
  await expect(page.locator(".tag")).toHaveText(
    `${expected.toLocaleString()} eligible`,
  );
  await page.getByLabel("Play Chinese audio with tone prompt").uncheck();
  await page.getByRole("button", { name: "Start practicing" }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { spoken: string[] }).spoken,
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "End session" }).click();
  await page
    .locator(".mode-card")
    .filter({
      has: page.getByRole("heading", {
        name: "Traditional characters",
        exact: true,
      }),
    })
    .click();
  await page
    .getByText("Fine-tune your word selection", { exact: false })
    .click();
  await page.getByLabel("Minimum character priority").fill("2");
  await page.getByLabel("Maximum priority", { exact: true }).fill("3");
  await expect(page.locator(".tag")).toHaveText(
    `${content.characters.filter((c: Record<string, string>) => Number(c.priority) >= 2 && Number(c.priority) <= 3).length} eligible`,
  );
});
test("character review permits pinyin composition and multi-character searches", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Review/ }).click();
  await page
    .getByRole("button", { name: "By Chinese character", exact: true })
    .click();
  const input = page.getByLabel("Chinese character", { exact: true });
  await input.fill("xue");
  await expect(input).toHaveValue("xue");
  await input.fill("学习");
  await expect(input).toHaveValue("学习");
});
test("progress defaults, denominators, incorrect audio and detailed statistics", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Progress/ }).click();
  await expect(page.getByLabel("Progress quiz type")).toHaveValue("vocabulary");
  await expect(page.getByLabel("Progress direction")).toHaveValue("en-zh");
  await expect(page.getByLabel("Progress maximum priority")).toHaveValue("6");
  const total = content.words.filter(
    (w: Record<string, string>) =>
      Number(w.priority) <= 6 && w.part_of_speech !== "idiom",
  ).length;
  await expect(page.locator(".stat-grid strong").nth(2)).toHaveText(
    `0 / ${total}`,
  );
  await page.getByRole("button", { name: "All quiz statistics" }).click();
  await expect(page.locator(".stats-table")).toContainText("Grammar");
  expect(await page.locator(".stats-table tbody tr").count()).toBeGreaterThan(
    50,
  );
});

test("incorrect progress filtering and playback read Chinese words", async ({
  page,
}) => {
  await page.route("**/content.json", (route) =>
    route.fulfill({
      json: { ...content, words: [content.words[0], content.words[1]] },
    }),
  );
  await page.reload();
  await page.getByLabel("Questions", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  const chinese = await page
    .locator(".feedback .word-title span")
    .first()
    .innerText();
  await page.getByRole("button", { name: /Progress/ }).click();
  await page.getByLabel("Answer result").selectOption("incorrect");
  await expect(page.locator(".history-list>div")).toHaveCount(1);
  await page.getByRole("button", { name: "Listen to filtered items" }).click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { spoken: string[] }).spoken.at(-1),
    ),
  ).toBe(chinese);
  await page.getByLabel("Answer result").selectOption("correct");
  await expect(page.locator(".history-list>div")).toHaveCount(0);
});
test("review defaults to words only and speech defaults are faster without a pause", async ({
  page,
}) => {
  await page.getByRole("button", { name: /Settings/ }).click();
  await expect(page.getByLabel("Speaking speed", { exact: false })).toHaveValue(
    "1.2",
  );
  await expect(
    page.getByLabel("Pause between clips", { exact: false }),
  ).toHaveValue("0");
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(
    page.getByLabel("Also read Chinese example sentences"),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Open review" }).click();
  await page.getByRole("button", { name: "Listen to all" }).click();
  await page.evaluate(() =>
    (window as unknown as { finishSpeech: () => void }).finishSpeech(),
  );
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { spoken: string[] }).spoken),
    )
    .toEqual([content.words[0].chinese, content.words[1].chinese]);
});

test("vocabulary audio-only hides characters and missed answers can be replayed", async ({
  page,
}) => {
  await page.route("**/content.json", (route) =>
    route.fulfill({
      json: {
        ...content,
        words: [{ ...content.words[0], part_of_speech: "noun", sentence: "-" }],
      },
    }),
  );
  await page.reload();
  await page.getByLabel("Questions", { exact: true }).fill("1");
  await page
    .getByText("Fine-tune your word selection", { exact: false })
    .click();
  await page.getByLabel("Audio-only Chinese prompt").check();
  await expect(
    page.getByRole("combobox", { name: "Prompt direction", exact: true }),
  ).toHaveValue("zh-en");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await expect(page.locator(".question")).not.toContainText(
    content.words[0].chinese,
  );
  expect(
    await page.evaluate(() =>
      (window as unknown as { spoken: string[] }).spoken.at(-1),
    ),
  ).toBe(content.words[0].chinese);
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.locator(".feedback .example")).toHaveCount(0);
  await page.getByRole("button", { name: "Finish session" }).click();
  await expect(page.locator(".session-misses")).toContainText(
    content.words[0].chinese,
  );
  await page
    .getByRole("button", { name: "Read all incorrect answers in Chinese" })
    .click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { spoken: string[] }).spoken.at(-1),
    ),
  ).toBe(content.words[0].chinese);
});
test("vocabulary eligibility excludes idioms and makes phrases optional", async ({
  page,
}) => {
  const noun = {
    ...content.words[0],
    id: "a",
    part_of_speech: "noun",
    chinese: "房贷",
  };
  await page.route("**/content.json", (route) =>
    route.fulfill({
      json: {
        ...content,
        words: [
          noun,
          { ...noun, id: "b", part_of_speech: "phrase" },
          { ...noun, id: "c", part_of_speech: "idiom" },
          { ...noun, id: "d", part_of_speech: "sentence" },
        ],
      },
    }),
  );
  await page.reload();
  await expect(page.locator(".tag")).toHaveText("1 eligible");
  await page
    .getByText("Fine-tune your word selection", { exact: false })
    .click();
  await page.getByLabel("Include phrases (excluded by default)").check();
  await expect(page.locator(".tag")).toHaveText("2 eligible");
  await page.getByLabel("Include sentences (excluded by default)").check();
  await expect(page.locator(".tag")).toHaveText("3 eligible");
  await page
    .getByLabel("Maximum Chinese characters", { exact: true })
    .fill("1");
  await expect(page.locator(".tag")).toHaveText("0 eligible");
});

test("oversized quizzes require acknowledging the autofilled available count", async ({
  page,
}) => {
  await page
    .locator(".mode-card")
    .filter({
      has: page.getByRole("heading", {
        name: "Traditional characters",
        exact: true,
      }),
    })
    .click();
  await page.getByLabel("Maximum priority", { exact: true }).fill("");
  await page.getByLabel("Questions", { exact: true }).fill("500");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Reduce the question count",
  );
  await expect(page.getByLabel("Questions", { exact: true })).toHaveValue(
    String(content.characters.length),
  );
  await expect(page.locator(".question")).toHaveCount(0);
  await page.getByRole("button", { name: "Start practicing" }).click();
  await expect(
    page.locator(".question .traditional-different"),
  ).not.toHaveCount(0);
});

test("progress exposes recent accuracy, missed streaks, and chart controls", async ({
  page,
}) => {
  await page.getByLabel("Questions", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.getByRole("button", { name: /Progress/ }).click();
  await page.getByLabel("Progress maximum priority").fill("");
  await expect(
    page.getByText("Accuracy · last 100 attempts", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Incorrect streak target", { exact: true }),
  ).toHaveValue("1");
  await expect(page.getByLabel("Attempts per bucket")).toHaveValue("50");
  await expect(
    page.getByRole("img", { name: /Accuracy by bucket/ }),
  ).toBeVisible();
  await page.getByLabel("Group accuracy by").selectOption("week");
  await expect(
    page.getByRole("img", { name: /Accuracy by bucket/ }),
  ).toBeVisible();
});

test("feedback places a larger breakdown immediately after the meaning", async ({
  page,
}) => {
  await page.route("**/content.json", (route) =>
    route.fulfill({
      json: {
        ...content,
        words: [
          {
            ...content.words[0],
            part_of_speech: "noun",
            component_explanation: "房 (house) + 贷 (loan)",
            literal_translation: "",
            literal_translation_complete: "house loan",
          },
        ],
      },
    }),
  );
  await page.reload();
  await page.getByLabel("Questions", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  const breakdown = page.locator(".feedback .meaning + .components");
  await expect(breakdown).toHaveText("房 (house) + 贷 (loan)");
  await expect(breakdown).toHaveCSS("font-size", "17px");
  await expect(page.locator(".feedback .literal-breakdown")).toHaveCount(0);
});

test("tricky review filters consecutive misses by threshold and direction", async ({
  page,
}) => {
  const words = content.words
    .slice(0, 3)
    .map((w: Record<string, string>) => ({ ...w, part_of_speech: "noun" }));
  await page.route("**/content.json", (route) =>
    route.fulfill({ json: { words, characters: [], rules: [] } }),
  );
  await page.evaluate((words) => {
    const attempts = [
      [0, false, "en-zh"],
      [0, false, "en-zh"],
      [1, false, "en-zh"],
      [2, false, "en-zh"],
      [2, false, "en-zh"],
      [2, true, "en-zh"],
      [1, false, "zh-en"],
      [1, false, "zh-en"],
    ].map(([word, correct, direction], i) => ({
      id: String(i),
      item_id: `word:${words[Number(word)].id}`,
      mode: "vocabulary",
      direction,
      correct,
      answer: "test",
      overridden: false,
      created_at: new Date(2026, 0, 1, 0, 0, i).toISOString(),
      updated_at: new Date(2026, 0, 1, 0, 0, i).toISOString(),
    }));
    localStorage.setItem("zili-attempts-v1:guest", JSON.stringify(attempts));
  }, words);
  await page.reload();
  await page.getByRole("button", { name: /Review/ }).click();
  await page.getByRole("button", { name: "Focus on tricky words" }).click();
  await page
    .getByRole("combobox", { name: "Streak filter", exact: true })
    .selectOption("incorrect");
  await expect(
    page.getByLabel("Incorrect streak longer than", { exact: true }),
  ).toHaveValue("1");
  await page.getByRole("button", { name: "Open review" }).click();
  await expect(page.locator(".review-row")).toHaveCount(1);
  await expect(page.locator(".review-row")).toContainText(words[0].chinese);
  await page
    .getByLabel("Incorrect streak longer than", { exact: true })
    .fill("2");
  await expect(
    page.getByRole("button", { name: "Open review" }),
  ).toBeDisabled();
  await page
    .getByLabel("Incorrect streak longer than", { exact: true })
    .fill("1");
  await page.getByLabel("Prompt direction").selectOption("zh-en");
  await page.getByRole("button", { name: "Open review" }).click();
  await expect(page.locator(".review-row")).toHaveCount(1);
  await expect(page.locator(".review-row")).toContainText(words[1].chinese);
});

test("character review can read words followed by Chinese examples", async ({
  page,
}) => {
  await page.route("**/content.json", (route) =>
    route.fulfill({
      json: {
        words: [
          {
            ...content.words[0],
            chinese: "学习",
            part_of_speech: "verb",
            sentence: "我喜欢学习中文。",
          },
        ],
        characters: [],
        rules: [],
      },
    }),
  );
  await page.reload();
  await page.getByRole("button", { name: /Review/ }).click();
  await page.getByRole("button", { name: "By Chinese character" }).click();
  await page.getByLabel("Chinese character", { exact: true }).fill("学");
  await page.getByLabel("Also read Chinese example sentences").check();
  await page.getByRole("button", { name: "Open review" }).click();
  await page.getByRole("button", { name: "Listen to all" }).click();
  await page.evaluate(() =>
    (window as unknown as { finishSpeech: () => void }).finishSpeech(),
  );
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { spoken: string[] }).spoken),
    )
    .toEqual(["学习", "我喜欢学习中文。"]);
});

test("practice keeps three main filters visible and advanced filters collapsed", async ({
  page,
}) => {
  const setup = page.locator(".panel.setup");
  await expect(page.getByLabel("Questions", { exact: true })).toHaveValue("30");
  await expect(
    page.getByLabel("Maximum priority", { exact: true }),
  ).toHaveValue("5");
  await expect(
    setup.locator(":scope > .field-grid input, :scope > .field-grid select"),
  ).toHaveCount(3);
  await expect(page.locator(".filter-details")).not.toHaveAttribute("open", "");
  await expect(
    page.getByLabel("Exclude after correct streak", { exact: false }),
  ).not.toBeVisible();
  await expect(
    page.getByLabel("Maximum Chinese characters", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByText("Fine-tune your word selection", { exact: false })
    .click();
  await expect(
    page.getByLabel("Exclude after correct streak", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Maximum Chinese characters", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Maximum movie rank", { exact: true }),
  ).toBeVisible();
});

test("multiple choice supports vocabulary and idioms with collapsed distractor feedback", async ({
  page,
}) => {
  const words = ["noun", "idiom"].flatMap((part_of_speech, group) =>
    Array.from({ length: 6 }, (_, i) => ({
      ...content.words[0],
      id: `${group}-${i}`,
      chinese: `选项${group}${i}`,
      english: `meaning ${group} ${i}`,
      pinyin: `xuan ${group} ${i}`,
      part_of_speech,
      priority: "1",
    })),
  );
  await page.route("**/content.json", (route) =>
    route.fulfill({ json: { words, characters: [], rules: [] } }),
  );
  await page.reload();
  for (const [mode, direction] of [
    ["Vocabulary", "en-zh"],
    ["Idioms", "zh-en"],
  ]) {
    await page
      .locator(".mode-card")
      .filter({ has: page.getByRole("heading", { name: mode, exact: true }) })
      .click();
    await page.getByLabel("Questions", { exact: true }).fill("2");
    await page
      .getByRole("combobox", { name: "Prompt direction", exact: true })
      .selectOption(direction);
    await page.locator(".filter-details summary").click();
    await page.getByLabel("Multiple-choice answers", { exact: true }).check();
    await expect(
      page.getByLabel("Number of choices", { exact: false }),
    ).toHaveValue("5");
    await page.getByRole("button", { name: "Start practicing" }).click();
    await expect(page.getByRole("radio")).toHaveCount(5);
    const prompt = await page.locator(".question h1").innerText();
    const correct = words.find(
      (w) => (direction === "en-zh" ? w.english : w.chinese) === prompt,
    )!;
    await page
      .getByRole("radio", {
        name: direction === "en-zh" ? correct.chinese : correct.english,
        exact: true,
      })
      .check();
    await page.getByRole("button", { name: "Check answer" }).click();
    await expect(
      page.getByRole("heading", { name: "✓ You got it" }),
    ).toBeVisible();
    const details = page.locator(".choice-feedback");
    await expect(details).not.toHaveAttribute("open", "");
    await details.locator("summary").click();
    await expect(details.locator(":scope > div")).toHaveCount(4);
    for (const row of await details.locator(":scope > div").all()) {
      await expect(row.locator('[lang="zh-Hans"]')).toBeVisible();
      await expect(row.locator(".pinyin")).toBeVisible();
      expect(await row.innerText()).not.toContain(correct.chinese);
    }
    await page.getByRole("button", { name: "Next question" }).click();
    const secondPrompt = await page.locator(".question h1").innerText();
    const secondCorrect = words.find(
      (w) => (direction === "en-zh" ? w.english : w.chinese) === secondPrompt,
    )!;
    for (const option of await page.getByRole("radio").all()) {
      if ((await option.getAttribute("value")) !== secondCorrect.id) {
        await option.check();
        break;
      }
    }
    await page.getByRole("button", { name: "Check answer" }).click();
    await expect(
      page.getByRole("heading", { name: "○ Not in the accepted answer list" }),
    ).toBeVisible();
    await expect(details).not.toHaveAttribute("open", "");
    await page.getByRole("button", { name: "End session" }).click();
  }
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("zili-attempts-v1:guest") || "[]"),
  );
  expect(saved).toHaveLength(4);
  expect(
    saved.every((a: { multiple_choice?: boolean }) => a.multiple_choice),
  ).toBe(true);
  await page.getByRole("button", { name: /Progress/ }).click();
  const submitted = page
    .locator(".stat-grid .panel")
    .filter({ has: page.getByText("Answers submitted", { exact: true }) });
  await expect(
    page.getByLabel("Include multiple-choice quizzes"),
  ).not.toBeChecked();
  await expect(submitted.locator("strong")).toHaveText("0");
  await expect(page.locator(".history-list > div")).toHaveCount(0);
  await page.getByLabel("Include multiple-choice quizzes").check();
  await expect(submitted.locator("strong")).toHaveText("2");
  await expect(page.locator(".history-list > div")).toHaveCount(2);
  await page.getByRole("button", { name: "All quiz statistics" }).click();
  await expect(
    page
      .locator(".stats-table tbody tr")
      .filter({ hasText: "Vocabulary" })
      .first(),
  ).toContainText("2");
  await page.getByLabel("Include multiple-choice quizzes").uncheck();
  await expect(
    page
      .locator(".stats-table tbody tr")
      .filter({ hasText: "Vocabulary" })
      .first(),
  ).toContainText("0");
});

test("sentence writing saves, survives reload, searches, and exports matching AI feedback", async ({
  page,
}) => {
  await page.route("**/content.json", (route) =>
    route.fulfill({
      json: {
        words: [
          {
            ...content.words[0],
            id: "writing-a",
            chinese: "学习",
            trad_char: "學習",
            pinyin: "xué xí",
            english: "study",
            priority: "1",
            part_of_speech: "verb",
          },
          {
            ...content.words[0],
            id: "writing-b",
            chinese: "学校",
            trad_char: "學校",
            pinyin: "xué xiào",
            english: "school",
            priority: "2",
            part_of_speech: "noun",
          },
        ],
        characters: [],
        rules: [],
      },
    }),
  );
  await page.reload();
  await page.getByRole("button", { name: "Write sentences" }).click();
  await expect(
    page.locator(".sentence-writing h2 [lang=zh-Hans]"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save sentence", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".sentence-writing h2")).toHaveText("学习 (學習)");
  await expect(page.getByLabel("Show pinyin and English")).not.toBeChecked();
  await expect(page.locator(".sentence-writing .pinyin")).toHaveCount(0);
  await expect(
    page.locator(".sentence-writing").getByText("study", { exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Show pinyin and English").check();
  await expect(page.locator(".sentence-writing .pinyin")).toHaveText("xué xí");
  await expect(
    page.locator(".sentence-writing").getByText("study", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Show pinyin and English").uncheck();
  await page.getByLabel("Your example sentence").fill("我每天学习中文。");
  await page
    .getByRole("button", { name: "Save sentence", exact: true })
    .click();
  await expect(
    page.getByText("Saved. Find this sentence", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save sentence", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".sentence-writing h2 [lang=zh-Hans]")).toHaveText(
    "学校",
  );
  await expect(page.getByLabel("Your example sentence")).toHaveValue("");
  await expect(page.getByLabel("Your example sentence")).toBeFocused();
  await page.getByLabel("Your example sentence").fill("我走路去学校。");
  await page
    .getByRole("button", { name: "Save sentence", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /Progress/ }).click();
  const library = page.locator(".sentence-library");
  await expect(library.locator("article")).toHaveCount(2);
  await page.getByLabel("Search written sentences").fill("study");
  await expect(library.locator("article")).toHaveCount(1);
  await expect(library.locator("article")).toContainText("我每天学习中文。");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download for AI feedback" }).click();
  const download = await downloadPromise;
  const exported = fs.readFileSync((await download.path())!, "utf8");
  expect(exported).toContain("我每天学习中文。");
  expect(exported).not.toContain("我走路去学校。");
  expect(exported).toContain('"target_word": "学习"');
  await page.getByLabel("Search written sentences").fill("not found");
  await expect(library.locator("article")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Download for AI feedback" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("sentence writing keeps the draft when device storage rejects saving", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Write sentences" }).click();
  await page.getByLabel("Your example sentence").fill("这是我的例句。");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("zili-written-sentences"))
        throw new Error("Storage full");
      original.call(this, key, value);
    };
  });
  await page
    .getByRole("button", { name: "Save sentence", exact: true })
    .click();
  await expect(
    page.getByText("Could not save to device storage", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Your example sentence")).toHaveValue(
    "这是我的例句。",
  );
  await expect(
    page.getByRole("button", { name: "Save sentence", exact: true }),
  ).toBeEnabled();
});

test("copied sentence indicators persist, filter, reset, and copy only word and sentence", async ({
  page,
}) => {
  const rows = [
    {
      id: "feedback-a",
      word_id: "a",
      chinese: "学习",
      pinyin: "xué xí",
      english: "study",
      priority: "1",
      sentence: "我学习中文。",
      created_at: "2026-10-01T12:00:00Z",
    },
    {
      id: "feedback-b",
      word_id: "b",
      chinese: "学校",
      pinyin: "xué xiào",
      english: "school",
      priority: "1",
      sentence: "我去学校。",
      created_at: "2026-10-02T12:00:00Z",
    },
  ];
  await page.evaluate(
    (rows) =>
      localStorage.setItem(
        "zili-written-sentences-v1:guest",
        JSON.stringify(rows),
      ),
    rows,
  );
  await page.reload();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copiedSentences: string }).copiedSentences =
            text;
        },
      },
    }),
  );
  await page.getByRole("button", { name: /Progress/ }).click();
  const library = page.locator(".sentence-library");
  await expect(
    page.getByLabel("Hide sentences already copied for feedback"),
  ).toBeChecked();
  await expect(library.locator("article")).toHaveCount(2);
  await page.getByLabel("Search written sentences").fill("学习");
  await page.getByRole("button", { name: "Copy for AI feedback" }).click();
  await expect(library.getByRole("status")).toContainText("Copied 1 sentences");
  const copied = await page.evaluate(
    () => (window as unknown as { copiedSentences: string }).copiedSentences,
  );
  expect(JSON.parse(copied)).toEqual([
    { target_word: "学习", learner_sentence: "我学习中文。" },
  ]);
  await expect(library.locator("article")).toHaveCount(0);
  await page.getByLabel("Search written sentences").fill("");
  await expect(library.locator("article")).toHaveCount(1);
  await expect(library.locator("article")).toContainText("学校");
  await page.reload();
  await page.getByRole("button", { name: /Progress/ }).click();
  await expect(library.locator("article")).toHaveCount(1);
  await page.getByLabel("Hide sentences already copied for feedback").uncheck();
  await expect(library.locator("article")).toHaveCount(2);
  const copiedRow = library
    .locator("article")
    .filter({ hasText: "我学习中文。" });
  await expect(copiedRow).toContainText("Copied for feedback");
  await copiedRow.getByRole("button", { name: "Mark as not copied" }).click();
  await expect(copiedRow).toContainText("Not yet copied for feedback");
  await page.getByLabel("Hide sentences already copied for feedback").check();
  await expect(library.locator("article")).toHaveCount(2);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Copy for AI feedback" }).click();
  await expect(library.getByRole("status")).toContainText("Copy unavailable");
  await expect(library.locator("article")).toHaveCount(2);
});

test("sentence writing submits with Enter, supports newlines, and respects Chinese composition", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Write sentences" }).click();
  const input = page.getByLabel("Your example sentence");
  await input.fill("我学习中文。");
  await input.press("Shift+Enter");
  await expect(input).toHaveValue("我学习中文。\n");
  await input.fill("我学习中文。");
  await input.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
  });
  await expect(input).toHaveValue("我学习中文。");
  await input.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 229,
  });
  await expect(input).toHaveValue("我学习中文。");
  await input.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    repeat: true,
  });
  await expect(input).toHaveValue("我学习中文。");
  expect(
    await page.evaluate(() =>
      JSON.parse(
        localStorage.getItem("zili-written-sentences-v1:guest") || "[]",
      ),
    ),
  ).toHaveLength(0);
  const word = await page
    .locator(".sentence-writing h2 [lang=zh-Hans]")
    .innerText();
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  await expect(
    page.locator(".sentence-writing h2 [lang=zh-Hans]"),
  ).not.toHaveText(word);
  await input.press("Enter");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("zili-written-sentences-v1:guest") || "[]"),
  );
  expect(saved).toHaveLength(1);
  expect(saved[0].chinese).toBe(word);
  expect(saved[0].sentence).toBe("我学习中文。");
});

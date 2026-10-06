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
  await page.getByLabel("Maximum movie rank", { exact: true }).fill("1");
  await expect(page.locator(".tag")).toHaveText("0 eligible");
  await page.getByLabel("Include unknown filter values").check();
  await expect(page.locator(".tag")).toHaveText(
    `${content.words.filter((w: Record<string, string>) => w.part_of_speech !== "idiom" && w.part_of_speech !== "phrase" && (!w.movie_words_rank || Number(w.movie_words_rank) <= 1)).length.toLocaleString()} eligible`,
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
  await expect(page.getByLabel("Questions", { exact: true })).toHaveValue("3");
  await page.getByLabel("Questions", { exact: true }).fill("");
  await expect(page.getByLabel("Questions", { exact: true })).toHaveValue("");
  await page.getByLabel("Questions", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Start practicing" }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.locator(".feedback")).toBeVisible();
  await page.locator(".question input").focus();
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
  await page.getByLabel("Minimum character priority").fill("2");
  await page.getByLabel("Maximum character priority").fill("3");
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
        ],
      },
    }),
  );
  await page.reload();
  await expect(page.locator(".tag")).toHaveText("1 eligible");
  await page.getByLabel("Include phrases (excluded by default)").check();
  await expect(page.locator(".tag")).toHaveText("2 eligible");
  await page
    .getByLabel("Maximum Chinese characters", { exact: true })
    .fill("1");
  await expect(page.locator(".tag")).toHaveText("0 eligible");
});

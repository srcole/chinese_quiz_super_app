# 字里 · Chinese study

A personal Chinese study room for Chrome on a MacBook and Google Pixel. Six quiz modes, four review modes, Mandarin browser speech, configurable filters, and progress by quiz type and prompt direction.

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. The app works immediately with bundled study content and browser-local progress. Supabase is optional for local use, required for cross-device progress and cloud content updates.

```sh
npm test
npm run typecheck
npm run build
npm run test:e2e
```

The browser suite uses installed Google Chrome and checks desktop and Pixel-sized layouts. Audio queue behavior is tested with simulated speech; verify voice availability and pronunciation on your actual devices.

## Connect Supabase

1. Create a Supabase project. In its SQL Editor, run `supabase/schema.sql`. This creates content and attempt tables, user-specific access policies, and an administrative content import function.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your project's Connect/API settings. For content imports, also set `SUPABASE_SECRET_KEY` using a server-only secret key (`sb_secret_…`) from Settings → API Keys → Publishable and secret API keys. Never put the secret key in a `NEXT_PUBLIC_` variable, commit it, or paste it into a browser.
3. Under Authentication → URL Configuration, set the Site URL to your deployed site and allow `http://localhost:3000` during development. Add your exact Vercel production URL when available. If you use previews, allow only the preview URLs you actually use.
4. Enable email sign-in. For private use, invite your own email from the Auth dashboard and disable new-user signups. Existing users can continue using email sign-in links.
5. Run `npm run content:sync` to import the collection atomically. Restart the development server after changing environment variables.
6. In the app's Settings, send yourself a sign-in link. Open it on the same device/browser. Sign in with the same account on both devices. Use “Import this device’s guest progress” to carry local practice into your account.

Attempts save locally first and sync on changes, window focus, reconnection, and every 30 seconds while the page is open. A sync error is visible in Settings and the sidebar. Guest and account history use separate local storage. Account history remains cached on that device after sign-out. The app is designed for your personal devices.

The bundled learning content is publicly downloadable. Answer histories are protected by Supabase row-level security. Avoid putting private information into the source learning files.

## Deploy to Vercel

1. Push this project to your GitHub repository, then import the repository in Vercel.
2. Use the Next.js preset; the build command is `npm run build`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel's environment settings. The administrative secret key is **not needed** in Vercel.
4. Deploy and add the resulting URL to Supabase's Site URL and allowed redirect URLs. Sign in on your MacBook and Pixel using the same email.
5. After changing public environment variables, redeploy because these values are included at build time.

## Update your collection

- Edit `data/mmd_20260909.csv`, `data/trad_to_simp_char.csv`, or `data/grammar_content/grammar-exercises.json`.
- Preserve vocabulary `id`, character `idx`, and grammar rule/exercise IDs when correcting existing content. Give new entries new IDs; never recycle a removed ID for an unrelated entry.
- Remove a row to exclude it from future practice. Its attempt history remains intact. Reintroducing the same ID restores its relationship with history.
- Run `npm run content:prepare` to validate and regenerate bundled content. `dev` and `build` do this automatically.
- Run `npm run content:sync` to update Supabase. The import is transactional: updated rows replace content, new rows are inserted, removed rows become inactive. It does not delete attempts.
- The sync command uses TLS 1.2 to work around a reproduced TLS 1.3 upload failure (`ERR_SSL_SSL/TLS_ALERT_BAD_RECORD_MAC`) with the large import request on this development machine. Encryption and certificate verification remain enabled; the web app's transport is unchanged. The script checks connectivity and reports request size, duration, and network error codes. A network failure leaves the import outcome unknown, unlike a database statement timeout, which rolls back the transaction.
- If an existing installation reports `canceling statement due to statement timeout`, run `supabase/migrations/20261006_optimize_content_import.sql` in the Supabase SQL Editor and retry the sync. This replaces the import function with an indexed staging-table implementation that skips unchanged records. Then run `supabase/migrations/20261006_import_timeout.sql` to give only the administrative import function a 60-second timeout and reload its API configuration. New installations get this function from `supabase/schema.sql`.
- Reload the app to fetch the latest cloud content. Commit source changes and redeploy to update the bundled fallback as well.
- To import another vocabulary filename, set `VOCAB_CSV` in your shell or `.env.local` for `content:sync`. The default build uses `data/mmd_20260909.csv`; rename your updated source to this path or configure the build environment accordingly.

## Study behavior

- Vocabulary excludes idioms. Phrases are excluded by default; enable “Include phrases” or explicitly select the phrase part of speech to include them. An optional Chinese-character limit narrows vocabulary questions.
- Audio-only vocabulary switches to Chinese → English and hides the written prompt until feedback. It plays the prompt even if general automatic audio is off. Listening shares history with the Chinese → English vocabulary direction.
- Traditional-character answers are correct when the expected simplified character appears anywhere in the response. Examples use larger Chinese text.
- Session summaries list incorrect answers and can read them all in Chinese. Sentence and grammar quizzes read the expected Chinese sentences; other quizzes read words or characters.
- A Chinese example sentence consisting only of a hyphen (with optional surrounding whitespace) is treated as missing, including its pinyin and translation. This applies to imports and existing cloud content.

- New sessions default to 3 questions, English → Chinese. The question count can be cleared while editing; an empty count uses 3 when starting.
- Blank answers submit as incorrect and reveal feedback. Enter advances from feedback; Chinese IME composition does not trigger navigation.
- Tone quizzes default to at most 2 Chinese characters, with prompt audio enabled. Both settings can be changed in quiz setup.
- Traditional-character quizzes support minimum and maximum priority filters.
- Progress defaults to Vocabulary, English → Chinese, maximum priority 6. Practiced and correct-streak counts use eligible items in the current collection as the denominator. The target streak defaults to 2. Detailed statistics show every quiz/direction and exact priority, including unseen items; grammar has no priority.
- Correct/incorrect progress filters apply to individual recorded attempts. Playback reads each matching Chinese item once. An item can have both correct and incorrect historical attempts.

- Vocabulary and idiom answers accept the full English definition or a semicolon/slash-separated definition. Chinese answers match the stored simplified form. Matching normalizes Unicode width, case, punctuation, and whitespace. It does not guess semantic equivalence.
- “Accept my answer” changes the recorded result to correct and updates streaks. Grammar mismatches are described as unlisted answers, not definite grammatical errors.
- Exclusion uses consecutive correct answers for the same item, quiz mode, and prompt direction. Default: 2. Set 0 to disable. Unattempted items remain eligible. Streak exclusion applies to vocabulary, idiom, tone, and sentence quizzes.
- Tone answers use dictionary tones from `tone_pattern`; neutral tone is 5. Feedback shows `tone_change` when available. Spoken audio may naturally include tone changes.
- HSK uses the lowest listed level; 7–9 is one band. Slang 0.5 counts as 0. Missing values pass an active filter only if “Include unknown values” is checked. Date boundaries are inclusive.
- Character review includes matches in either simplified or traditional spelling. Category choices combine with AND; multiple parts of speech combine with OR.
- Priority review selects an exact priority level. Quiz filters use maximum priority.
- Random sessions have no duplicate questions and cap at the eligible count (maximum 500 per session). Submitted answers save immediately. Leaving a session retains submitted history; unfinished questions are not recorded.
- 27 idiom entries currently have no literal translation. Feedback marks this as missing rather than inventing one.
- Grammar data is an authored draft with structural validation, not an independently reviewed linguistic reference.

## Audio

Audio defaults to 1.2× speed with no added pause. Existing installations receive these defaults once; further changes persist. Tone and traditional-character feedback and character exploration use no added pause. Browser voices can still insert natural pauses.

Review reads Chinese words only by default; “Also read Chinese example sentences” includes sentences. Grammar review always reads its example sentences. Each expanded character panel in quiz feedback can read all matching words, including those beyond the displayed first 30.

The app uses the device's Web Speech API and available Chinese voices, with no paid speech service. Install/enable a Mandarin voice in device speech settings if none is available. Use Settings to test the voice. Pronunciation, background playback, and pause/resume behavior depend on Chrome and the operating system; keep the study page active for continuous review. Audio errors are displayed with a retry instruction.

Review playback reads every matching row, including rows initially hidden behind “Show next 50.” The active row is revealed and highlighted. Switching pages or filters cancels playback. No English is spoken.

## Progress backups

Export all attempts as JSON from Progress or Settings. Supabase provides cross-device history; local-only history can be lost if browser storage is cleared. Keep exports if studying without sync.

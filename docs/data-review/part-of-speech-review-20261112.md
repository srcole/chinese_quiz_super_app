# Part-of-speech review — 2026-11-12

Scanned the current 9,119-entry classification inventory across all categories and reviewed candidate errors against the Chinese headword, supplied English sense, and examples. Corrected 177 labels. This is an editorial data review, not an independent dictionary certification of every entry. The companion `part-of-speech-changes-20261112.csv` records each correction and its reason.

## Conventions

- Preserve a defensible label when the supplied sense supports it. Chinese words often have several grammatical functions; an English infinitive or an adverbial position alone does not determine the Chinese part of speech.
- Use the existing broad `idiom` study category for established 成语, figurative colloquial expressions, proverbs, and fixed sayings, even when they function grammatically as adjectives, verbs, nouns, or adverbs. This follows the November 5 idiom review.
- Keep ordinary full utterances and instructions under `sentence`, compositional fragments under `phrase`, and names of places/settings under `noun` where appropriate.
- Distinguish sentence-final modal particles from independent exclamations. Introduce `onomatopoeia` for actual sound imitations rather than mislabeling them as nouns or interjections. The app derives its part-of-speech choices from the data, so this requires no UI or database-schema change.

## Changes by replacement label

| Label | Entries |
| --- | ---: |
| idiom | 87 |
| adjective | 31 |
| adverb | 11 |
| verb | 10 |
| particle | 9 |
| noun | 9 |
| onomatopoeia | 8 |
| phrase | 4 |
| interjection | 3 |
| pronoun | 2 |
| sentence | 2 |
| classifier | 1 |

Examples: 啦 and 嘛 become particles; 多少 becomes an interrogative pronoun; 份 becomes a classifier; 截图 becomes a noun; 据说 becomes an adverb; 眉飞色舞 and 手足无措 move into idiom practice. Existing idiom labels were retained.

## References and unresolved entries

Representative dictionary checks: [啦](https://zdic.net/hans/%E5%95%A6), [嘛](https://zdic.net/hans/%E5%98%9B), [多少](https://zdic.net/hans/%E5%A4%9A%E5%B0%91), and [眉飞色舞](https://zdic.net/hans/%E7%9C%89%E9%A3%9E%E8%89%B2%E8%88%9E). These support the sampled linguistic decisions; the complete set of corrections is editorial, following the conventions above.

`part-of-speech-review-notes-20261112.csv` records unresolved or retained ambiguous entries. In particular, 神而, 推出登录, and 遥可及 have conflicting headwords/glosses/examples, while 其本上 appears to contain a typo. Their text and labels were not silently rewritten. 须知 has both verbal and nominal senses; its supplied verbal gloss was retained. 其中 remains under the repository's location-noun convention.

## Supabase update

Run the entire `supabase/migrations/20261112_correct_parts_of_speech.sql` file in the Supabase SQL Editor, then reload the app and start a new session. It changes only `payload.part_of_speech` and `updated_at`, checking the stable ID, Chinese text, and previous label before updating. The result lists the rows actually changed. On a matching current database, the first run changes 177 rows; a rerun normally changes zero.

Rows that are missing or already have a different label are skipped, preserving any independent edits. A smaller update count is therefore not necessarily an error. This script contains this review's changes only; it does not substitute for older imports or migrations. No content is deleted or deactivated, and attempts, adult flags, literal translations, and other payload fields remain intact.

Moving entries into the idiom category changes their eligibility for future idiom/vocabulary quizzes. Historical attempts retain their original mode. Redeploy to update guest users' bundled content. A full content sync from the current main CSV is an alternative to the targeted SQL.

## Validation

- All 9,119 IDs, row order, field names, and non-part-of-speech values preserved, including `is_adult`.
- Raw field-span replacement preserved original CSV quoting and line endings.
- Compared the review manifest and SQL corrections against the before/after CSV records.
- Regenerated the bundled content and checked labels against the CSV.
- Checked that all 87 entries newly classified as idioms already have complete literal translations.
- Whitespace validation allows the source CSV's existing CRLF endings.

The SQL was prepared and validated against local data, but not executed against Supabase.

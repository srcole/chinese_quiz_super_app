# Vocabulary update import — 2026-11-05

Integrated `data/mmd_update_20261027.csv` into the canonical `data/mmd_20260909.csv`. The update contains 118 rows: 113 new entries were appended, bringing the collection to 9,119 words. All 9,006 existing entries, including the preceding idiom corrections, remain unchanged. The original update CSV is preserved.

## Duplicate handling

These entries already exist with the same meaning. Their existing IDs, content, and progress relationships were retained rather than introducing duplicate quiz cards:

| Update ID | Word | Existing ID |
| --- | --- | --- |
| 9118 | 搭讪 | 4207 |
| 9133 | 井底之蛙 | 3448 |
| 9139 | 随和 | 2461 |
| 9204 | 活在当下 | 6933 |
| 9207 | 吹毛求疵 | 8697 |

`word-import-20261027.csv` records the destination ID for every source row.

## Conversion and enrichment

- Preserved source IDs for new entries, Chinese text, English glosses, priorities, examples, component fields, and dates. The source dates are September 30 and October 19, 2026; the filename's October 27 date was not substituted.
- Assigned current part-of-speech labels: 43 nouns, 20 idioms/sayings, 11 sentences, 17 verbs, 9 phrases, 8 adjectives, 4 adverbs, and 1 proper noun. This uses the broad idiom policy documented in the earlier review. Labels follow the supplied sense; for example 左宗棠鸡 is a dish noun, not a person's name.
- Mapped legacy categories into existing three-level category paths. Added traditional spellings, dictionary-tone patterns (neutral tone = 5), and component displays from the supplied component glosses.
- Added editorial literal translations for all 20 new idioms/sayings. Other new entries retain blank complete literal translations unless provided; the UI displays this field only in idiom feedback.
- Stored original pinyin and English in the provenance fields. Normalized 一/不 tone-sandhi spellings in 孤注一掷, 忍不住, 昙花一现, and 日复一日 to dictionary tones for tone practice. Preserved the source readings of 卡; [汉典's 卡壳 entry](https://zdic.net/hans/%E5%8D%A1%E5%A3%B3) supports qiǎ ké.
- Missing HSK, frequency/commonness, slang, collocation, register, and other specialist metadata remains blank rather than being guessed. Filters requiring these fields may require “Include unknown values.”
- Did not import legacy `known` counters as quiz attempts. They do not contain the dated answer events required by this app.
- Did not treat the numeric `literal translation` values (1/2) as translation text; they are legacy flags rather than English glosses.

## Supabase

Run the complete `supabase/migrations/20261105_add_words_20261027.sql` file in the Supabase SQL Editor. It inserts the 113 new word payloads in a transaction and returns the inserted IDs and Chinese words. Existing IDs are skipped, so reruns do not overwrite edits, reactivate removed rows, or change progress. It does not deactivate any existing content. If an expected ID already exists remotely with different content, inspect it separately; this insert-only script deliberately leaves it untouched.

Reload the app and start a new session afterward. New words follow your normal priority, category, date, part-of-speech, and progress filters; they are not forced into every random session. Redeploy the app to update the bundled fallback for guests. No app-code or database-schema change is needed.

Do not point `VOCAB_CSV` at the raw update file or pass it alone to the full replacement import: it uses the legacy schema and is only a partial collection. The canonical CSV now contains the merged collection, so a normal full `npm run content:sync` is an alternative to this targeted SQL.

The two earlier repair scripts for idiom translations and classifications are independent. This additions script does not apply those repairs to existing hosted rows.

## Validation

- Confirmed all existing rows are unchanged by this import and all 9,119 IDs are unique.
- Regenerated bundled content: 9,119 words, 179 characters, 155 grammar rules.
- Verified all 118 source entries resolve to the bundled collection using the audit mapping.
- Compared all 113 SQL payloads against the canonical CSV and generated bundle; they match exactly.
- Verified required quiz fields, examples, tone-pattern syntax, and literal translations for all new idioms.
- Preserved existing CSV CRLF line endings; whitespace check passes with CRLF allowance.

The SQL has been prepared and inspected but has not been executed against Supabase.

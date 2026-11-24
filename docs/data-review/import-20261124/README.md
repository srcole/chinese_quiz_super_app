# Vocabulary import — 2026-11-24

Imported `data/mmd_update_20261124.csv` into the canonical `data/mmd_20260909.csv`.

- Source: 94 rows.
- Added: 80 new entries, retaining their source IDs.
- Already present: 14 headwords, retained under their existing IDs with all existing fields unchanged.
- Main vocabulary: 9,119 → 9,199 rows.
- `source-mapping.csv` maps all source rows to canonical IDs. `new-words.csv` contains the complete 80 enriched records.

## Metadata decisions

Retained supplied priority, quality, dates, English glosses, and examples. Mapped legacy categories to existing three-level category paths. Reviewed parts of speech, traditional forms, dictionary-tone patterns, tone-change notes, collocations, synonyms, measure words, register, slang/adult flags, and verb usage where applicable.

`commonness` values are editorial estimates on the existing 1–9 scale, not corpus measurements. `region=Mainland` describes applicability in Mainland usage, not exclusivity. HSK levels and movie frequency ranks remain blank when not supplied: these depend on an external syllabus/corpus and were not guessed. Inapplicable fields, such as measure words for adverbs or transitivity for nouns, stay blank. Near-synonyms cover the supplied sense and can differ in register.

All new idioms have literal translations in both literal-translation columns. Classification follows the repository's broad idiom convention, which includes established sayings and fixed literary expressions; it is not restricted to four-character 成语. `恨比爱长久` is an ordinary assertion rather than an established idiom and is classified as `sentence`. `缘分到这了` is also a sentence.

Only `炮友关系` is marked `is_adult=1`, following the existing explicit-sexual-content policy. Ordinary romance, infidelity references, gender identity, and metaphorical 裸辞 remain `0`.

Replaced mnemonic associations with meaningful word segments in the new records, including correcting the shifted fields in 骑驴找马, 妙 incorrectly glossed as “a second,” and unrelated decompositions such as 公司/空气 for 司空. Brand names are explicitly identified as names rather than assigned invented literal etymologies. Source update CSV remains unchanged.

Corrected 狐狸精 to `hú li jīng` in its headword and example pinyin. Normalized 不 in 天上不会掉馅饼 to dictionary `bù` in the headword, while retaining spoken `bú` in the example and documenting sandhi. Retained `chòu wèi xiāng tóu` for the humorous/derogatory sense of 臭味相投 and `yǔ yǒu róng yān` for 与有荣焉.

References consulted for ambiguous pronunciations:

- [Ministry of Education: 臭味相投](https://dict.revised.moe.edu.tw/dictView.jsp?ID=107559&q=1&word=%E7%9B%B8) lists both xiù and chòu readings with differing senses.
- [Ministry of Education: 狐狸 entries](https://dict.revised.moe.edu.tw/search.jsp?la=0&powerMode=0&word=%E7%8B%90%E7%8B%B8) gives 狐狸精 with first-tone 精.
- [Wiktionary: 與有榮焉](https://en.wiktionary.org/wiki/%E8%88%87%E6%9C%89%E6%A6%AE%E7%84%89) supports the retained yǔ reading.

`三立方` retains the supplied cubic-meter sense and example. The source English also notes a coffee-shop association; without identifying information, no specific business identity was inferred. `18届的人` retains the source's class-of-2018 interpretation.

## Supabase

Run the entire `supabase/migrations/20261124_add_words.sql` file in the Supabase SQL Editor, then reload the app and start a new quiz. The insert-only SQL adds active word rows and returns their IDs and Chinese text. It skips existing IDs and headwords, is safe to rerun, and does not overwrite existing content or progress. On a database matching the prior canonical collection, it inserts 80 rows; fewer returned rows mean some IDs/headwords already exist. It does not reactivate inactive rows.

For psql, from the repository root with an already configured database connection:

```sql
\i supabase/migrations/20261124_add_words.sql
```

No schema migration or app-code change is required. The SQL has not been executed against Supabase.

New entries still follow quiz filters: many have priority above the default maximum; idioms use the idiom quiz, and phrases/sentences require their inclusion options in vocabulary mode. To focus on this batch, set the added-date filter to 2026-11-24 and allow the relevant priorities and parts of speech. Unknown HSK/movie ranks can also exclude words if those filters are enabled without “include unknown” enabled.

The bundled fallback content was regenerated locally. Redeploy the app to update that fallback for guests/offline use; running SQL updates hosted content but does not redeploy the bundle. Do not use the legacy update CSV alone as input to a full content sync.

## Validation

Checked unique IDs and Chinese headwords for additions, valid existing category paths, required quiz fields, complete example triples, binary adult flags, dictionary-tone syntax, and literal translations for every new idiom. Existing CSV bytes remain an unchanged prefix of the expanded file. All source entries resolve via the mapping, and the SQL/audit/bundled additions match the canonical CSV.

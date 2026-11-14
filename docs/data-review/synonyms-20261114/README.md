# Missing synonym review — 2026-11-14

Inspected `synonym(s)` in all 9,119 rows of `data/mmd_20260909.csv`. Initially 1,629 rows had synonyms and 7,490 were blank or `-`. Added reviewed synonyms, near-synonyms, and alternative names to 466 previously empty fields. There are now 2,095 populated fields and 7,024 empty fields.

This is selective enrichment, not a requirement that every entry have synonyms. Many remaining entries are proper names, full sentences, specialized terms, or concrete things with no useful common equivalent. Existing synonym values were preserved; this review does not validate those older values.

## Conventions and meaning

- Retained the existing semicolon-separated Chinese format.
- Selected equivalents using each row's Chinese headword and English gloss. Synonyms may cover one sense of a polysemous word; they are not necessarily interchangeable in every sentence.
- Included common full forms and abbreviations (国企 / 国有企业), alternate spellings (树荫 / 树阴), regional names (馄饨 / 云吞 / 抄手), and colloquial/formal alternatives (码农 / 程序员). Regional names and register can differ in usage.
- Excluded uncertain matches, broader categories, and loose associations. No automatic reversal of existing synonym lists was used.
- `additions.csv` provides ID, Chinese, English, original synonym value, and replacement value for every changed row.

## Supabase

Run `supabase/migrations/20261114_fill_missing_synonyms.sql` in the Supabase SQL Editor, then reload the game. It updates the JSON field `synonym(s)` and `updated_at` only, matching word ID and Chinese headword and requiring the current synonym field to be missing, blank, or `-`.

The returned rows show which entries were updated, up to 466. Existing synonyms, mismatched headwords, and absent word records are skipped. Rerunning is safe. No changes were executed against Supabase.

## Validation

All 9,119 rows, IDs, and row order are preserved. Only the 466 previously empty synonym fields changed; all existing examples and other fields remain intact. The audit CSV, SQL payload, and generated game content were checked for identical additions. Content preparation succeeds.

# Missing vocabulary examples — 2026-11-13

Reviewed all 9,119 rows of `data/mmd_20260909.csv`. There were 1,006 rows with all three example fields blank or `-`. Added Chinese sentences, tone-marked pinyin, and English translations for 219 entries: 110 nouns, 101 phrases, six idioms, one adjective, and one verb.

The remaining 787 entries are classified as `sentence` and already contain the utterance to study in their headword fields. Their intentional `-` example placeholders were preserved. No existing examples, headwords, priorities, classifications, or other fields were changed.

`examples.csv` contains the additions keyed by vocabulary ID. Pinyin uses separate syllables and dictionary tones for 一 and 不 rather than spoken tone sandhi. Generated pinyin drafts were reviewed and corrected for context-sensitive readings, including 切, 干煸, 特调, 教, 得 and 地.

Some source headwords appear malformed. Examples quote unclear menu names without silently changing the source. The examples for IDs 2341 and 3127 use 榜 and 厚 respectively, correcting apparent typos only within the new sentences. ID 3589 uses the adverbial 地. Numeric units and abbreviations are expanded naturally in examples where appropriate. The original vocabulary entries remain unchanged.

## Supabase update

Run `supabase/migrations/20261113_fill_missing_examples.sql` in the Supabase SQL Editor, then reload the game. The SQL updates existing `public.study_content` word rows by ID and matching Chinese headword, and only when **all three** example fields are absent, blank, or `-`. It changes only those three JSON payload fields and `updated_at`; user progress is untouched.

The returned rows identify the entries updated (up to 219). Fewer rows can mean Supabase already has examples, a headword differs, or a vocabulary row has not been imported. Rerunning safely leaves populated examples alone. This script does not insert missing vocabulary rows and has not been executed against Supabase.

Validation: all 9,119 IDs, row ordering, and non-example values are preserved; the review CSV and SQL contain identical additions; the game content preparation succeeds and includes every new example triple.

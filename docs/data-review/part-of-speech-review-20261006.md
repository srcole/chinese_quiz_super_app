# Part-of-speech review — 2026-10-06

Updated 3,644 of the 9,006 rows in `data/mmd_20260909.csv`. The accompanying `part-of-speech-changes-20261006.csv` records each ID, Chinese entry, English gloss, previous label, replacement label, and reason.

## Classification conventions

- `sentence`: complete statements, questions, requests, signs/directives, and conventional conversational utterances. Chinese sentences do not require punctuation or an explicit subject; greetings and contextually complete responses qualify. There are now 1,135 entries in this category.
- `phrase`: compositional fragments, dependent clauses, sentence starters, descriptive phrases, and multiword constituents. Length alone does not determine this label.
- `idiom`: established idiomatic expressions, retaining the app's separate idiom category even when an expression has a verbal or adjectival grammatical function.
- `noun`: lexical nouns, compound nouns, technical terms, foods, and nominal concepts. A long compound noun is not automatically a phrase.
- `proper_noun`: names of people, places, companies, brands, fictional characters, and titled works, using the supplied English gloss to distinguish senses.
- `verb`, `adjective`, and `adverb`: the Chinese entry's function in its supplied sense, rather than the grammatical form of its English translation.
- `conjunction`, `preposition`, `pronoun`, `particle`, and `classifier`: added where existing lexical categories were misleading. For example, sentence-final 呢 and 吧 are particles, and 套 in the supplied house-counting sense is a classifier.

These are editorial study labels, not exhaustive dictionary analyses. Chinese words can have multiple functions; an existing valid nominal sense was retained where appropriate. Colour names can remain nouns. Ambiguous or malformed text was not silently rewritten. Sentence/phrase boundaries can depend on context, especially for short responses and descriptive fragments.

## Integrity checks

- All 9,006 rows, IDs, column names, and row order preserved.
- Every field other than `part_of_speech` matches the working CSV at the start of this review.
- Original quoting and line endings preserved by replacing only the part-of-speech field span in each changed record.
- Existing edits to examples and translations preserved, including rows 3277, 3283, and 3284. Their part-of-speech labels are now `sentence`.

## App implications

The app derives its part-of-speech choices from the data, so the new categories require no schema or UI changes. Existing quiz history uses unchanged IDs. Newly categorized idioms enter the idiom pool and leave the vocabulary pool. Sentences can be selected or excluded through the part-of-speech filter; the current vocabulary default excludes `phrase` but does not automatically exclude `sentence`.

This review updates the local source CSV. It does not publish a deployment or synchronize the hosted Supabase content.

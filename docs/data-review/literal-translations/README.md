# Completed literal translations — 2026-10-09

Added `literal_translation_complete` as the final column of `data/mmd_20260909.csv`. All 9,006 rows have a nonempty value.

- Filled all 5,770 gaps in the original literal-translation column.
- Retained 3,205 existing literal translations in the new column.
- Refined 31 existing translations in the new column, including misleading character senses, awkward glosses, and names needing context.
- Preserved the original `literal_translation` and all other original fields unchanged.

## Translation conventions

These are English study glosses, not claims about historical etymology. Compositional words and figurative expressions expose their component meanings where useful. For example, 说服 is “speak into submission,” and 睁一只眼闭一只眼 is “open one eye and close one eye.”

Ordinary sentences are translated closely but readably. A literal sentence translation may match the existing English. Single-character words and lexicalized expressions use the relevant sense rather than invented component explanations. The 707 existing English glosses retained for previously empty rows were reviewed in context; missing values were not filled through an unconditional English fallback.

Phonetic names and loanwords are identified where character meanings would mislead: 拿铁 is “latte (phonetic loanword).” Some names include an explicitly labelled character gloss. Chinese personal names can retain the name rather than an artificial English rendering of the surname and given name.

Particles and sound imitations explain their function or approximate sound. Slang and idioms preserve the literal image, sometimes with a short clarification. Vulgar wording is retained where needed for an accurate translation.

Malformed or ambiguous source text is noted in the new value. Source Chinese and English were not silently repaired. For example, 遥可及 is glossed as “distant but reachable,” noting that the existing English “out of reach” would require 不.

## Review artifacts and validation

`reviewed-glosses.csv` records the 5,801 additions/refinements by stable ID, with the Chinese, existing English, original literal translation, completed gloss, and review action. Rows retained from the original literal-translation column are omitted from that ledger.

`validation.json` records counts and SHA-256 hashes of the source CSV before and after this change.

Verified:

- 9,006 rows, unchanged IDs and ordering, and exactly one added column (42 → 43).
- No blank completed translations.
- Every original CSV record preserved byte-for-byte before the appended cell, including original quoting and CRLF line endings.
- All 5,801 review records have unique IDs and match the completed CSV.
- `node --import tsx scripts/prepare-content.ts` succeeds, producing 9,006 vocabulary rows, 179 characters, and 155 grammar rules; all generated vocabulary records include the completed column.

The feedback UI now displays `literal_translation_complete`. Local app content has been regenerated; these changes do not publish a deployment or synchronize hosted content.

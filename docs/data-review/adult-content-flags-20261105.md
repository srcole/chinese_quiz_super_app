# Adult-content flags

Added `is_adult` to all 9,119 records in the main vocabulary CSV: 86 are `1`, and 9,033 are `0`. These are editorial content labels, not legal age ratings. Candidate discovery used Chinese and English terms, category/register metadata, and examples; ambiguous candidates were reviewed in context.

`1` covers sexual acts, pornography, sexual services, explicit sexual anatomy and fluids (including clinical wording), sexual arousal, sexual abuse, sexual safety/STIs, nudity, and strong profanity. A supplied sexual sense or example is sufficient even if the entry also has an ordinary meaning. For example, 小玩具 includes a sex-toy gloss, and 有反应 has a sexual example. The audit CSV lists every positive flag and its rationale.

`0` includes ordinary romance, gender and sexual-orientation identities, pregnancy, menstruation, general health, ordinary bodily functions, and nonsexual uses of potentially ambiguous characters. Examples include 同性恋, 双性恋, 变性人, 手冲 (coffee), 做运动 (exercise), 性价比, and 裸色. Merely naming bad language (粗话 or 脏话) is not equivalent to using strong profanity.

All existing fields, IDs, row order, quoting, and line endings were preserved. The bundled content was regenerated and the binary values validated. The existing loader carries the new field through automatically as a CSV string (`"0"` or `"1"`), consistent with other vocabulary fields.

This change adds metadata only; it does not implement a quiz filter or modify Supabase. A normal full content sync can publish the new field. Previously generated targeted SQL files are snapshots from before this column was added and do not populate it.

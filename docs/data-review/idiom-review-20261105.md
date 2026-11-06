# Idiom classification review — 2026-11-05

Reviewed all 456 rows labeled `idiom` in `data/mmd_20260909.csv`, reading the Chinese entry against its supplied English sense. Corrected 14 clear misclassifications (11 nouns, 3 sentences); retained 442. The companion `idiom-review-20261105.csv` records every reviewed entry, including unchanged entries and reasons for each correction.

## Scope and judgment

This is a conservative editorial review, not a dictionary certification of every retained entry. It follows the repository's existing broad category of established idiomatic expressions, including colloquial expressions, proverbs, conventional blessings, and modern figurative expressions. It does not redefine the quiz as exclusively classical four-character 成语. Character count and a literal-looking English gloss are insufficient reasons to remove an expression.

For example, retain 拍马屁, 落汤鸡, 白眼狼, 门外汉, and 走关系 for their conventional figurative meanings; retain 脚趾抠地, 脑洞大开, 心灵鸡汤, and 闲得蛋疼 as modern colloquial expressions. Retain established sayings such as 吃什么补什么 and 百善孝为先, and conventional blessings such as 恭喜发财 and 年年有余. Borderline or transparent fixed expressions such as 人生百态, 四季如春, 自问自答, 一动不动, and 平平无奇 remain under this broad convention. A strict 成语-only collection would need a separate classification policy.

By contrast, the words *naming* a saying or idiom (名言, 名句, 习语, 成语, 俗话, 俗语) are ordinary nouns. 说法 is also a noun in the supplied sense. 一夜情, 不可抗力, 脱口秀, and 反向旅游 name concepts or activities. The three removed sentences are an ordinary health statement, a relationship assertion, and a long learner instruction; their full wording does not function as a fixed idiomatic expression.

## References consulted

- [Taiwan Ministry of Education classification conventions](https://language.moe.gov.tw/001/Upload/files/SITE_CONTENT/M0001/CDBOOK/charpt1-4.html) distinguish 成语, colloquial fixed expressions, and proverbs; explicitly include 落汤鸡 among colloquial expressions. These distinctions inform the broad-category policy, rather than certifying all retained rows.
- [汉典: 名言](https://zdic.net/hans/%E5%90%8D%E8%A8%80) supports the supplied sense of a famous saying or remark.
- [Ministry of Education discussion of new vocabulary](https://www.moe.gov.cn/jyb_xwfb/xw_ft/moe_46/moe_1055/tnull_2974.html) discusses 脱口秀 as a new lexical item.
- [中国经济周刊: 客观看待“反向旅游”热](https://paper.people.com.cn/zgjjzk/html/2024-07/15/nw.zgjjzk_20240715_4-04.htm) describes the named travel trend.

Individual replacement labels are editorial judgments based on the Chinese wording and the dataset's supplied sense; references are not presented as explicit part-of-speech labels for every row.

## Apply to Supabase

Run `supabase/migrations/20261105_correct_idiom_classifications.sql` in the Supabase SQL Editor, then reload the app and start a new quiz. It updates only `payload.part_of_speech` and the content timestamp, checks both stable ID and Chinese text, and only changes rows still labeled `idiom`. It returns the changed records and is safe to rerun (a second run normally changes zero rows). Missing rows or previously recategorized rows are skipped.

No rows are deleted or deactivated. Attempts, literal translations, and all other content fields remain intact. Historical idiom attempts retain their original quiz mode. The reclassified nouns become eligible for vocabulary practice; the three sentences follow the existing sentence inclusion filters.

The earlier literal-translation repair is independent and may be run in either order. A full `npm run content:sync` also imports the corrected CSV, but replaces the whole collection rather than applying this targeted repair. This review did not modify the hosted database.

## Validation

- All 9,006 source rows, IDs, column names, ordering, quoting, and line endings preserved.
- Parsed before/after comparison confirmed that only the 14 intended `part_of_speech` fields changed.
- Bundled content regenerated successfully: 9,006 words, 179 characters, 155 grammar rules.
- CSV uses existing CRLF line endings; whitespace validation allows CR at end of line.

# Radical review

The Review page now includes **By radical**. It uses all 90 names from `data/radical_names_90.csv`; the missing closing parenthesis in 羊字旁 was repaired. Search accepts Chinese names, component symbols, English descriptions, and pinyin with or without tone marks or spaces.

Results are unique characters appearing in the current vocabulary's `chinese` headwords, including multi-character words and phrases. The separate 179-entry traditional-character collection does not limit results. Traditional spelling fields are not indexed in this first version. Characters can appear in multiple radical groups.

Open a character to see matching vocabulary, full-word pinyin and English, word audio, and the existing personal priority controls. This avoids guessing a single pronunciation for polyphonic characters. Examples are displayed ten at a time. Adult-themed vocabulary is excluded by default and can be included in this tab. Other quiz/review filters do not restrict radical review. The default review mode remains Focus on tricky words with an incorrect streak of at least two.

## Listening examples

After selecting a radical, **Listen to examples** queues one word-and-character phrase per eligible character, such as 果汁的汁、汇率的汇、汉语的汉. The preview shows the exact sequence. Selection prefers ordinary short words over proper names, then shorter words and lower priority numbers. Only two-to-four-character Chinese headwords are eligible; sentence entries and characters without a suitable word are skipped. Adult filtering applies before selection. Playback uses the existing voice, speed, gap, pause, and stop controls, and changing radicals or adult filtering cancels playback.

## Matching and coverage

`public/radical-source/decompositions.json` is an editable, stripped character-to-IDS mapping derived from Make Me a Hanzi. Only character and decomposition fields were retained. No graphical stroke data, dictionary definitions or external-service calls are used. Attribution, original source hash, and applicable license texts are shipped alongside it and linked from the UI.

`lib/radicals.ts` parses each explicit IDS tree. Malformed trees and trees containing unknown components are rejected. It does not recursively look up further decompositions of leaf characters: e.g. 湖 matches 氵, but the matcher does not guess the components inside 胡. This deliberately sacrifices recall to keep matching conservative, as requested.

Left/right 阝 and top/bottom/enclosing named forms are distinguished structurally. Selected graphical aliases include 足/𧾷, 牛/牜, 月/⺼, and the bamboo and sheep variants. 口 and 囗 are not merged. Source decompositions may still contain errors; the UI states that coverage is partial and does not promise exhaustive or etymological analysis.

With the 9,199-word vocabulary on 2026-11-24, 2,286 distinct headword characters have at least one match across the 90 groups (before adult filtering); 三点水 matches 141. These counts change with the current vocabulary. An empty result means no indexed match, not proof that no such character exists.

## Build and deployment

`scripts/radical-data.ts` builds the catalog and matching lists. The existing content preparation step writes `public/radicals.json` alongside `content.json`; both are generated, ignored artifacts. `npm run dev`, `npm run build`, and `npm run content:prepare` include this step. No download is required during build or use. Retaining the full source character map allows new hosted vocabulary to match without precomputing an index limited to the current CSV.

Deploy the updated app to publish this feature. No Supabase SQL or schema change is needed. Existing vocabulary, priorities, progress, and the prior import SQL are unaffected.

## Validation

Unit coverage checks positional and graphical distinctions, unknown/malformed IDS rejection, all 90 CSV records, accent-insensitive search, vocabulary deduplication, and adult filtering. Browser tests cover radical selection, character expansion, audio, priority saving and persistence, adult filtering, searching, empty results, load-error recovery, and desktop/mobile viewport width. Existing tricky-word and other review modes are also checked.

import fs from "node:fs";
import Papa from "papaparse";
import { hasComponent, type RadicalCatalog } from "../lib/radicals";

export function loadRadicals(): RadicalCatalog {
  const parsed = Papa.parse<{
    chinese: string;
    pinyin: string;
    english: string;
  }>(fs.readFileSync("data/radical_names_90.csv", "utf8"), {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) throw new Error(JSON.stringify(parsed.errors));
  const decompositions: Record<string, string> = JSON.parse(
    fs.readFileSync("public/radical-source/decompositions.json", "utf8"),
  );
  const seen = new Set<string>();
  return {
    radicals: parsed.data.map((row) => {
      const symbol = row.english.match(/\(([^()]+)\)\s*$/)?.[1];
      if (
        !row.chinese ||
        !row.pinyin ||
        !symbol ||
        Array.from(symbol).length !== 1 ||
        seen.has(row.chinese)
      )
        throw new Error(`Invalid radical: ${JSON.stringify(row)}`);
      seen.add(row.chinese);
      return {
        id: row.chinese,
        name: row.chinese,
        pinyin: row.pinyin,
        english: row.english,
        symbol,
        characters: Object.entries(decompositions)
          .filter(([, ids]) => hasComponent(ids, row.chinese, symbol))
          .map(([character]) => character),
      };
    }),
  };
}

import type { Word } from "./study";

export type Radical = {
  id: string;
  name: string;
  pinyin: string;
  english: string;
  symbol: string;
  characters: string[];
};
export type RadicalCatalog = { radicals: Radical[] };
type Position = "left" | "right" | "top" | "bottom" | "enclosure";
type Node = { value: string; children: Node[] };
const arities: Record<string, number> = {
  "⿰": 2,
  "⿱": 2,
  "⿲": 3,
  "⿳": 3,
  "⿴": 2,
  "⿵": 2,
  "⿶": 2,
  "⿷": 2,
  "⿸": 2,
  "⿹": 2,
  "⿺": 2,
  "⿻": 2,
};
function parse(ids: string): Node | null {
  const chars = Array.from(ids);
  let index = 0;
  function read(): Node | null {
    const value = chars[index++];
    if (!value || value === "？" || value === "?") return null;
    const children: Node[] = [];
    for (let i = 0; i < (arities[value] || 0); i++) {
      const child = read();
      if (!child) return null;
      children.push(child);
    }
    return { value, children };
  }
  const root = read();
  return root && index === chars.length ? root : null;
}
const positions: Record<string, Position> = {
  左耳旁: "left",
  右耳旁: "right",
  足字旁: "left",
  牛字旁: "left",
  国字框: "enclosure",
  门字框: "enclosure",
  同字框: "enclosure",
  三框儿: "enclosure",
  秃宝盖: "top",
  户字头: "enclosure",
  尸字头: "enclosure",
  虎字头: "enclosure",
};
const variants: Record<string, string[]> = {
  月字旁: ["月", "⺼"],
  足字旁: ["𧾷", "足"],
  牛字旁: ["牜", "牛"],
  羊字旁: ["羊", "⺶", "⺷"],
  竹字头: ["⺮", "竹"],
};
function positionFor(
  operator: string,
  child: number,
  count: number,
): Position | undefined {
  if (operator === "⿰" || operator === "⿲")
    return child === 0 ? "left" : child === count - 1 ? "right" : undefined;
  if (operator === "⿱" || operator === "⿳")
    return child === 0 ? "top" : child === count - 1 ? "bottom" : undefined;
  if ("⿴⿵⿶⿷⿸⿹⿺".includes(operator) && child === 0) return "enclosure";
}
/** Only explicit IDS leaves, never recursively decomposed through other characters.
 * Reject partial/unknown trees rather than infer a component from an indexing radical. */
export function hasComponent(
  ids: string,
  name: string,
  symbol: string,
): boolean {
  const root = parse(ids);
  if (!root?.children.length) return false;
  const required =
    positions[name] ||
    (name.endsWith("头") ? "top" : name.endsWith("底") ? "bottom" : undefined);
  const accepted = variants[name] || [symbol];
  function visit(node: Node, position?: Position): boolean {
    if (!node.children.length)
      return (
        accepted.includes(node.value) && (!required || required === position)
      );
    return node.children.some((child, i) =>
      visit(child, positionFor(node.value, i, node.children.length)),
    );
  }
  return visit(root);
}
export function normalizeRadicalSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}
export function radicalMatchesSearch(radical: Radical, query: string) {
  return normalizeRadicalSearch(
    `${radical.name} ${radical.symbol} ${radical.pinyin} ${radical.english}`,
  ).includes(normalizeRadicalSearch(query));
}
export function characterWords(
  words: Word[],
  excludeAdult: boolean,
): Map<string, Word[]> {
  const result = new Map<string, Word[]>();
  const seenIds = new Set<string>();
  for (const word of words) {
    if (seenIds.has(word.id) || (excludeAdult && word.is_adult === "1"))
      continue;
    seenIds.add(word.id);
    for (const character of new Set(Array.from(word.chinese || ""))) {
      if (!/\p{Script=Han}/u.test(character)) continue;
      const group = result.get(character) || [];
      group.push(word);
      result.set(character, group);
    }
  }
  return result;
}

/** Choose one short vocabulary example per character, without reading sentences. */
export function radicalAudioExamples(
  characters: string[],
  groups: Map<string, Word[]>,
): { character: string; word: Word; text: string }[] {
  const result: { character: string; word: Word; text: string }[] = [];
  for (const character of new Set(characters)) {
    const candidates = (groups.get(character) || []).filter(
      (word) =>
        word.part_of_speech !== "sentence" &&
        /^\p{Script=Han}{2,4}$/u.test(word.chinese) &&
        word.chinese.includes(character),
    );
    const priority = (word: Word) => Number(word.priority) || 99;
    candidates.sort(
      (a, b) =>
        Number(a.part_of_speech === "proper_noun") -
          Number(b.part_of_speech === "proper_noun") ||
        Array.from(a.chinese).length - Array.from(b.chinese).length ||
        priority(a) - priority(b) ||
        a.id.localeCompare(b.id),
    );
    const word = candidates[0];
    if (word)
      result.push({ character, word, text: `${word.chinese}的${character}` });
  }
  return result;
}

import type { Word } from "./study";

export type PriorityChange = {
  id: string;
  word_id: string;
  chinese: string;
  original_priority: string;
  new_priority: number | null;
  updated_at: string;
};
export function mergePriorityChanges(...groups: PriorityChange[][]) {
  return [...new Map(groups.flat().map((row) => [row.id, row])).values()].sort(
    (a, b) =>
      Date.parse(a.updated_at) - Date.parse(b.updated_at) ||
      a.id.localeCompare(b.id),
  );
}
export function latestPriorities(rows: PriorityChange[]) {
  const latest = new Map<string, PriorityChange>();
  for (const row of mergePriorityChanges(rows)) latest.set(row.word_id, row);
  return latest;
}
export function applyPriorities(words: Word[], rows: PriorityChange[]): Word[] {
  const latest = latestPriorities(rows);
  return words.map((word) => {
    const change = latest.get(word.id);
    return change?.new_priority != null
      ? { ...word, priority: String(change.new_priority) }
      : word;
  });
}
export type PriorityExport = {
  id: string;
  chinese: string;
  original_priority: string;
  new_priority: number;
};
export function priorityCSV(rows: PriorityExport[]) {
  const cell = (s: unknown) => `"${String(s).replaceAll('"', '""')}"`;
  return (
    "id,chinese,original_priority,new_priority\r\n" +
    rows
      .map((r) =>
        [r.id, r.chinese, r.original_priority, r.new_priority]
          .map(cell)
          .join(","),
      )
      .join("\r\n") +
    "\r\n"
  );
}
export function prioritySQL(rows: PriorityExport[]) {
  if (!rows.length) return "-- No priority changes selected.\n";
  const quote = (s: string) => "'" + s.replaceAll("'", "''") + "'";
  return `-- Update the repository CSV too, or a later content import may overwrite these changes.
-- Matches the original priority to avoid overwriting independently edited content.
begin;
with changes(id, chinese, old_priority, new_priority) as (
  values
${rows.map((r) => `    (${["word:" + r.id, r.chinese, r.original_priority, String(r.new_priority)].map(quote).join(", ")})`).join(",\n")}
)
update public.study_content as content
set payload = jsonb_set(content.payload, '{priority}', to_jsonb(changes.new_priority)),
    updated_at = now()
from changes
where content.id = changes.id
  and content.kind = 'word'
  and content.payload->>'chinese' = changes.chinese
  and coalesce(content.payload->>'priority', '') = changes.old_priority
returning content.id, content.payload->>'priority' as priority;
commit;
`;
}

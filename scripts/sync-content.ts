import { createClient } from "@supabase/supabase-js";
import { loadContent } from "./prepare-content";
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.",
    );
  const content = loadContent();
  const db = createClient(url, key, { auth: { persistSession: false } });
  const items = [
    ...content.words.map((payload) => ({
      id: `word:${payload.id}`,
      kind: "word",
      payload,
    })),
    ...content.characters.map((payload) => ({
      id: `char:${payload.idx}`,
      kind: "character",
      payload,
    })),
    ...content.rules.map((payload) => ({
      id: payload.id,
      kind: "rule",
      payload,
    })),
  ];
  const { error } = await db.rpc("replace_study_content", { items });
  if (error) throw error;
  console.log(
    `Synced ${items.length} content records. Removed records are inactive; progress is preserved.`,
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});

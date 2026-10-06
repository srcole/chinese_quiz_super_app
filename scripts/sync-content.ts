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
  const db = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: async (input, init) => {
        try {
          return await fetch(input, { ...init, signal: AbortSignal.timeout(90000) });
        } catch (error) {
          // Print only error codes, never request headers or credentials.
          const codes = new Set<string>();
          function collect(value: unknown) {
            if (!value || typeof value !== "object") return;
            const e = value as { code?: string; cause?: unknown; errors?: unknown[] };
            if (e.code) codes.add(e.code);
            if (e.cause) collect(e.cause);
            e.errors?.forEach(collect);
          }
          collect(error);
          console.error(
            `Network request failed${codes.size ? ` (${[...codes].join(", ")})` : ""}. ` +
              "If this happened during import, its outcome is unknown; the server may still have committed it.",
          );
          throw error;
        }
      },
    },
  });
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
  console.log("Checking Supabase connection...");
  const { error: connectionError } = await db
    .from("study_content")
    .select("id")
    .limit(1);
  if (connectionError)
    throw new Error(`Connection check failed before import: ${connectionError.message}`);
  console.log(
    `Importing ${items.length} records (${(Buffer.byteLength(JSON.stringify({ items })) / 1024 / 1024).toFixed(1)} MB)...`,
  );
  const started = Date.now();
  const { error } = await db.rpc("replace_study_content", { items });
  console.log(`Import request finished after ${((Date.now() - started) / 1000).toFixed(1)} seconds.`);
  if (error) {
    if (error.code === "57014") {
      throw new Error(
        "Supabase canceled the import before it completed; this transaction was rolled back. " +
          "Run both supabase/migrations/20261006_optimize_content_import.sql and supabase/migrations/20261006_import_timeout.sql in the Supabase SQL Editor, " +
          "then retry npm run content:sync. If both migrations are already applied, do not keep retrying: check database locks, load, and the import query plan.",
      );
    }
    throw error;
  }
  console.log(
    `Synced ${items.length} content records. Removed records are inactive; progress is preserved.`,
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});

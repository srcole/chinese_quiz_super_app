import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const adminKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicKey || !adminKey)
    throw new Error("Missing Supabase configuration.");
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(url, adminKey, options);
  const guest = createClient(url, publicKey, options);
  for (const kind of ["word", "character", "rule"]) {
    const { count, error } = await admin
      .from("study_content")
      .select("id", { count: "exact", head: true })
      .eq("kind", kind)
      .eq("active", true);
    if (error) throw new Error(`Content check failed: ${error.message}`);
    console.log(`Active ${kind} records: ${count}`);
  }
  for (const table of ["study_content", "attempts"]) {
    const { data, error } = await guest.from(table).select("id").limit(1);
    if (error && error.code !== "42501")
      throw new Error(`Guest access check failed: ${error.message}`);
    if (data?.length)
      throw new Error(`Unexpected unauthenticated read access to ${table}.`);
    console.log(`Unauthenticated ${table} reads: blocked or empty`);
  }
  // Empty imports are also rejected by the function itself, so this permission
  // probe cannot modify content even if its execution grant is misconfigured.
  const { error } = await guest.rpc("replace_study_content", { items: [] });
  if (!error || error.code !== "42501")
    throw new Error(
      `Import permission check failed: ${error?.message || "Unexpected access"}`,
    );
  console.log("Unauthenticated content imports: denied");
  const { error: attemptsError } = await admin
    .from("attempts")
    .select("id", { head: true })
    .limit(1);
  if (attemptsError)
    throw new Error(`Attempt table unavailable: ${attemptsError.message}`);
  console.log("Attempt table: available");
  console.log(
    "Connection checks passed. Signed-in cross-device sync still requires an account sign-in.",
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { mergeSentences, WrittenSentence } from "./sentences";

const storageKey = (id?: string) =>
  `zili-written-sentences-v1:${id || "guest"}`;
export function useSentences(userId?: string) {
  const [rows, setRows] = useState<WrittenSentence[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const current = useRef<WrittenSentence[]>([]);
  const identity = useRef(userId);
  const generation = useRef(0);
  const busy = useRef<number | null>(null);
  const loaded = useRef(false);

  const persist = useCallback((records: WrittenSentence[]) => {
    try {
      localStorage.setItem(
        storageKey(identity.current),
        JSON.stringify(records),
      );
      current.current = records;
      setRows(records);
      return true;
    } catch {
      setStatus(
        "Could not save to device storage. Export your sentences and free up space before retrying.",
      );
      return false;
    }
  }, []);

  const sync = useCallback(async () => {
    const uid = identity.current;
    const token = generation.current;
    if (!loaded.current || !supabase || !uid || busy.current === token) return;
    busy.current = token;
    try {
      let remote: WrittenSentence[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase
          .from("written_sentences")
          .select(
            "id,word_id,chinese,pinyin,english,priority,sentence,created_at,feedback_copied_at,updated_at",
          )
          .eq("user_id", uid)
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        if (generation.current !== token) return;
        remote.push(...data);
        if (data.length < 1000) break;
      }
      const known = new Map(remote.map((row) => [row.id, row]));
      const merged = mergeSentences(remote, current.current);
      const pending = merged.filter(
        (row) =>
          !known.has(row.id) ||
          Date.parse(row.updated_at || row.created_at) >
            Date.parse(
              known.get(row.id)!.updated_at || known.get(row.id)!.created_at,
            ),
      );
      for (let offset = 0; offset < pending.length; offset += 200) {
        if (generation.current !== token) return;
        const { error } = await supabase.from("written_sentences").upsert(
          pending
            .slice(offset, offset + 200)
            .map((row) => ({
              ...row,
              user_id: uid,
              feedback_copied_at: row.feedback_copied_at ?? null,
              updated_at: row.updated_at || row.created_at,
            })),
          { onConflict: "id" },
        );
        if (error) throw error;
      }
      if (
        generation.current === token &&
        persist(mergeSentences(merged, current.current))
      ) {
        const uploaded = new Set([
          ...known.keys(),
          ...pending.map((row) => row.id),
        ]);
        setStatus(
          current.current.every((row) => uploaded.has(row.id))
            ? "Sentences synced across devices"
            : "Sentences saved on this device · Waiting to sync",
        );
      }
    } catch (error) {
      if (generation.current === token)
        setStatus(
          `Saved on this device · Sentence sync failed: ${error instanceof Error ? error.message : (error as { message?: string }).message || "Check your connection"}`,
        );
    } finally {
      if (busy.current === token) busy.current = null;
    }
  }, [persist]);

  useEffect(() => {
    identity.current = userId;
    generation.current++;
    setReady(false);
    loaded.current = false;
    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey(userId)) || "[]",
      );
      if (!Array.isArray(saved)) throw new Error("Invalid saved sentences");
      current.current = saved;
      setRows(saved);
      setStatus("Sentences saved on this device");
      loaded.current = true;
      setReady(true);
      void sync();
    } catch {
      current.current = [];
      setRows([]);
      setStatus("Could not read saved sentences. Reload before writing more.");
    }
    const onSync = () => void sync();
    window.addEventListener("online", onSync);
    window.addEventListener("focus", onSync);
    const timer = setInterval(onSync, 30000);
    return () => {
      generation.current++;
      clearInterval(timer);
      window.removeEventListener("online", onSync);
      window.removeEventListener("focus", onSync);
    };
  }, [userId, sync]);

  function save(row: WrittenSentence) {
    if (!ready || identity.current !== userId || !row.sentence.trim())
      return false;
    if (!persist(mergeSentences(current.current, [row]))) return false;
    setStatus("Sentence saved on this device");
    void sync();
    return true;
  }
  function markCopied(ids: string[], copied = true) {
    if (!ready || identity.current !== userId) return false;
    const selected = new Set(ids);
    const now = new Date().toISOString();
    const updated = current.current.map((row) =>
      selected.has(row.id)
        ? {
            ...row,
            feedback_copied_at: copied ? now : null,
            updated_at: new Date(
              Math.max(
                Date.now(),
                Date.parse(row.updated_at || row.created_at) + 1,
              ),
            ).toISOString(),
          }
        : row,
    );
    if (!persist(updated)) return false;
    void sync();
    return true;
  }
  return { rows, ready, status, save, markCopied };
}

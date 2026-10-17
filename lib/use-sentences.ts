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
            "id,word_id,chinese,pinyin,english,priority,sentence,created_at",
          )
          .eq("user_id", uid)
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        if (generation.current !== token) return;
        remote.push(...data);
        if (data.length < 1000) break;
      }
      const known = new Set(remote.map((row) => row.id));
      const pending = current.current.filter((row) => !known.has(row.id));
      for (let offset = 0; offset < pending.length; offset += 200) {
        if (generation.current !== token) return;
        const { error } = await supabase.from("written_sentences").upsert(
          pending
            .slice(offset, offset + 200)
            .map((row) => ({ ...row, user_id: uid })),
          { onConflict: "id", ignoreDuplicates: true },
        );
        if (error) throw error;
      }
      if (
        generation.current === token &&
        persist(mergeSentences(remote, current.current))
      ) {
        const uploaded = new Set([...known, ...pending.map((row) => row.id)]);
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
  return { rows, ready, status, save };
}

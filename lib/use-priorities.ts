"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { mergePriorityChanges, type PriorityChange } from "./priorities";
import type { Word } from "./study";

export function usePriorities(userId?: string) {
  const [rows, setRows] = useState<PriorityChange[]>([]);
  const [owner, setOwner] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const state = useRef({
    uid: userId,
    generation: 0,
    loaded: false,
    rows: [] as PriorityChange[],
  });
  const busy = useRef<number | null>(null);
  const persist = useCallback((records: PriorityChange[]) => {
    try {
      localStorage.setItem(
        `zili-priorities-v1:${state.current.uid || "guest"}`,
        JSON.stringify(records),
      );
      state.current.rows = records;
      setRows(records);
      return true;
    } catch {
      setStatus(
        "Could not save priority changes on this device. Please free up storage and retry.",
      );
      return false;
    }
  }, []);
  const sync = useCallback(async () => {
    const { uid, generation, loaded } = state.current;
    if (!uid || !supabase || !loaded || busy.current === generation) return;
    busy.current = generation;
    try {
      const remote: PriorityChange[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase
          .from("priority_changes")
          .select(
            "id,word_id,chinese,original_priority,new_priority,updated_at",
          )
          .eq("user_id", uid)
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        if (state.current.generation !== generation) return;
        remote.push(...data);
        if (data.length < 1000) break;
      }
      const known = new Set(remote.map((r) => r.id));
      const pending = state.current.rows.filter((r) => !known.has(r.id));
      for (let i = 0; i < pending.length; i += 200) {
        if (state.current.generation !== generation) return;
        const { error } = await supabase.from("priority_changes").upsert(
          pending.slice(i, i + 200).map((r) => ({ ...r, user_id: uid })),
          { onConflict: "id", ignoreDuplicates: true },
        );
        if (error) throw error;
      }
      if (state.current.generation !== generation) return;
      if (persist(mergePriorityChanges(remote, state.current.rows))) {
        pending.forEach((r) => known.add(r.id));
        setStatus(
          state.current.rows.every((r) => known.has(r.id))
            ? "Priority changes synced across devices"
            : "Saved on this device · Waiting to sync",
        );
      }
    } catch (error) {
      if (state.current.generation === generation)
        setStatus(
          `Saved on this device · Priority sync failed: ${(error as { message?: string }).message || "Check your connection"}`,
        );
    } finally {
      if (busy.current === generation) busy.current = null;
    }
  }, [persist]);
  useEffect(() => {
    state.current = {
      uid: userId,
      generation: state.current.generation + 1,
      loaded: false,
      rows: [],
    };
    setOwner(userId);
    setRows([]);
    setReady(false);
    try {
      const saved = JSON.parse(
        localStorage.getItem(`zili-priorities-v1:${userId || "guest"}`) || "[]",
      );
      if (
        !Array.isArray(saved) ||
        saved.some(
          (r) =>
            !r ||
            typeof r.id !== "string" ||
            typeof r.word_id !== "string" ||
            typeof r.chinese !== "string" ||
            typeof r.original_priority !== "string" ||
            !Number.isFinite(Date.parse(r.updated_at)) ||
            (r.new_priority !== null &&
              (!Number.isInteger(r.new_priority) ||
                r.new_priority < 1 ||
                r.new_priority > 10)),
        )
      )
        throw new Error();
      state.current.rows = saved;
      state.current.loaded = true;
      setRows(saved);
      setReady(true);
      setStatus(
        userId
          ? "Priority changes saved on this device"
          : "Priority changes saved on this device · Guest mode",
      );
      void sync();
    } catch {
      setStatus(
        "Could not read saved priority changes. Reload before making changes.",
      );
    }
    const onSync = () => void sync();
    window.addEventListener("focus", onSync);
    window.addEventListener("online", onSync);
    const timer = setInterval(onSync, 30000);
    return () => {
      state.current.generation++;
      state.current.loaded = false;
      clearInterval(timer);
      window.removeEventListener("focus", onSync);
      window.removeEventListener("online", onSync);
    };
  }, [userId, sync]);
  function save(word: Word, priority: number | null) {
    if (
      !state.current.loaded ||
      state.current.uid !== userId ||
      (priority !== null &&
        (!Number.isInteger(priority) || priority < 1 || priority > 10))
    )
      return false;
    const lastTime = Math.max(
      0,
      ...state.current.rows.map((r) => Date.parse(r.updated_at)),
    );
    const row: PriorityChange = {
      id: crypto.randomUUID(),
      word_id: word.id,
      chinese: word.chinese,
      original_priority: word.priority || "",
      new_priority: priority,
      updated_at: new Date(Math.max(Date.now(), lastTime + 1)).toISOString(),
    };
    if (!persist(mergePriorityChanges(state.current.rows, [row]))) return false;
    setStatus("Priority saved on this device · Applies to future quizzes");
    void sync();
    return true;
  }
  return {
    rows: owner === userId ? rows : [],
    ready: ready && owner === userId,
    status,
    save,
    sync,
  };
}

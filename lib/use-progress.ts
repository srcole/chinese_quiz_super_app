"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { Attempt, mergeAttempts } from "./study";
const key = (id?: string) => `zili-attempts-v1:${id || "guest"}`;
export function useProgress() {
  const [user, setUser] = useState<User | null>(null),
    [attempts, setAttempts] = useState<Attempt[]>([]),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState("Saved on this device");
  const current = useRef<Attempt[]>([]),
    identity = useRef<string | undefined>(undefined),
    busy = useRef(false),
    dirty = useRef(false);
  const persist = useCallback((rows: Attempt[]) => {
    current.current = rows;
    setAttempts(rows);
    try {
      localStorage.setItem(key(identity.current), JSON.stringify(rows));
      return true;
    } catch {
      setStatus("Device storage is full or unavailable. Export your progress.");
      return false;
    }
  }, []);
  const sync = useCallback(async () => {
    if (!supabase || !identity.current || busy.current) return;
    busy.current = true;
    const uid = identity.current;
    setStatus("Syncing…");
    try {
      let remote: Attempt[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase
          .from("attempts")
          .select("*")
          .eq("user_id", uid)
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        remote.push(...(data || []));
        if ((data || []).length < 1000) break;
      }
      if (identity.current !== uid) return;
      const merged = mergeAttempts(current.current, remote);
      const remoteMap = new Map(remote.map((a) => [a.id, a]));
      const pending = merged.filter(
        (a) =>
          !remoteMap.has(a.id) ||
          Date.parse(a.updated_at) >
            Date.parse(remoteMap.get(a.id)!.updated_at),
      );
      for (let i = 0; i < pending.length; i += 200) {
        const { error } = await supabase.from("attempts").upsert(
          pending.slice(i, i + 200).map((a) => ({ ...a, user_id: uid })),
          { onConflict: "id" },
        );
        if (error) throw error;
      }
      if (identity.current === uid) {
        const saved = persist(mergeAttempts(current.current, merged));
        if (saved) setStatus("Synced across devices");
      }
    } catch (e) {
      if (identity.current === uid)
        setStatus(
          `Saved locally · Sync failed: ${e instanceof Error ? e.message : (e as { message?: string }).message || "Check your connection"}`,
        );
    } finally {
      busy.current = false;
    }
  }, [persist]);
  useEffect(() => {
    let alive = true;
    function activate(u: User | null) {
      if (!alive) return;
      identity.current = u?.id;
      setUser(u);
      try {
        const data = JSON.parse(localStorage.getItem(key(u?.id)) || "[]");
        current.current = data;
        setAttempts(data);
        setStatus(u ? "Ready to sync" : "Saved on this device");
      } catch {
        current.current = [];
        setAttempts([]);
        setStatus("Could not read saved progress");
      }
      setReady(true);
      if (u) void sync();
    }
    if (supabase) {
      void supabase.auth
        .getSession()
        .then(({ data }) => activate(data.session?.user || null));
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (identity.current !== session?.user?.id || !current.current.length)
          setTimeout(() => activate(session?.user || null), 0);
      });
      return () => {
        alive = false;
        data.subscription.unsubscribe();
      };
    }
    activate(null);
    return () => {
      alive = false;
    };
  }, [sync]);
  useEffect(() => {
    const onSync = () => void sync();
    window.addEventListener("online", onSync);
    window.addEventListener("focus", onSync);
    const t = setInterval(onSync, 30000);
    return () => {
      clearInterval(t);
      window.removeEventListener("online", onSync);
      window.removeEventListener("focus", onSync);
    };
  }, [sync]);
  useEffect(() => {
    if (!ready || !dirty.current) return;
    dirty.current = false;
    const t = setTimeout(() => void sync(), 600);
    return () => clearTimeout(t);
  }, [attempts, ready, sync]);
  function record(a: Attempt) {
    dirty.current = true;
    persist(mergeAttempts(current.current, [a]));
  }
  function override(id: string) {
    const a = current.current.find((x) => x.id === id);
    if (a)
      record({
        ...a,
        correct: true,
        overridden: true,
        updated_at: new Date().toISOString(),
      });
  }
  function importGuest() {
    try {
      const guest: Attempt[] = JSON.parse(localStorage.getItem(key()) || "[]");
      dirty.current = true;
      persist(mergeAttempts(current.current, guest));
    } catch {
      setStatus("Could not import device progress");
    }
  }
  return { user, attempts, ready, status, record, override, sync, importGuest };
}

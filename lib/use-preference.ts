"use client";
import { useEffect, useState } from "react";
export function usePreference<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === typeof initial) setValue(parsed);
      }
    } catch {}
    setLoaded(true);
  }, [key, initial]);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
  }, [key, value, loaded]);
  return [value, setValue] as const;
}

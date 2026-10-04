"use client";
import { useEffect, useRef, useState } from "react";
import { usePreference } from "./use-preference";
export type AudioItem = { text: string; row: number };
export function useAudio() {
  const [supported, setSupported] = useState(false),
    [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [voice, setVoice] = usePreference("zili-voice", ""),
    [rate, setRate] = usePreference("zili-rate", 0.85),
    [gap, setGap] = usePreference("zili-gap", 0.6),
    [playing, setPlaying] = useState(false),
    [paused, setPaused] = useState(false),
    [row, setRow] = useState(-1),
    [error, setError] = useState("");
  const generation = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    pauseRef = useRef(false),
    continuation = useRef<(() => void) | null>(null),
    utterance = useRef<SpeechSynthesisUtterance | null>(null);
  function stop() {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    continuation.current = null;
    pauseRef.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
    utterance.current = null;
    setPlaying(false);
    setPaused(false);
    setRow(-1);
    setError("");
  }
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setSupported(true);
    const update = () =>
      setVoices(
        window.speechSynthesis
          .getVoices()
          .filter((v) => /^zh|^cmn/i.test(v.lang)),
      );
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      generation.current++;
      if (timer.current) clearTimeout(timer.current);
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", update);
    };
  }, []);
  function play(items: AudioItem[]) {
    stop();
    setError("");
    if (!supported) {
      setError("Speech is unavailable in this browser.");
      return;
    }
    const available = window.speechSynthesis
      .getVoices()
      .filter((v) => /^zh|^cmn/i.test(v.lang));
    const chosen =
      available.find((v) => v.voiceURI === voice) ||
      available.find((v) => /CN|Hans/i.test(v.lang)) ||
      available[0];
    if (!chosen) {
      setError(
        "No Chinese voice is available. Enable a Mandarin text-to-speech voice in your device settings, then reload.",
      );
      return;
    }
    const queue = items.filter((x) => x.text.trim());
    if (!queue.length) return;
    const token = generation.current;
    setPlaying(true);
    function next(index: number) {
      if (generation.current !== token) return;
      if (pauseRef.current) {
        continuation.current = () => next(index);
        return;
      }
      if (index >= queue.length) {
        setPlaying(false);
        setRow(-1);
        return;
      }
      const item = queue[index];
      setRow(item.row);
      const u = new SpeechSynthesisUtterance(item.text);
      utterance.current = u;
      u.lang = chosen.lang;
      u.voice = chosen;
      u.rate = rate;
      u.onend = () => {
        if (generation.current === token)
          timer.current = setTimeout(() => next(index + 1), gap * 1000);
      };
      u.onerror = (e) => {
        if (generation.current !== token) return;
        stop();
        setError(`Audio stopped (${e.error}). Tap play to retry.`);
      };
      try {
        window.speechSynthesis.speak(u);
      } catch {
        stop();
        setError("Audio could not start. Tap play to retry.");
      }
    }
    next(0);
  }
  function togglePause() {
    if (!playing) return;
    if (pauseRef.current) {
      pauseRef.current = false;
      setPaused(false);
      window.speechSynthesis.resume();
      const resume = continuation.current;
      continuation.current = null;
      resume?.();
    } else {
      pauseRef.current = true;
      setPaused(true);
      window.speechSynthesis.pause();
    }
  }
  return {
    supported,
    voices,
    voice,
    setVoice,
    rate,
    setRate,
    gap,
    setGap,
    playing,
    paused,
    row,
    error,
    play,
    stop,
    togglePause,
  };
}

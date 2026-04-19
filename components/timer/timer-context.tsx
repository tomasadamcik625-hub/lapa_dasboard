"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type TimerState = "stopped" | "running" | "paused";

interface TimerCtx {
  elapsed: number;
  timerState: TimerState;
  showSaveModal: boolean;
  setShowSaveModal: (v: boolean) => void;
  formatTime: (s: number) => string;
  handleStart: () => void;
  handlePause: () => void;
  handleStop: () => void;
  resetElapsed: () => void;
}

const TimerContext = createContext<TimerCtx | null>(null);

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
};

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [elapsed, setElapsed] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const state = localStorage.getItem("timerState") as TimerState | null;
    const startEpoch = Number(localStorage.getItem("timerStartEpoch") || "0");

    if (state === "running" && startEpoch) {
      const recovered = Math.floor((Date.now() - startEpoch) / 1000);
      setElapsed(recovered);
      setTimerState("running");
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startEpoch) / 1000));
      }, 1000);
    } else if (state === "paused") {
      const saved = Number(localStorage.getItem("timerElapsed") || "0");
      setElapsed(saved);
      setTimerState("paused");
    }
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleStart = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const startEpoch = Date.now() - elapsed * 1000;
    localStorage.setItem("timerState", "running");
    localStorage.setItem("timerStartEpoch", String(startEpoch));
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startEpoch) / 1000));
    }, 1000);
  }, [elapsed]);

  const handlePause = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.setItem("timerState", "paused");
    localStorage.setItem("timerElapsed", String(elapsed));
    setTimerState("paused");
  }, [elapsed]);

  const handleStop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.setItem("timerState", "stopped");
    localStorage.removeItem("timerStartEpoch");
    localStorage.removeItem("timerElapsed");
    setTimerState("stopped");
    setShowSaveModal(true);
  }, []);

  const resetElapsed = useCallback(() => {
    setElapsed(0);
    localStorage.removeItem("timerElapsed");
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <TimerContext.Provider value={{ elapsed, timerState, showSaveModal, setShowSaveModal, formatTime, handleStart, handlePause, handleStop, resetElapsed }}>
      {children}
    </TimerContext.Provider>
  );
};

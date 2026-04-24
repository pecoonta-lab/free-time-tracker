"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ActiveTimer, Person } from "@/lib/types";

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function toTimeStr(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

interface TimerCardProps {
  person: Person;
  activeTimer: ActiveTimer | undefined;
  onError: (msg: string) => void;
  onRefresh: () => Promise<void>;
}

function TimerCard({ person, activeTimer, onError, onRefresh }: TimerCardProps) {
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const isRunning = !!activeTimer;
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const elapsed = isRunning
    ? now - new Date(activeTimer.started_at).getTime()
    : 0;

  const handleToggle = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setLoading(true);

    try {
      if (isRunning) {
        const startedAt = new Date(activeTimer.started_at);
        const endedAt = new Date();
        const elapsedMs = endedAt.getTime() - startedAt.getTime();
        const minutes = Math.round(elapsedMs / 60000);

        const deleteRes = await fetch(`/api/timers/${activeTimer.id}`, {
          method: "DELETE",
        });
        if (!deleteRes.ok) {
          onError("タイマーの停止に失敗しました");
          return;
        }

        if (minutes > 0) {
          const insertRes = await fetch("/api/records", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              person,
              duration_minutes: minutes,
              date: `${endedAt.getFullYear()}-${String(endedAt.getMonth() + 1).padStart(2, "0")}-${String(endedAt.getDate()).padStart(2, "0")}`,
              start_time: toTimeStr(startedAt),
              end_time: toTimeStr(endedAt),
              source: "timer",
            }),
          });
          if (!insertRes.ok) {
            onError("記録の保存に失敗しました");
          }
        }
      } else {
        const res = await fetch("/api/timers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ person, started_at: new Date().toISOString() }),
        });
        if (!res.ok) {
          onError("タイマーの開始に失敗しました");
        }
      }

      await onRefresh();
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  }, [isRunning, activeTimer, person, onError, onRefresh]);

  const startTime = isRunning
    ? new Date(activeTimer.started_at).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex-1 text-center">
      <p className="text-lg font-bold mb-2">{person}</p>
      {startTime && (
        <p className="text-xs text-muted mb-1">{startTime} から</p>
      )}
      <p className="font-mono text-2xl mb-3 tabular-nums">
        {formatElapsed(elapsed)}
      </p>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-white font-bold text-base transition-colors cursor-pointer disabled:opacity-50 ${
          isRunning
            ? "bg-danger hover:bg-danger-hover"
            : "bg-primary hover:bg-primary-hover"
        }`}
      >
        {loading ? "処理中..." : isRunning ? "停止" : "開始"}
      </button>
    </div>
  );
}

interface TimerSectionProps {
  activeTimers: ActiveTimer[];
  onRefresh: () => Promise<void>;
}

export default function TimerSection({ activeTimers, onRefresh }: TimerSectionProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(id);
  }, [error]);

  const husbandTimer = activeTimers.find((t) => t.person === "夫");
  const wifeTimer = activeTimers.find((t) => t.person === "妻");

  return (
    <div className="border border-border rounded-xl p-4">
      <h2 className="text-sm font-bold text-muted mb-3">タイマー</h2>
      <div className="flex gap-4">
        <TimerCard
          person="夫"
          activeTimer={husbandTimer}
          onError={setError}
          onRefresh={onRefresh}
        />
        <TimerCard
          person="妻"
          activeTimer={wifeTimer}
          onError={setError}
          onRefresh={onRefresh}
        />
      </div>
      {error && (
        <p className="mt-3 text-sm text-danger text-center">{error}</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { TimeRecord, ActiveTimer } from "@/lib/types";
import DiffSummary from "@/components/DiffSummary";
import TimerSection from "@/components/TimerSection";
import ManualEntry from "@/components/ManualEntry";
import TotalDisplay from "@/components/TotalDisplay";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/records");
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data as TimeRecord[]);
    } catch {
    }
  }, []);

  const fetchTimers = useCallback(async () => {
    try {
      const res = await fetch("/api/timers");
      if (!res.ok) return;
      const data = await res.json();
      setActiveTimers(data as ActiveTimer[]);
    } catch {
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchRecords(), fetchTimers()]);
  }, [fetchRecords, fetchTimers]);

  useEffect(() => {
    refresh().then(() => setLoading(false));
  }, [refresh]);

  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          refresh();
        }
      }, 5000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        refresh();
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  const husbandTotal = records
    .filter((r) => r.person === "夫")
    .reduce((sum, r) => sum + r.duration_minutes, 0);
  const wifeTotal = records
    .filter((r) => r.person === "妻")
    .reduce((sum, r) => sum + r.duration_minutes, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto w-full px-4 pb-8">
      <DiffSummary
        husbandTotal={husbandTotal}
        wifeTotal={wifeTotal}
        activeTimers={activeTimers}
      />
      <div className="space-y-4">
        <TimerSection activeTimers={activeTimers} onRefresh={refresh} />
        <ManualEntry onRefresh={refresh} />
        <TotalDisplay husbandTotal={husbandTotal} wifeTotal={wifeTotal} />
        <HistoryList records={records} onRefresh={refresh} />
      </div>
    </main>
  );
}

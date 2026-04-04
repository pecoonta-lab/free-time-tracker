"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
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

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from("time_records")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) setRecords(data as TimeRecord[]);
  }, []);

  const fetchTimers = useCallback(async () => {
    const { data } = await supabase.from("active_timers").select("*");
    if (data) setActiveTimers(data as ActiveTimer[]);
  }, []);

  // 初回ロード
  useEffect(() => {
    Promise.all([fetchRecords(), fetchTimers()]).then(() => setLoading(false));
  }, [fetchRecords, fetchTimers]);

  // Realtime subscriptions
  useEffect(() => {
    const recordsSub = supabase
      .channel("time_records_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_records" },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    const timersSub = supabase
      .channel("active_timers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_timers" },
        () => {
          fetchTimers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(recordsSub);
      supabase.removeChannel(timersSub);
    };
  }, [fetchRecords, fetchTimers]);

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
        <TimerSection activeTimers={activeTimers} />
        <ManualEntry />
        <TotalDisplay husbandTotal={husbandTotal} wifeTotal={wifeTotal} />
        <HistoryList records={records} />
      </div>
    </main>
  );
}

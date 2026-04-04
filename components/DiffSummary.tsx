"use client";

import { useEffect, useState } from "react";
import type { ActiveTimer } from "@/lib/types";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

interface DiffSummaryProps {
  husbandTotal: number;
  wifeTotal: number;
  activeTimers: ActiveTimer[];
}

export default function DiffSummary({
  husbandTotal,
  wifeTotal,
  activeTimers,
}: DiffSummaryProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (activeTimers.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [activeTimers.length]);

  let husbandActive = 0;
  let wifeActive = 0;
  for (const timer of activeTimers) {
    const elapsed = Math.round(
      (now - new Date(timer.started_at).getTime()) / 60000
    );
    if (timer.person === "夫") husbandActive = elapsed;
    else wifeActive = elapsed;
  }

  const diff = husbandTotal + husbandActive - (wifeTotal + wifeActive);
  const absDiff = Math.abs(diff);

  let label: string;
  let color: string;
  if (diff > 0) {
    label = `夫が ${formatDuration(absDiff)} 多い`;
    color = "text-blue-600";
  } else if (diff < 0) {
    label = `妻が ${formatDuration(absDiff)} 多い`;
    color = "text-pink-600";
  } else {
    label = "差分なし";
    color = "text-foreground";
  }

  return (
    <div className="text-center py-6">
      <p className="text-sm text-muted mb-1">自由時間の差分</p>
      <p className={`text-3xl font-bold ${color}`}>{label}</p>
    </div>
  );
}

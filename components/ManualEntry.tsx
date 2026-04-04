"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Person } from "@/lib/types";

function nowTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function ManualEntry() {
  const [person, setPerson] = useState<Person>("夫");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState(nowTimeStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calcMinutes = (): number => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calcMinutes();
    if (total <= 0) {
      setError("終了時刻は開始時刻より後にしてください");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: insertError } = await supabase.from("time_records").insert({
      person,
      duration_minutes: total,
      date,
      source: "manual",
    });

    setLoading(false);
    if (insertError) {
      setError("保存に失敗しました");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const diffMinutes = calcMinutes();
  const diffLabel =
    diffMinutes > 0
      ? `${Math.floor(diffMinutes / 60)}時間${diffMinutes % 60}分`
      : null;

  return (
    <div className="border border-border rounded-xl p-4">
      <h2 className="text-sm font-bold text-muted mb-3">手入力</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 対象者トグル */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {(["夫", "妻"] as Person[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPerson(p)}
              className={`flex-1 py-2 text-sm font-bold transition-colors cursor-pointer ${
                person === p
                  ? "bg-primary text-white"
                  : "bg-white text-foreground hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 日付 */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />

        {/* 開始時刻・終了時刻 */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted block mb-1">開始</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <span className="mt-5 text-muted">→</span>
          <div className="flex-1">
            <label className="text-xs text-muted block mb-1">終了</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* 自動計算結果 */}
        {diffLabel && (
          <p className="text-sm text-center text-muted">= {diffLabel}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "保存中..." : "追加"}
        </button>

        {error && <p className="text-sm text-danger text-center">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 text-center">保存しました</p>
        )}
      </form>
    </div>
  );
}

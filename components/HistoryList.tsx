"use client";

import { useState } from "react";
import type { TimeRecord } from "@/lib/types";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(time: string | null): string {
  if (!time) return "--:--";
  return time.slice(0, 5);
}

function calcMinutesFromTimes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

interface HistoryListProps {
  records: TimeRecord[];
  onRefresh: () => Promise<void>;
}

interface EditingState {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function HistoryList({ records, onRefresh }: HistoryListProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const startEdit = (record: TimeRecord) => {
    setEditing({
      id: record.id,
      date: record.date,
      startTime: record.start_time ? record.start_time.slice(0, 5) : "09:00",
      endTime: record.end_time ? record.end_time.slice(0, 5) : "10:00",
    });
    setError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const total = calcMinutesFromTimes(editing.startTime, editing.endTime);
    if (total <= 0) {
      setError("終了時刻は開始時刻より後にしてください");
      return;
    }
    try {
      const res = await fetch(`/api/records/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_minutes: total,
          date: editing.date,
          start_time: editing.startTime,
          end_time: editing.endTime,
        }),
      });
      if (!res.ok) {
        setError("更新に失敗しました");
      } else {
        setEditing(null);
        setError(null);
        await onRefresh();
      }
    } catch {
      setError("更新に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("削除に失敗しました");
      } else {
        await onRefresh();
      }
    } catch {
      setError("削除に失敗しました");
    }
    setDeleting(null);
  };

  return (
    <div className="border border-border rounded-xl p-4">
      <h2 className="text-sm font-bold text-muted mb-3">履歴</h2>
      {records.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">記録がありません</p>
      ) : (
        <ul className="space-y-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="border border-border rounded-lg p-3"
            >
              {editing?.id === record.id ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={editing.date}
                    onChange={(e) =>
                      setEditing({ ...editing, date: e.target.value })
                    }
                    className="w-full border border-border rounded px-2 py-1 text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-muted block mb-1">開始</label>
                      <input
                        type="time"
                        value={editing.startTime}
                        onChange={(e) =>
                          setEditing({ ...editing, startTime: e.target.value })
                        }
                        className="w-full border border-border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <span className="mt-5 text-muted">→</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted block mb-1">終了</label>
                      <input
                        type="time"
                        value={editing.endTime}
                        onChange={(e) =>
                          setEditing({ ...editing, endTime: e.target.value })
                        }
                        className="w-full border border-border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  {editing.startTime && editing.endTime && calcMinutesFromTimes(editing.startTime, editing.endTime) > 0 && (
                    <p className="text-xs text-muted text-center">
                      = {formatDuration(calcMinutesFromTimes(editing.startTime, editing.endTime))}
                    </p>
                  )}
                  {error && (
                    <p className="text-xs text-danger">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 py-1.5 rounded bg-primary text-white text-xs font-bold cursor-pointer"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null);
                        setError(null);
                      }}
                      className="flex-1 py-1.5 rounded border border-border text-xs font-bold cursor-pointer"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : deleting === record.id ? (
                <div className="text-center space-y-2">
                  <p className="text-sm">この記録を削除しますか？</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDelete(record.id)}
                      className="flex-1 py-1.5 rounded bg-danger text-white text-xs font-bold cursor-pointer"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="flex-1 py-1.5 rounded border border-border text-xs font-bold cursor-pointer"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted">
                      {formatDate(record.date)}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        record.person === "夫"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-pink-50 text-pink-700"
                      }`}
                    >
                      {record.person}
                    </span>
                    <span className="text-xs text-muted">
                      {formatTime(record.start_time)}〜{formatTime(record.end_time)}
                    </span>
                    <span className="font-bold text-sm">
                      {formatDuration(record.duration_minutes)}
                    </span>
                    <span className="text-xs text-muted">
                      {record.source === "timer" ? "タイマー" : "手入力"}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(record)}
                      className="px-2 py-1 text-xs text-muted hover:text-foreground cursor-pointer"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="px-2 py-1 text-xs text-muted hover:text-danger cursor-pointer"
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

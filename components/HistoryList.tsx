"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
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

interface HistoryListProps {
  records: TimeRecord[];
}

interface EditingState {
  id: string;
  date: string;
  hours: number;
  minutes: number;
}

export default function HistoryList({ records }: HistoryListProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const startEdit = (record: TimeRecord) => {
    const h = Math.floor(record.duration_minutes / 60);
    const m = record.duration_minutes % 60;
    setEditing({ id: record.id, date: record.date, hours: h, minutes: m });
    setError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const total = editing.hours * 60 + editing.minutes;
    if (total <= 0) {
      setError("時間を入力してください");
      return;
    }
    const { error: updateError } = await supabase
      .from("time_records")
      .update({ duration_minutes: total, date: editing.date })
      .eq("id", editing.id);
    if (updateError) {
      setError("更新に失敗しました");
    } else {
      setEditing(null);
      setError(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
  };

  const confirmDelete = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("time_records")
      .delete()
      .eq("id", id);
    if (deleteError) {
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
                /* 編集モード */
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
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={editing.hours}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          hours: Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className="w-16 border border-border rounded px-2 py-1 text-sm text-center"
                    />
                    <span className="text-xs">時間</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={editing.minutes}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          minutes: Math.max(
                            0,
                            Math.min(59, parseInt(e.target.value) || 0)
                          ),
                        })
                      }
                      className="w-16 border border-border rounded px-2 py-1 text-sm text-center"
                    />
                    <span className="text-xs">分</span>
                  </div>
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
                /* 削除確認 */
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
                /* 通常表示 */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                    <span className="font-bold text-sm">
                      {formatDuration(record.duration_minutes)}
                    </span>
                    <span className="text-xs text-muted">
                      {record.source === "timer" ? "タイマー" : "手入力"}
                    </span>
                  </div>
                  <div className="flex gap-1">
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

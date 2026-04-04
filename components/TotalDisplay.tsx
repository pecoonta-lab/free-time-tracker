"use client";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

interface TotalDisplayProps {
  husbandTotal: number;
  wifeTotal: number;
}

export default function TotalDisplay({
  husbandTotal,
  wifeTotal,
}: TotalDisplayProps) {
  return (
    <div className="border border-border rounded-xl p-4">
      <h2 className="text-sm font-bold text-muted mb-3">累計</h2>
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <p className="text-sm text-muted mb-1">夫</p>
          <p className="text-xl font-bold">{formatDuration(husbandTotal)}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm text-muted mb-1">妻</p>
          <p className="text-xl font-bold">{formatDuration(wifeTotal)}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { ProcessProgress } from "@/lib/validate";

/**
 * 取り込み進捗バー。HEIC 変換など時間のかかる処理を可視化する（トーストではなくインライン表示）。
 * `progress` が null のときは何も描画しない。
 */
export function UploadProgress({ progress }: { progress: ProcessProgress | null }) {
  if (!progress) return null;
  const { done, total, currentName, phase } = progress;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const label =
    phase === "converting"
      ? `HEICを変換中… ${currentName ?? ""}`
      : total > 1
        ? "読み込み中…"
        : "読み込み中…";

  return (
    <div className="mt-3" role="status" aria-live="polite">
      <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-text-3">
        <span className="truncate pr-2">{label}</span>
        <span className="shrink-0 tabular-nums">
          {done} / {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

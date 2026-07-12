"use client";

import { FittedThumb } from "@/components/ui/FittedThumb";
import { STRIP_THUMB_MAX_DIM } from "@/lib/constants";
import { shapeRadiusCSS } from "@/lib/fit";
import { toSettings } from "@/lib/presets";
import type { GlobalOutputSettings, ImageItem, OutputProfile } from "@/lib/types";

export interface EditorProfileStripProps {
  item: ImageItem;
  profiles: OutputProfile[];
  global: GlobalOutputSettings;
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * 編集ステージ直下の「全サイズのプレビュー」列（仕様書 §4.3）。
 * 1つの焦点調整が全プロファイルへどう効くかを即時確認でき、クリックでステージの対象を切り替える。
 */
export function EditorProfileStrip({
  item,
  profiles,
  global,
  selectedId,
  onSelect,
}: EditorProfileStripProps) {
  return (
    <div className="flex-none border-t border-border bg-surface">
      <div className="flex items-center gap-1.5 px-3.5 pt-2 text-[11px] font-bold text-text-3">
        全サイズのプレビュー
        <span className="mono-num font-medium">（{profiles.length}）</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto px-3.5 pb-3 pt-2">
        {profiles.map((p) => {
          const s = toSettings(global, p);
          const on = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`flex flex-none flex-col items-center gap-1 rounded-md border p-1.5 transition-[border-color,box-shadow] duration-150 ${
                on
                  ? "border-accent shadow-[inset_0_0_0_1px_theme(colors.accent.DEFAULT)]"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <div
                className="checker h-[54px] overflow-hidden border border-border/60"
                style={{
                  width: 54 * Math.min(2, Math.max(0.5, p.width / p.height)),
                  aspectRatio: `${p.width} / ${p.height}`,
                  borderRadius: shapeRadiusCSS(global.shape, 80, (80 * p.height) / p.width, global.radius),
                }}
              >
                <FittedThumb
                  element={item.element}
                  settings={s}
                  transform={item.transform}
                  maxDim={STRIP_THUMB_MAX_DIM}
                />
              </div>
              <span
                className={`max-w-[92px] truncate font-jp text-[11px] font-semibold ${on ? "text-accent" : "text-text-2"}`}
                title={p.label}
              >
                {p.label}
              </span>
              <span className="mono-num text-[10px] text-text-3">
                {p.width}×{p.height}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

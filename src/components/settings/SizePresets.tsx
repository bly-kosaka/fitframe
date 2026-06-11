"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { CUSTOM_SIZE_MAX, CUSTOM_SIZE_MIN } from "@/lib/constants";
import { aspectLabel } from "@/lib/format";
import { SIZE_PRESETS } from "@/lib/presets";
import type { OutputSettings } from "@/lib/types";

export interface SizePresetsProps {
  settings: OutputSettings;
  onChange: (patch: Partial<OutputSettings>) => void;
}

function clampSize(v: number): number {
  if (Number.isNaN(v)) return CUSTOM_SIZE_MIN;
  return Math.max(CUSTOM_SIZE_MIN, Math.min(CUSTOM_SIZE_MAX, Math.round(v)));
}

/** 出力サイズ：プリセット（グループ表示）＋カスタム W×H（仕様書 §5.2-1） */
export function SizePresets({ settings, onChange }: SizePresetsProps) {
  const [locked, setLocked] = useState(false);
  const ratio = settings.width / settings.height;

  const setWidth = (v: number) => {
    const w = clampSize(v);
    if (locked) onChange({ width: w, height: clampSize(w / ratio), presetId: "custom" });
    else onChange({ width: w, presetId: "custom" });
  };
  const setHeight = (v: number) => {
    const h = clampSize(v);
    if (locked) onChange({ height: h, width: clampSize(h * ratio), presetId: "custom" });
    else onChange({ height: h, presetId: "custom" });
  };
  const swap = () =>
    onChange({ width: settings.height, height: settings.width, presetId: "custom" });

  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-4 flex items-center gap-[9px] text-sm font-bold text-text">
        <Icon name="crop" size={16} className="text-accent" />
        出力サイズ
      </div>

      <div className="flex flex-col gap-3.5">
        {SIZE_PRESETS.map((g) => (
          <div key={g.group}>
            <div className="mb-2 text-[11px] font-bold tracking-[0.04em] text-text-3">
              {g.group}
            </div>
            <div className="flex flex-wrap gap-2">
              {g.items.map((p) => {
                const on = settings.presetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ presetId: p.id, width: p.w, height: p.h })}
                    className={`flex flex-col items-start gap-px rounded-sm border px-[13px] py-2 text-left transition-[border-color,background-color,box-shadow] duration-150 ${
                      on
                        ? "border-accent bg-accent-weak shadow-[inset_0_0_0_1px_theme(colors.accent.DEFAULT)]"
                        : "border-border-strong bg-surface hover:border-accent"
                    }`}
                  >
                    <span className="whitespace-nowrap text-[12.5px] font-semibold text-text">
                      {p.label}
                    </span>
                    <span
                      className={`mono-num whitespace-nowrap text-[11px] ${on ? "text-accent" : "text-text-3"}`}
                    >
                      {p.w}×{p.h}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[18px] flex items-center gap-[9px] border-t border-dashed border-border pt-4">
        <span className="mr-0.5 text-xs font-semibold text-text-2">カスタム</span>
        <div className="flex h-9 w-[116px] items-center overflow-hidden rounded-sm border border-border-input bg-surface focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-weak">
          <input
            type="number"
            value={settings.width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mono-num h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13.5px] text-text focus:outline-none"
          />
          <span className="grid h-full flex-none place-items-center self-stretch border-l border-border bg-surface-2 px-[11px] text-xs text-text-3">
            W
          </span>
        </div>
        <button
          type="button"
          title="縦横比を固定"
          onClick={() => setLocked((v) => !v)}
          className={`grid h-[30px] w-[30px] flex-none place-items-center rounded-[7px] border transition-colors duration-150 ${
            locked
              ? "border-accent bg-accent-weak text-accent"
              : "border-border-strong bg-surface text-text-3 hover:border-border-input hover:text-text"
          }`}
        >
          <Icon name={locked ? "lock" : "link"} size={15} />
        </button>
        <div className="flex h-9 w-[116px] items-center overflow-hidden rounded-sm border border-border-input bg-surface focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-weak">
          <input
            type="number"
            value={settings.height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="mono-num h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13.5px] text-text focus:outline-none"
          />
          <span className="grid h-full flex-none place-items-center self-stretch border-l border-border bg-surface-2 px-[11px] text-xs text-text-3">
            H
          </span>
        </div>
        <button
          type="button"
          title="縦横を入れ替え"
          onClick={swap}
          className="grid h-8 w-8 flex-none place-items-center rounded-sm bg-surface-2 text-text-2 transition-colors duration-150 hover:bg-canvas-2 hover:text-text"
        >
          <Icon name="flipH" size={15} />
        </button>
        <span className="mono-num ml-auto rounded-[6px] border border-border bg-surface-2 px-[9px] py-1 text-xs text-text-2">
          {aspectLabel(settings.width, settings.height)}
        </span>
      </div>
    </section>
  );
}

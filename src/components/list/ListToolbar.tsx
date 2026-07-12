"use client";

import { useRef } from "react";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { GRID_CELL_MAX, GRID_CELL_MIN } from "@/lib/constants";
import type { ListLayout } from "@/lib/types";

export interface ListToolbarProps {
  imageCount: number;
  sizeCount: number;
  layout: ListLayout;
  onLayoutChange: (layout: ListLayout) => void;
  cellSize: number;
  onCellSizeChange: (size: number) => void;
  onAddFiles: (files: File[]) => void;
}

const LAYOUT_OPTIONS = [
  { value: "grid" as const, icon: "grid" as const, label: "グリッド" },
  { value: "rows" as const, icon: "rows" as const, label: "リスト" },
];

/** 一覧確認画面の見出しとツール群（仕様書 §5.3 `.list-head`） */
export function ListToolbar({
  imageCount,
  sizeCount,
  layout,
  onLayoutChange,
  cellSize,
  onCellSizeChange,
  onAddFiles,
}: ListToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto mb-[18px] flex max-w-[1400px] flex-col gap-3 sm:mb-[22px] sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <ScreenHeader
        title="配置の確認"
        subtitle={
          <>
            <span className="mono-num font-bold text-text">{imageCount}</span> 枚を{" "}
            <span className="mono-num font-bold text-text">{sizeCount}</span> サイズ（計{" "}
            <span className="mono-num font-bold text-text">{imageCount * sizeCount}</span>{" "}
            ファイル）に自動配置しました。気になる画像だけ「編集」で微調整できます。
          </>
        }
      />
      <div className="flex flex-none flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
        {layout === "grid" && (
          <div className="flex items-center gap-2 px-1.5">
            <Icon name="grid" size={14} className="text-text-3" />
            <Slider
              min={GRID_CELL_MIN}
              max={GRID_CELL_MAX}
              value={cellSize}
              onChange={(e) => onCellSizeChange(Number(e.target.value))}
              className="w-[90px]"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Segmented
            value={layout}
            onChange={onLayoutChange}
            options={LAYOUT_OPTIONS.map((opt) => ({
              value: opt.value,
              title: opt.label,
              label: (
                <>
                  <Icon name={opt.icon} size={15} />
                  {opt.label}
                </>
              ),
            }))}
          />
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
            <Icon name="plus" size={15} />
            追加
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAddFiles(Array.from(e.target.files));
            }
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { FittedThumb } from "@/components/ui/FittedThumb";
import { Icon } from "@/components/ui/Icon";
import { shapeRadiusCSS } from "@/lib/fit";
import type { ImageItem, OutputSettings } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export interface ImageCardProps {
  item: ImageItem;
  settings: OutputSettings;
  cellSize: number;
  onEdit: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
}

/** グリッド表示の1枚カード（仕様書 §5.3 `.thumb-card`） */
export function ImageCard({ item, settings, cellSize, onEdit, onReset, onRemove }: ImageCardProps) {
  const frameStyle = {
    aspectRatio: `${settings.width} / ${settings.height}`,
    borderRadius: shapeRadiusCSS(
      settings.shape,
      cellSize,
      (cellSize * settings.height) / settings.width,
      settings.radius,
    ),
  };

  return (
    <div
      className="group cursor-default overflow-hidden rounded-md border border-border bg-surface shadow-xs transition-[box-shadow,border-color] duration-150 hover:border-border-strong hover:shadow-md"
      onDoubleClick={() => onEdit(item.id)}
    >
      <div className="checker relative grid min-h-[120px] place-items-center p-4">
        <div
          className="checker max-h-[200px] w-auto max-w-full overflow-hidden shadow-sm"
          style={frameStyle}
        >
          <FittedThumb
            element={item.element}
            settings={settings}
            transform={item.transform}
            maxDim={480}
          />
        </div>
        <div className="absolute inset-0 grid place-items-center bg-[rgba(21,24,30,0.32)] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item.id);
            }}
            className="inline-flex items-center gap-[7px] rounded-[8px] border-0 bg-white px-4 py-[9px] text-[13px] font-bold text-text shadow-md transition-transform duration-150 hover:scale-[1.04] hover:text-accent"
          >
            <Icon name="edit" size={15} />
            編集
          </button>
        </div>
        <div className="absolute left-[10px] top-[10px]">
          <StatusBadge edited={item.edited} />
        </div>
      </div>
      <div className="border-t border-border px-3 pb-3 pt-2.5">
        <div className="truncate text-[12.5px] font-semibold text-text" title={item.name}>
          {item.name}
        </div>
        <div className="mt-[7px] flex items-center justify-between">
          <span className="mono-num text-[11px] text-text-3">
            {settings.width}×{settings.height}
          </span>
          <div className="flex gap-[5px]">
            {item.edited && (
              <button
                type="button"
                title="自動配置に戻す"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset(item.id);
                }}
                className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-border bg-surface text-text-3 transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 hover:text-text"
              >
                <Icon name="reset" size={14} />
              </button>
            )}
            <button
              type="button"
              title="削除"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-border bg-surface text-text-3 transition-colors duration-150 hover:border-border-strong hover:bg-surface-2 hover:text-text"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

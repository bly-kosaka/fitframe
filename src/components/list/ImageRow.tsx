"use client";

import { Button } from "@/components/ui/Button";
import { FittedThumb } from "@/components/ui/FittedThumb";
import { Icon } from "@/components/ui/Icon";
import { shapeRadiusCSS } from "@/lib/fit";
import { resolveTransform } from "@/lib/types";
import type { ImageItem, OutputSettings } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export interface ImageRowProps {
  item: ImageItem;
  index: number;
  settings: OutputSettings;
  /** 代表プロファイルID（サムネの解決用） */
  repProfileId: string;
  onEdit: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
}

/** リスト表示の1行（仕様書 §5.3 `.row-item`） */
export function ImageRow({ item, index, settings, repProfileId, onEdit, onReset, onRemove }: ImageRowProps) {
  const frameStyle = {
    aspectRatio: `${settings.width} / ${settings.height}`,
    borderRadius: shapeRadiusCSS(
      settings.shape,
      120,
      (120 * settings.height) / settings.width,
      settings.radius,
    ),
  };

  return (
    <div
      className="flex items-center gap-4 border-b border-border px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-surface-2"
      onDoubleClick={() => onEdit(item.id)}
    >
      <span className="mono-num w-6 flex-none text-xs text-text-3">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div
        className="checker w-16 flex-none overflow-hidden border border-border shadow-xs"
        style={frameStyle}
      >
        <FittedThumb
          element={item.element}
          settings={settings}
          transform={resolveTransform(item, repProfileId)}
          maxDim={180}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-text" title={item.name}>
          {item.name}
        </div>
        <div className="mono-num mt-0.5 text-[11.5px] text-text-3">
          {item.naturalWidth}×{item.naturalHeight} → {settings.width}×{settings.height}
        </div>
      </div>
      <StatusBadge edited={item.edited} />
      <div className="flex flex-none items-center gap-1.5">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item.id);
          }}
        >
          <Icon name="edit" size={13} />
          編集
        </Button>
        {item.edited && (
          <Button
            variant="subtle"
            size="sm"
            icon
            title="自動配置に戻す"
            onClick={(e) => {
              e.stopPropagation();
              onReset(item.id);
            }}
          >
            <Icon name="reset" size={14} />
          </Button>
        )}
        <Button
          variant="subtle"
          size="sm"
          icon
          title="削除"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
        >
          <Icon name="trash" size={14} />
        </Button>
      </div>
    </div>
  );
}

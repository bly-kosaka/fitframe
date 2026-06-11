import { FittedThumb } from "@/components/ui/FittedThumb";
import { Pill } from "@/components/ui/Pill";
import { EDITOR_PANEL_THUMB_MAX_DIM } from "@/lib/constants";
import { shapeRadiusCSS } from "@/lib/fit";
import { FIT_MODES, SHAPES } from "@/lib/presets";
import type { ImageItem, OutputSettings, Transform } from "@/lib/types";

import { EditorControls } from "./EditorControls";

export interface EditorPanelProps {
  item: ImageItem;
  settings: OutputSettings;
  index: number;
  total: number;
  onTransform: (patch: Partial<Transform>) => void;
  onName: (id: string, name: string) => void;
}

/** 編集画面の右パネル：出力サイズ要約と調整コントロール（仕様書 §5.4） */
export function EditorPanel({
  item,
  settings,
  index,
  total,
  onTransform,
  onName,
}: EditorPanelProps) {
  const fitLabel = FIT_MODES.find((f) => f.id === settings.fit)?.label ?? "";
  const shapeLabel = SHAPES.find((s) => s.id === settings.shape)?.label ?? "";

  return (
    <aside className="flex w-[312px] flex-none flex-col border-l border-border bg-surface">
      <div className="flex gap-3.5 border-b border-border p-[18px]">
        <div
          className="checker w-[84px] flex-none self-start overflow-hidden border border-border shadow-sm"
          style={{
            aspectRatio: `${settings.width} / ${settings.height}`,
            borderRadius: shapeRadiusCSS(
              settings.shape,
              120,
              (120 * settings.height) / settings.width,
              settings.radius,
            ),
          }}
        >
          <FittedThumb
            element={item.element}
            settings={settings}
            transform={item.transform}
            maxDim={EDITOR_PANEL_THUMB_MAX_DIM}
          />
        </div>
        <div>
          <div className="mono-num text-[15px] font-semibold text-text">
            {settings.width} × {settings.height}
          </div>
          <div className="mt-0.5 text-xs text-text-3">
            {fitLabel} ・ {shapeLabel}
          </div>
          {item.edited ? (
            <Pill variant="accent" className="mt-1.5">
              調整済み
            </Pill>
          ) : (
            <Pill variant="ok" className="mt-1.5">
              自動配置のまま
            </Pill>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-[18px] pb-[22px] pt-1.5">
        <EditorControls
          item={item}
          settings={settings}
          index={index}
          total={total}
          onTransform={onTransform}
          onName={onName}
        />
      </div>
    </aside>
  );
}

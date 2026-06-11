import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Slider } from "@/components/ui/Slider";
import { ROTATION_MAX, ROTATION_MIN, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/lib/constants";
import { resolveFileName } from "@/lib/filename";
import { FORMATS } from "@/lib/presets";
import type { ImageItem, OutputSettings, Transform } from "@/lib/types";

export interface EditorControlsProps {
  item: ImageItem;
  settings: OutputSettings;
  index: number;
  total: number;
  onTransform: (patch: Partial<Transform>) => void;
  onName: (id: string, name: string) => void;
}

const ZOOM_SLIDER_MAX = 4;
const ZOOM_BUTTON_STEP = 0.05;

interface ControlGroupProps {
  title: string;
  icon: IconName;
  children: ReactNode;
}

function ControlGroup({ title, icon, children }: ControlGroupProps) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-[7px] text-xs font-bold text-text-2 [&>svg]:text-accent">
        <Icon name={icon} size={14} />
        {title}
      </div>
      {children}
    </div>
  );
}

/** 個別画像のファイル名・ズーム・回転・反転・位置を調整するコントロール群（仕様書 §5.4） */
export function EditorControls({
  item,
  settings,
  index,
  total,
  onTransform,
  onName,
}: EditorControlsProps) {
  const t = item.transform;
  const ext = FORMATS.find((f) => f.id === settings.format)?.ext ?? "png";
  const ruleFileName = resolveFileName({ ...item, customName: undefined }, settings, index, total);
  const ruleName = ruleFileName.replace(/\.[^.]+$/, "");
  const hasCustomName = Boolean(item.customName && item.customName.trim());

  return (
    <>
      <ControlGroup title="出力ファイル名" icon="edit">
        <div className="flex h-9 items-center overflow-hidden rounded-sm border border-border-input bg-surface focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-weak">
          <input
            value={item.customName ?? ""}
            placeholder={ruleName}
            onChange={(e) => onName(item.id, e.target.value)}
            className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 font-jp text-[13.5px] text-text focus:outline-none"
          />
          <span className="grid h-full flex-none place-items-center self-stretch border-l border-border bg-surface-2 px-[11px] text-xs text-text-3">
            .{ext}
          </span>
        </div>
        <div className="mt-2 flex items-center text-[11.5px] text-text-3">
          {hasCustomName ? (
            <button
              type="button"
              onClick={() => onName(item.id, "")}
              className="inline-flex items-center gap-[5px] border-0 bg-transparent p-0 font-jp text-[11.5px] font-semibold text-accent hover:underline"
            >
              <Icon name="reset" size={12} />
              ルールに戻す
            </button>
          ) : (
            <span className="mono-num break-all leading-[1.4]">ルール: {ruleFileName}</span>
          )}
        </div>
      </ControlGroup>

      <ControlGroup title="拡大・縮小" icon="zoomIn">
        <div className="flex items-center gap-2.5">
          <Button
            variant="subtle"
            size="sm"
            icon
            onClick={() => onTransform({ zoom: Math.max(ZOOM_MIN, t.zoom - ZOOM_BUTTON_STEP) })}
          >
            <Icon name="zoomOut" size={16} />
          </Button>
          <Slider
            min={ZOOM_MIN}
            max={ZOOM_SLIDER_MAX}
            step={ZOOM_STEP}
            value={Math.min(ZOOM_SLIDER_MAX, t.zoom)}
            onChange={(e) => onTransform({ zoom: Number(e.target.value) })}
          />
          <Button
            variant="subtle"
            size="sm"
            icon
            onClick={() => onTransform({ zoom: Math.min(ZOOM_MAX, t.zoom + ZOOM_BUTTON_STEP) })}
          >
            <Icon name="zoomIn" size={16} />
          </Button>
          <span className="min-w-[44px] text-right text-xs font-semibold text-text-2">
            {Math.round(t.zoom * 100)}%
          </span>
        </div>
      </ControlGroup>

      <ControlGroup title="回転" icon="rotateCw">
        <div className="flex items-center gap-2.5">
          <Slider
            min={ROTATION_MIN}
            max={ROTATION_MAX}
            step={1}
            value={t.rotation}
            onChange={(e) => onTransform({ rotation: Number(e.target.value) })}
          />
          <span className="min-w-[44px] text-right text-xs font-semibold text-text-2">
            {t.rotation}°
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-[7px]">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onTransform({ rotation: ((t.rotation - 90 + 540) % 360) - 180 })}
          >
            <Icon name="rotateCcw" size={15} />
            90°
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onTransform({ rotation: ((t.rotation + 90 + 540) % 360) - 180 })}
          >
            <Icon name="rotateCw" size={15} />
            90°
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onTransform({ rotation: 0 })}
          >
            0°
          </Button>
        </div>
      </ControlGroup>

      <ControlGroup title="反転" icon="flipH">
        <div className="flex gap-[7px]">
          <Button
            variant={t.flipH ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => onTransform({ flipH: !t.flipH })}
          >
            <Icon name="flipH" size={15} />
            左右反転
          </Button>
          <Button
            variant={t.flipV ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => onTransform({ flipV: !t.flipV })}
          >
            <Icon name="flipV" size={15} />
            上下反転
          </Button>
        </div>
      </ControlGroup>

      <ControlGroup title="位置（px）" icon="move">
        <div className="grid grid-cols-2 gap-2.5">
          <NumberStepper label="X" value={t.x} step={5} onChange={(v) => onTransform({ x: v })} />
          <NumberStepper label="Y" value={t.y} step={5} onChange={(v) => onTransform({ y: v })} />
          <NumberStepper
            label="倍率"
            value={t.zoom * 100}
            unit="%"
            step={5}
            min={ZOOM_MIN * 100}
            max={ZOOM_MAX * 100}
            onChange={(v) => onTransform({ zoom: v / 100 })}
          />
          <NumberStepper
            label="角度"
            value={t.rotation}
            unit="°"
            step={1}
            min={ROTATION_MIN}
            max={ROTATION_MAX}
            onChange={(v) => onTransform({ rotation: v })}
          />
        </div>
      </ControlGroup>
    </>
  );
}

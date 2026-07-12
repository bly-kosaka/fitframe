import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Slider } from "@/components/ui/Slider";
import { ROTATION_MAX, ROTATION_MIN, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/lib/constants";
import { resolveFileName } from "@/lib/filename";
import { FORMATS } from "@/lib/presets";
import type { ImageItem, OutputSettings, Transform } from "@/lib/types";

/** 焦点プリセット（fx,fy ∈ {0, 0.5, 1}）。サイズ非依存で全プロファイルへ波及する */
const FOCUS_POINTS: { fx: number; fy: number; label: string }[] = [
  { fx: 0, fy: 0, label: "左上に焦点" },
  { fx: 0.5, fy: 0, label: "上中央に焦点" },
  { fx: 1, fy: 0, label: "右上に焦点" },
  { fx: 0, fy: 0.5, label: "左中央に焦点" },
  { fx: 0.5, fy: 0.5, label: "中央に焦点" },
  { fx: 1, fy: 0.5, label: "右中央に焦点" },
  { fx: 0, fy: 1, label: "左下に焦点" },
  { fx: 0.5, fy: 1, label: "下中央に焦点" },
  { fx: 1, fy: 1, label: "右下に焦点" },
];

function FocusIcon({ col, row }: { col: 0 | 1 | 2; row: 0 | 1 | 2 }) {
  const cx = col === 0 ? 4 : col === 1 ? 12 : 20;
  const cy = row === 0 ? 4 : row === 1 ? 12 : 20;
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="2.5"
        fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx={cx} cy={cy} r="2.8" fill="currentColor" />
    </svg>
  );
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface EditorControlsProps {
  item: ImageItem;
  settings: OutputSettings;
  index: number;
  total: number;
  /** 選択中プロファイルのラベル（ファイル名例の {label} 用） */
  label: string;
  /** 選択中プロファイルの解決済みトランスフォーム */
  transform: Transform;
  /** 出力サイズが複数あるか（「全サイズに適用」ボタンの表示条件） */
  multiProfile: boolean;
  onTransform: (patch: Partial<Transform>) => void;
  onName: (id: string, name: string) => void;
  onApplyToAll: () => void;
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

/** 個別画像のファイル名・焦点・ズーム・回転・反転を調整するコントロール群（仕様書 §4.3） */
export function EditorControls({
  item,
  settings,
  index,
  total,
  label,
  transform,
  multiProfile,
  onTransform,
  onName,
  onApplyToAll,
}: EditorControlsProps) {
  const t = transform;
  const ext = FORMATS.find((f) => f.id === settings.format)?.ext ?? "png";
  const ruleFileName = resolveFileName({ ...item, customName: undefined }, settings, index, total, label);
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

      <ControlGroup title="焦点（フォーカルポイント）" icon="crop">
        <div className="grid grid-cols-3 gap-1.5">
          {FOCUS_POINTS.map(({ fx, fy, label: pointLabel }, i) => {
            const isActive = Math.abs(t.focus.fx - fx) < 0.02 && Math.abs(t.focus.fy - fy) < 0.02;
            const col = (i % 3) as 0 | 1 | 2;
            const row = Math.floor(i / 3) as 0 | 1 | 2;
            return (
              <button
                key={pointLabel}
                type="button"
                title={pointLabel}
                onClick={() => onTransform({ focus: { fx, fy } })}
                className={`flex aspect-square items-center justify-center rounded-md border transition-colors duration-150 ${
                  isActive
                    ? "border-accent bg-accent-weak text-accent"
                    : "border-border bg-surface text-text-3 hover:border-accent hover:text-accent"
                }`}
              >
                <FocusIcon col={col} row={row} />
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <NumberStepper
            label="X焦点"
            value={Math.round(t.focus.fx * 100)}
            unit="%"
            step={5}
            min={0}
            max={100}
            onChange={(v) => onTransform({ focus: { fx: clamp01(v / 100), fy: t.focus.fy } })}
          />
          <NumberStepper
            label="Y焦点"
            value={Math.round(t.focus.fy * 100)}
            unit="%"
            step={5}
            min={0}
            max={100}
            onChange={(v) => onTransform({ focus: { fx: t.focus.fx, fy: clamp01(v / 100) } })}
          />
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

      {multiProfile && (
        <ControlGroup title="ほかの出力サイズへ" icon="layers">
          <Button variant="ghost" size="sm" className="w-full" onClick={onApplyToAll}>
            <Icon name="duplicate" size={15} />
            この調整を全サイズに適用
          </Button>
          <p className="mt-2 text-[11px] leading-[1.5] text-text-3">
            出力サイズごとに個別調整できます。まとめて揃えたいときだけ使ってください。
          </p>
        </ControlGroup>
      )}
    </>
  );
}

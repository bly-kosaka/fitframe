import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { Icon } from "@/components/ui/Icon";
import { RADIUS_MAX, RADIUS_MIN } from "@/lib/constants";
import { SHAPES } from "@/lib/presets";
import type { GlobalOutputSettings, OutputSettings, ShapeType } from "@/lib/types";

/** 四角・角丸・円・楕円を表す簡易グリフ */
function ShapeGlyph({ shape }: { shape: ShapeType }) {
  const common = { width: 14, height: 14, viewBox: "0 0 16 16", fill: "currentColor" } as const;
  if (shape === "rect") {
    return (
      <svg {...common}>
        <rect x={2} y={2} width={12} height={12} />
      </svg>
    );
  }
  if (shape === "rounded") {
    return (
      <svg {...common}>
        <rect x={2} y={2} width={12} height={12} rx={4} />
      </svg>
    );
  }
  if (shape === "circle") {
    return (
      <svg {...common}>
        <circle cx={8} cy={8} r={6} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <ellipse cx={8} cy={8} rx={6} ry={4.5} />
    </svg>
  );
}

export interface ShapePickerProps {
  settings: OutputSettings;
  onChange: (patch: Partial<GlobalOutputSettings>) => void;
}

/** フレーム形状（マスク）：四角・角丸・円・楕円（仕様書 §5.2-3） */
export function ShapePicker({ settings, onChange }: ShapePickerProps) {
  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-4 flex items-center gap-[9px] text-sm font-bold text-text">
        <Icon name="image" size={16} className="text-accent" />
        フレーム形状（マスク）
      </div>
      <div className="flex flex-wrap items-center gap-[18px]">
        <Segmented
          grid2
          value={settings.shape}
          onChange={(shape) => onChange({ shape })}
          options={SHAPES.map((sh) => ({
            value: sh.id,
            label: (
              <>
                <ShapeGlyph shape={sh.id} />
                {sh.label}
              </>
            ),
          }))}
        />
        {settings.shape === "rounded" && (
          <div className="flex min-w-[200px] flex-1 items-center gap-2.5">
            <span className="text-xs font-semibold text-text-2">角丸</span>
            <Slider
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              value={settings.radius}
              onChange={(e) => onChange({ radius: Number(e.target.value) })}
            />
            <span className="mono-num w-[38px] text-right text-[13px] text-text-2">
              {settings.radius}%
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

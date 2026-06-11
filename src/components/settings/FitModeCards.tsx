import { Icon } from "@/components/ui/Icon";
import { FIT_MODES } from "@/lib/presets";
import type { FitMode } from "@/lib/types";

const ACTIVE_COLOR = "#2f54ff";
const INACTIVE_COLOR = "#8b93a3";

interface FitDiagramProps {
  mode: FitMode;
  active: boolean;
}

/** Cover/Contain/Stretch を表すミニ図解 */
function FitDiagram({ mode, active }: FitDiagramProps) {
  const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const clipId = `fit-diagram-${mode}`;

  let imageRect: JSX.Element;
  if (mode === "cover") {
    imageRect = <rect x={5} y={1} width={30} height={28} rx={2} fill={color} opacity={0.85} />;
  } else if (mode === "contain") {
    imageRect = <rect x={4} y={8} width={32} height={14} rx={2} fill={color} opacity={0.85} />;
  } else {
    imageRect = <rect x={4} y={4} width={32} height={22} rx={2} fill={color} opacity={0.85} />;
  }

  return (
    <svg width={40} height={30} viewBox="0 0 40 30" aria-hidden="true">
      <clipPath id={clipId}>
        <rect x={4} y={4} width={32} height={22} rx={2} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>{imageRect}</g>
      <rect
        x={4}
        y={4}
        width={32}
        height={22}
        rx={2}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
    </svg>
  );
}

export interface FitModeCardsProps {
  fit: FitMode;
  onChange: (fit: FitMode) => void;
}

/** フィット方式：Cover / Contain / Stretch（仕様書 §5.2-2） */
export function FitModeCards({ fit, onChange }: FitModeCardsProps) {
  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-4 flex items-center gap-[9px] text-sm font-bold text-text">
        <Icon name="layers" size={16} className="text-accent" />
        枠への収め方（フィット）
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {FIT_MODES.map((m) => {
          const on = fit === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`rounded-md border p-3.5 text-left transition-[border-color,background-color,box-shadow] duration-150 ${
                on
                  ? "border-accent bg-accent-weak shadow-[inset_0_0_0_1px_theme(colors.accent.DEFAULT)]"
                  : "border-border-strong bg-surface hover:border-accent"
              }`}
            >
              <div className="mb-[9px] flex items-center gap-[11px]">
                <FitDiagram mode={m.id} active={on} />
                <div>
                  <div className="font-display text-sm font-semibold text-text">{m.label}</div>
                  <div className={`text-[11.5px] ${on ? "text-accent" : "text-text-3"}`}>
                    {m.jp}
                  </div>
                </div>
              </div>
              <div className="text-[11.5px] leading-[1.5] text-text-2">{m.desc}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

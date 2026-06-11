import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { QUALITY_MAX, QUALITY_MIN, QUALITY_STEP } from "@/lib/constants";
import { BG_OPTIONS, FORMATS } from "@/lib/presets";
import type { OutputSettings } from "@/lib/types";

export interface FormatBackgroundProps {
  settings: OutputSettings;
  onChange: (patch: Partial<OutputSettings>) => void;
}

/** 出力形式・背景色・画質（仕様書 §5.2-4） */
export function FormatBackground({ settings, onChange }: FormatBackgroundProps) {
  const fmt = FORMATS.find((f) => f.id === settings.format);
  const showQuality = fmt?.ext !== "png";

  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-4 flex items-center gap-[9px] text-sm font-bold text-text">
        <Icon name="fileImage" size={16} className="text-accent" />
        出力形式 ・ 背景
      </div>
      <div className="grid grid-cols-2 gap-[22px]">
        <div>
          <span className="mb-[7px] block text-xs font-semibold text-text-2">ファイル形式</span>
          <Segmented
            value={settings.format}
            onChange={(format) => onChange({ format })}
            options={FORMATS.map((f) => ({
              value: f.id,
              label: (
                <>
                  {f.label}
                  {f.alpha && <span className="h-1.5 w-1.5 rounded-full bg-ok" title="透過対応" />}
                </>
              ),
            }))}
          />
        </div>
        <div>
          <span className="mb-[7px] block text-xs font-semibold text-text-2">
            {settings.fit === "contain" ? "余白の背景色" : "背景色"}
          </span>
          <div className="flex gap-2">
            {BG_OPTIONS.map((c) => {
              const isTransparent = c === "transparent";
              const disabled = isTransparent && !fmt?.alpha;
              const on = settings.background === c;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={disabled}
                  title={disabled ? "PNG / WebP で利用可" : isTransparent ? "透過" : c}
                  onClick={() => onChange({ background: c })}
                  style={isTransparent ? undefined : { background: c }}
                  className={`relative grid h-[38px] w-[38px] place-items-center rounded-[8px] border border-border-strong transition-transform duration-150 ${
                    isTransparent ? "checker" : ""
                  } ${
                    on
                      ? "shadow-[0_0_0_2px_theme(colors.accent.DEFAULT),0_0_0_4px_theme(colors.accent.weak)]"
                      : ""
                  } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:scale-105"}`}
                >
                  {on && (
                    <Icon
                      name="check"
                      size={14}
                      stroke={3}
                      style={{
                        color: c === "#15181e" ? "#fff" : isTransparent ? "#15181e" : "#2f54ff",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {showQuality && (
        <div className="mt-[18px] flex items-center gap-3 border-t border-dashed border-border pt-4">
          <span className="min-w-16 text-xs font-semibold text-text-2">画質</span>
          <Slider
            min={QUALITY_MIN}
            max={QUALITY_MAX}
            step={QUALITY_STEP}
            value={settings.quality}
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
          />
          <span className="mono-num w-[42px] text-right text-[13px] text-text-2">
            {Math.round(settings.quality * 100)}%
          </span>
        </div>
      )}
    </section>
  );
}

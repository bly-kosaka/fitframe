import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { QUALITY_MAX, QUALITY_MIN, QUALITY_STEP } from "@/lib/constants";
import { BG_OPTIONS, FORMATS } from "@/lib/presets";
import type { GlobalOutputSettings, OutputSettings } from "@/lib/types";

export interface FormatBackgroundProps {
  settings: OutputSettings;
  onChange: (patch: Partial<GlobalOutputSettings>) => void;
}

/** "#abc" / "abc" / "#aabbcc" → "#aabbcc"（正規化）。無効なら null */
function normHex(v: string): string | null {
  let s = v.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    s = s
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  return /^[0-9a-fA-F]{6}$/.test(s) ? "#" + s.toLowerCase() : null;
}

/** 背景の明度に応じてチェックマークの色（白/アクセント）を返す */
function checkColorFor(hex: string): string {
  const n = normHex(hex);
  if (!n) return "#2f54ff";
  const num = parseInt(n.slice(1), 16);
  const lum =
    (0.299 * ((num >> 16) & 255) + 0.587 * ((num >> 8) & 255) + 0.114 * (num & 255)) / 255;
  return lum < 0.55 ? "#fff" : "#2f54ff";
}

/** 出力形式・背景色・画質（仕様書 §5.2-4） */
export function FormatBackground({ settings, onChange }: FormatBackgroundProps) {
  const fmt = FORMATS.find((f) => f.id === settings.format);
  const showQuality = fmt?.ext !== "png";

  // --- カスタム背景色（カラーコードでの自由選択） ---
  const isCustomBg =
    settings.background !== "transparent" && !BG_OPTIONS.includes(settings.background);
  const [hexDraft, setHexDraft] = useState(isCustomBg ? settings.background : "#2f54ff");
  useEffect(() => {
    if (isCustomBg) setHexDraft(settings.background);
  }, [isCustomBg, settings.background]);
  const commitHex = (v: string) => {
    setHexDraft(v);
    const n = normHex(v);
    if (n) onChange({ background: n });
  };
  const draftHex = normHex(hexDraft);

  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-4 flex items-center gap-[9px] text-sm font-bold text-text">
        <Icon name="fileImage" size={16} className="text-accent" />
        出力形式 ・ 背景
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-[22px]">
        <div>
          <span className="mb-[7px] block text-xs font-semibold text-text-2">ファイル形式</span>
          <Segmented
            grid2
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
          <div className="flex flex-wrap items-center gap-2">
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

            {/* カラーコードで自由選択できるカスタムスウォッチ */}
            <label
              title="カラーコードで自由に選択"
              style={
                isCustomBg
                  ? { background: settings.background }
                  : {
                      background:
                        "conic-gradient(from 90deg, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #ec4899, #f43f5e)",
                    }
              }
              className={`relative grid h-[38px] w-[38px] cursor-pointer place-items-center overflow-hidden rounded-[8px] border border-border-strong transition-transform duration-150 hover:scale-105 ${
                isCustomBg
                  ? "shadow-[0_0_0_2px_theme(colors.accent.DEFAULT),0_0_0_4px_theme(colors.accent.weak)]"
                  : ""
              }`}
            >
              <input
                type="color"
                value={draftHex ?? "#2f54ff"}
                onChange={(e) => commitHex(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="背景色をカラーコードで選択"
              />
              {isCustomBg ? (
                <Icon name="check" size={14} stroke={3} style={{ color: checkColorFor(settings.background) }} />
              ) : (
                <Icon name="plus" size={15} stroke={2.4} style={{ color: "#fff" }} />
              )}
            </label>
          </div>

          {/* カラーコード直接入力 */}
          <div className="mt-[10px] inline-flex h-[34px] items-center gap-0.5 rounded-[8px] border border-border-strong bg-canvas pl-[10px] pr-1 focus-within:border-accent focus-within:shadow-[0_0_0_3px_theme(colors.accent.weak)]">
            <span className="text-[13px] text-text-3">#</span>
            <input
              value={hexDraft.replace(/^#/, "")}
              onChange={(e) => commitHex(e.target.value)}
              placeholder="RRGGBB"
              maxLength={7}
              spellCheck={false}
              aria-label="背景色のカラーコード"
              className="mono-num w-[72px] bg-transparent text-[13px] uppercase tracking-[0.04em] text-text outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-text-3"
            />
            <span
              style={draftHex ? { background: draftHex } : undefined}
              className={`h-[22px] w-[22px] rounded-[5px] border border-border-strong ${
                draftHex ? "" : "checker"
              }`}
            />
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

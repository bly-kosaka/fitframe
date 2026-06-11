"use client";

export interface NumberStepperProps {
  label?: string;
  value: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  /** 小数点以下の桁数（0なら整数表示） */
  fixed?: number;
  onChange: (value: number) => void;
  className?: string;
}

/** ±ボタン付き数値入力（仕様書 §5.5 `.numfield`） */
export function NumberStepper({
  label,
  value,
  unit,
  step = 1,
  min = -9999,
  max = 9999,
  fixed = 0,
  onChange,
  className,
}: NumberStepperProps) {
  const clamp = (v: number): number => {
    const factor = 10 ** fixed;
    const rounded = Math.round(v * factor) / factor;
    return Math.max(min, Math.min(max, rounded));
  };

  const displayValue = fixed ? value.toFixed(fixed) : String(Math.round(value));

  return (
    <div className={className}>
      {label && (
        <span className="mb-[5px] block text-[11px] font-semibold text-text-3">{label}</span>
      )}
      <div className="flex h-[34px] items-center overflow-hidden rounded-sm border border-border-input bg-surface">
        <button
          type="button"
          className="h-full w-7 flex-none border-0 bg-surface-2 text-base text-text-2 transition-colors duration-150 hover:bg-canvas-2 hover:text-text"
          onClick={() => onChange(clamp(value - step))}
        >
          −
        </button>
        <input
          className="mono-num w-full min-w-0 border-0 bg-transparent text-center text-[13px] text-text focus:outline-none"
          value={displayValue}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(clamp(v));
          }}
        />
        <button
          type="button"
          className="h-full w-7 flex-none border-0 bg-surface-2 text-base text-text-2 transition-colors duration-150 hover:bg-canvas-2 hover:text-text"
          onClick={() => onChange(clamp(value + step))}
        >
          +
        </button>
        {unit && <span className="pr-[9px] text-[11px] text-text-3">{unit}</span>}
      </div>
    </div>
  );
}

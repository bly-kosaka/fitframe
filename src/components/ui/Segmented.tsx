import type { ReactNode } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

export interface SegmentedProps<T extends string> {
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
  /** モバイルで2カラムグリッド表示にする */
  grid2?: boolean;
}

/** セグメントコントロール（仕様書 §8 `.seg` / `.seg-opt`） */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
  grid2,
}: SegmentedProps<T>) {
  return (
    <div
      className={`${grid2 ? "grid w-full grid-cols-2 sm:inline-flex sm:w-auto" : "inline-flex"} gap-0.5 rounded-sm border border-border bg-surface-2 p-[3px] ${className ?? ""}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          title={opt.title}
          onClick={() => onChange(opt.value)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-[5px] px-3.5 py-1.5 text-[12.5px] font-semibold font-jp transition-[background-color,color,box-shadow] duration-150 ${grid2 ? "py-2.5 sm:py-1.5" : ""} ${
            opt.value === value ? "bg-surface text-text shadow-xs" : "text-text-2 hover:text-text"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

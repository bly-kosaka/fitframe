import type { ReactNode } from "react";

export type PillVariant = "ok" | "accent" | "warn" | "neutral";

export interface PillProps {
  variant?: PillVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<PillVariant, string> = {
  ok: "bg-ok-weak text-ok",
  accent: "bg-accent-weak text-accent",
  warn: "bg-warn-weak text-warn",
  neutral: "bg-surface-2 text-text-2",
};

/** ステータス表示用ピル（仕様書 §8 `.pill`） */
export function Pill({ variant = "neutral", children, className }: PillProps) {
  return (
    <span
      className={`inline-flex h-[22px] items-center gap-[5px] rounded-full px-[9px] text-[11.5px] font-semibold ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

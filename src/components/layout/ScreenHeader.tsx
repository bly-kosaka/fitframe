import type { ReactNode } from "react";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: ReactNode;
  className?: string;
}

/** 各画面共通の見出し（仕様書 §8 `.screen-title` / `.screen-sub`） */
export function ScreenHeader({ title, subtitle, className }: ScreenHeaderProps) {
  return (
    <div className={className}>
      <h2 className="mb-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-text">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-text-2">{subtitle}</p>}
    </div>
  );
}

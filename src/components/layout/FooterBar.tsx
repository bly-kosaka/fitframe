import type { ReactNode } from "react";

export interface FooterBarProps {
  children: ReactNode;
  className?: string;
}

/** 各画面下部の固定フッターバー（仕様書 §8 `.set-footer`） */
export function FooterBar({ children, className }: FooterBarProps) {
  return (
    <div
      className={`flex items-center gap-2 border-t border-border bg-surface px-3 py-2.5 shadow-[0_-2px_10px_rgba(20,27,45,0.03)] sm:gap-4 sm:px-6 sm:py-3.5 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

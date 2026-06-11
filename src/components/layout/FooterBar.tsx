import type { ReactNode } from "react";

export interface FooterBarProps {
  children: ReactNode;
  className?: string;
}

/** 各画面下部の固定フッターバー（仕様書 §8 `.set-footer`） */
export function FooterBar({ children, className }: FooterBarProps) {
  return (
    <div
      className={`flex items-center gap-4 border-t border-border bg-surface px-6 py-3.5 shadow-[0_-2px_10px_rgba(20,27,45,0.03)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

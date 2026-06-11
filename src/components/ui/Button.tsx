import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "subtle" | "danger-ghost";
export type ButtonSize = "md" | "lg" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 正方形のアイコンボタン（テキストなし） */
  icon?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-accent text-white shadow-xs hover:bg-accent-hover",
  ghost:
    "border border-border-strong bg-surface text-text hover:bg-surface-2 hover:border-border-input",
  subtle: "border border-transparent bg-surface-2 text-text-2 hover:bg-canvas-2 hover:text-text",
  "danger-ghost":
    "border border-border bg-surface text-danger hover:border-danger hover:bg-danger-weak",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "h-[38px] gap-2 rounded-sm px-4 text-[13.5px]",
  lg: "h-[46px] gap-2 rounded-md px-6 text-[15px]",
  sm: "h-8 gap-1.5 rounded-sm px-3 text-[12.5px]",
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "w-[38px] px-0",
  lg: "w-[46px] px-0",
  sm: "w-8 px-0",
};

/** 仕様書 §8 のボタンスタイル（primary/ghost/subtle/danger-ghost × md/lg/sm） */
export function Button({
  variant = "primary",
  size = "md",
  icon = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex select-none items-center justify-center whitespace-nowrap font-jp font-semibold transition-[background-color,border-color,box-shadow,color,transform] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    icon ? ICON_SIZE_CLASSES[size] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

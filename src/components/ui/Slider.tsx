import type { InputHTMLAttributes } from "react";

export type SliderProps = InputHTMLAttributes<HTMLInputElement>;

/** レンジスライダー（スタイルは globals.css の `.range`） */
export function Slider({ className, ...rest }: SliderProps) {
  return <input type="range" className={`range ${className ?? ""}`} {...rest} />;
}

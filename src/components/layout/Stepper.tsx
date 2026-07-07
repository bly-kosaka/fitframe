import { Fragment } from "react";

import { Icon } from "@/components/ui/Icon";
import type { Step } from "@/lib/types";

const STEPS: ReadonlyArray<{ id: Step; label: string }> = [
  { id: "upload", label: "アップロード" },
  { id: "settings", label: "サイズ設定" },
  { id: "list", label: "確認" },
  { id: "export", label: "ダウンロード" },
];

/** edit は list と同じステップ位置として扱う */
const STEP_INDEX: Record<Step, number> = {
  upload: 0,
  settings: 1,
  list: 2,
  edit: 2,
  export: 3,
};

export interface StepperProps {
  step: Step;
  maxStep: number;
  onNavigate: (step: Step) => void;
}

/** ウィザードの進捗表示（仕様書 §8 `.stepper` / `.step`） */
export function Stepper({ step, maxStep, onNavigate }: StepperProps) {
  const active = STEP_INDEX[step];

  return (
    <nav className="mx-auto flex items-center gap-0.5">
      {STEPS.map((s, i) => {
        const enabled = i <= maxStep;
        const isActive = i === active;
        const isDone = i < active;
        return (
          <Fragment key={s.id}>
            {i > 0 && <div className="h-px w-2 bg-border-strong sm:w-4" />}
            <button
              type="button"
              disabled={!enabled}
              onClick={() => onNavigate(s.id)}
              className={`flex items-center gap-[9px] whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-[0.45] sm:px-3 ${
                isActive
                  ? "bg-accent-weak text-accent"
                  : isDone
                    ? "text-text-2 hover:bg-surface-2"
                    : "text-text-3 hover:bg-surface-2 hover:text-text-2"
              }`}
            >
              <span
                className={`grid h-5 w-5 flex-none place-items-center rounded-full font-display text-[12px] font-semibold ${
                  isActive
                    ? "bg-accent text-white"
                    : isDone
                      ? "bg-ok-weak text-ok"
                      : "bg-canvas-2 text-text-3"
                }`}
              >
                {isDone ? <Icon name="check" size={13} stroke={2.6} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}

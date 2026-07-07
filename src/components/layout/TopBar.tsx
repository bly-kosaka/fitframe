"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { useImageStore } from "@/hooks/useImageStore";
import { useToasts } from "@/hooks/useToasts";

import { Stepper } from "./Stepper";

/** ヘッダー：ブランド・ステッパー・画像枚数・やり直しボタン（仕様書 §8 `.topbar`） */
export function TopBar() {
  const { state, maxStep, goToStep, resetAll } = useImageStore();
  const { pushToast } = useToasts();

  const handleResetAll = () => {
    resetAll();
    pushToast("リセットしました");
  };

  const hasRightContent = state.images.length > 0 || state.step !== "upload";

  return (
    <header className="flex flex-none flex-col gap-1 border-b border-border bg-surface px-3 py-2 sm:h-[60px] sm:flex-row sm:items-center sm:gap-[18px] sm:py-0 sm:px-5">
      {/* Row 1: Logo + Stepper */}
      <div className="flex items-center gap-1.5 sm:contents">
        <button
          type="button"
          className="flex flex-none select-none items-center gap-2.5"
          onClick={() => goToStep("upload")}
        >
          <div className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-accent shadow-xs">
            <Icon name="crop" size={17} stroke={2.2} className="text-white" />
          </div>
          <div className="font-display text-[17px] font-semibold tracking-tight text-text">
            Fit<b className="font-bold text-accent">Frame</b>
          </div>
        </button>
        <Stepper step={state.step} maxStep={maxStep} onNavigate={goToStep} />
      </div>

      {/* Row 2 on mobile / right side on desktop */}
      <div className={`flex items-center justify-end gap-2 sm:gap-3 ${!hasRightContent ? "hidden sm:flex" : ""}`}>
        <Pill variant="ok" className="hidden sm:inline-flex">
          <Icon name="lock" size={12} />
          ローカル処理
        </Pill>
        {state.images.length > 0 && (
          <Pill variant="neutral" className="tnum">
            <Icon name="image" size={12} />
            {state.images.length} 枚
          </Pill>
        )}
        {state.step !== "upload" && (
          <Button variant="subtle" size="sm" onClick={handleResetAll}>
            <Icon name="reset" size={14} />
            <span className="hidden sm:inline">やり直す</span>
          </Button>
        )}
      </div>
    </header>
  );
}

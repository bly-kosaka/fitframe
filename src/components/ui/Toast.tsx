"use client";

import { useToasts } from "@/hooks/useToasts";

import { Icon } from "./Icon";

/** トースト表示ホスト（画面下部中央に固定。仕様書 §8 アニメーションは transform のみ） */
export function ToastHost() {
  const { toasts } = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-[22px] left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-fadein flex items-center gap-[9px] rounded-[9px] bg-text px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          <Icon
            name={toast.kind === "ok" ? "checkCircle" : "warning"}
            size={16}
            className={toast.kind === "ok" ? "text-green-400" : "text-amber-400"}
          />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

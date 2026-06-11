"use client";

/**
 * トースト通知の表示・自動消去（仕様書 §8 アニメーション、TOAST_DURATION_MS で自動消去）。
 */

import { useCallback } from "react";

import { TOAST_DURATION_MS } from "@/lib/constants";
import type { Toast, ToastKind } from "@/lib/types";

import { useImageStoreContext } from "./useImageStore";

export interface UseToastsResult {
  toasts: Toast[];
  pushToast: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: string) => void;
}

export function useToasts(): UseToastsResult {
  const { state, dispatch } = useImageStoreContext();

  const pushToast = useCallback(
    (message: string, kind: ToastKind = "ok") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      dispatch({ type: "ADD_TOAST", toast: { id, message, kind } });
      setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), TOAST_DURATION_MS);
    },
    [dispatch],
  );

  const dismissToast = useCallback(
    (id: string) => dispatch({ type: "REMOVE_TOAST", id }),
    [dispatch],
  );

  return { toasts: state.toasts, pushToast, dismissToast };
}

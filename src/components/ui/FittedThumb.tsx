"use client";

import { useEffect, useRef } from "react";

import { renderPreviewCanvas } from "@/lib/fit";
import type { OutputSettings, Transform } from "@/lib/types";

export interface FittedThumbProps {
  element: HTMLImageElement;
  settings: OutputSettings;
  transform: Transform;
  maxDim?: number;
  className?: string;
}

/**
 * フィット結果のプレビュー用キャンバス。
 * サムネ・設定プレビュー・編集画面など全画面で共有する `lib/fit.ts` の renderPreviewCanvas を使う。
 */
export function FittedThumb({ element, settings, transform, maxDim, className }: FittedThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderPreviewCanvas(canvas, element, settings, transform, maxDim);
    // settings/transform はプリミティブ項目ごとに依存指定し、無関係な変更での再描画を避ける
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    element,
    settings.width,
    settings.height,
    settings.fit,
    settings.shape,
    settings.radius,
    settings.background,
    settings.format,
    transform.focus.fx,
    transform.focus.fy,
    transform.zoom,
    transform.rotation,
    transform.flipH,
    transform.flipV,
    maxDim,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}

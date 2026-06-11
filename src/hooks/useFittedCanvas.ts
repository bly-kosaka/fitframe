"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

import { computeStageFrame, renderBackdropCanvas, type StageFrame } from "@/lib/fit";
import type { ImageItem, OutputSettings } from "@/lib/types";

export interface UseFittedCanvasResult {
  stageRef: RefObject<HTMLDivElement>;
  backdropRef: RefObject<HTMLCanvasElement>;
  frame: StageFrame | null;
}

/**
 * 編集画面のステージ：要素サイズの追従と、出力枠の表示矩形の算出、
 * 枠外の元画像を薄く描く背景キャンバスの再描画をまとめて行う。
 */
export function useFittedCanvas(item: ImageItem, settings: OutputSettings): UseFittedCanvasResult {
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    observer.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => observer.disconnect();
  }, []);

  const frame = size.w > 0 && size.h > 0 ? computeStageFrame(size.w, size.h, settings) : null;
  const { transform } = item;

  useEffect(() => {
    const canvas = backdropRef.current;
    if (!canvas || !frame) return;
    renderBackdropCanvas(canvas, item.element, settings, transform, frame, size.w, size.h);
    // settings/transform はプリミティブ項目ごとに依存指定し、無関係な変更での再描画を避ける
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    item.element,
    size.w,
    size.h,
    settings.width,
    settings.height,
    settings.fit,
    settings.shape,
    settings.radius,
    transform.x,
    transform.y,
    transform.zoom,
    transform.rotation,
    transform.flipH,
    transform.flipV,
  ]);

  return { stageRef, backdropRef, frame };
}

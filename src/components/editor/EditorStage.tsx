"use client";

import { useRef, type PointerEvent, type WheelEvent } from "react";

import { FittedThumb } from "@/components/ui/FittedThumb";
import { Icon } from "@/components/ui/Icon";
import { useFittedCanvas } from "@/hooks/useFittedCanvas";
import { EDITOR_STAGE_MAX_DIM, ZOOM_MAX, ZOOM_MIN } from "@/lib/constants";
import type { ImageItem, OutputSettings, Transform } from "@/lib/types";

export interface EditorStageProps {
  item: ImageItem;
  settings: OutputSettings;
  onTransform: (patch: Partial<Transform>) => void;
}

interface DragState {
  x: number;
  y: number;
  ox: number;
  oy: number;
  shift: boolean;
  axis: "x" | "y" | null; // Shift モード時に最初の動きで確定する固定軸
}

const ZOOM_WHEEL_FACTOR = 1.06;

/** ドラッグで移動・ホイールで拡大縮小できる編集ステージ（仕様書 §5.4） */
export function EditorStage({ item, settings, onTransform }: EditorStageProps) {
  const { stageRef, backdropRef, frame } = useFittedCanvas(item, settings);
  const dragRef = useRef<DragState | null>(null);
  const t = item.transform;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!frame) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: t.x, oy: t.y, shift: e.shiftKey, axis: null };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !frame) return;
    const k = 1 / frame.scale;
    const dx = (e.clientX - drag.x) * k;
    const dy = (e.clientY - drag.y) * k;

    if (drag.shift) {
      // 4px 動いた時点で軸を確定する
      if (drag.axis === null) {
        const adx = Math.abs(e.clientX - drag.x);
        const ady = Math.abs(e.clientY - drag.y);
        if (adx > 4 || ady > 4) drag.axis = adx >= ady ? "x" : "y";
      }
      if (drag.axis === "x") onTransform({ x: drag.ox + dx, y: drag.oy });
      else if (drag.axis === "y") onTransform({ x: drag.ox, y: drag.oy + dy });
    } else {
      onTransform({ x: drag.ox + dx, y: drag.oy + dy });
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ポインタが既に解放されている場合は無視
    }
  };

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? ZOOM_WHEEL_FACTOR : 1 / ZOOM_WHEEL_FACTOR;
    onTransform({ zoom: Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, t.zoom * factor)) });
  };

  return (
    <div ref={stageRef} className="checker relative flex-1 overflow-hidden">
      <canvas ref={backdropRef} className="pointer-events-none absolute inset-0" />
      {frame && (
        <div
          className="group absolute cursor-grab touch-none overflow-hidden shadow-[0_0_0_1.5px_theme(colors.accent.DEFAULT),0_12px_40px_rgba(20,27,45,0.28)] active:cursor-grabbing"
          style={{ left: frame.fx, top: frame.fy, width: frame.fw, height: frame.fh }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          onDoubleClick={() => onTransform({ x: 0, y: 0 })}
        >
          <FittedThumb
            element={item.element}
            settings={settings}
            transform={t}
            maxDim={EDITOR_STAGE_MAX_DIM}
          />
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-0 transition-opacity duration-150 group-active:opacity-100">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="border-b border-r border-white/50 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
              />
            ))}
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-[7px] rounded-full bg-[rgba(21,24,30,0.82)] px-3.5 py-[7px] text-xs font-medium text-white backdrop-blur-[4px]">
        <Icon name="move" size={13} />
        ドラッグで移動 ・ Shiftで軸固定 ・ ホイールで拡大縮小 ・ ダブルクリックで中央へ
      </div>
    </div>
  );
}

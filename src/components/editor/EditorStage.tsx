"use client";

import { useRef, type PointerEvent, type WheelEvent } from "react";

import { FittedThumb } from "@/components/ui/FittedThumb";
import { Icon } from "@/components/ui/Icon";
import { useFittedCanvas } from "@/hooks/useFittedCanvas";
import { EDITOR_STAGE_MAX_DIM, ZOOM_MAX, ZOOM_MIN } from "@/lib/constants";
import { baseScale } from "@/lib/fit";
import type { ImageItem, OutputSettings, Transform } from "@/lib/types";

export interface EditorStageProps {
  item: ImageItem;
  settings: OutputSettings;
  /** 選択中プロファイルの解決済みトランスフォーム */
  transform: Transform;
  onTransform: (patch: Partial<Transform>) => void;
}

interface DragState {
  x: number;
  y: number;
  fx: number;
  fy: number;
  /** ドラッグ開始時に Shift が押されていたか（軸固定モード） */
  shift: boolean;
  /** Shift モード時に最初の動きで確定する固定軸 */
  axis: "x" | "y" | null;
}

const ZOOM_WHEEL_FACTOR = 1.06;

/** fit に応じた実効スケール（zoom 込み） */
function scaleFor(iw: number, ih: number, s: OutputSettings, zoom: number) {
  if (s.fit === "stretch") return { sx: (s.width / iw) * zoom, sy: (s.height / ih) * zoom };
  const b = baseScale(iw, ih, s) * zoom;
  return { sx: b, sy: b };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * ステージ上のドラッグでフォーカルポイント（focus）を移動できる編集ステージ（仕様書 §4.3）。
 * ドラッグで画像がカーソルに追従するよう focus を更新し、ホイールで zoom、
 * ダブルクリックで focus を中央（0.5/0.5）へ戻す。位置はサイズ非依存で全プロファイルへ波及する。
 */
export function EditorStage({ item, settings, transform, onTransform }: EditorStageProps) {
  const { stageRef, backdropRef, frame } = useFittedCanvas(item, settings, transform);
  const dragRef = useRef<DragState | null>(null);
  const t = transform;
  const iw = item.naturalWidth;
  const ih = item.naturalHeight;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!frame) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      fx: t.focus.fx,
      fy: t.focus.fy,
      shift: e.shiftKey,
      axis: null,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !frame) return;
    const { sx, sy } = scaleFor(iw, ih, settings, t.zoom);
    // 画面移動量 → 出力px移動量（ox,oy）→ focus 差分（回転は近似で無視）
    const dOx = (e.clientX - drag.x) / frame.scale;
    const dOy = (e.clientY - drag.y) / frame.scale;
    const fhx = t.flipH ? -1 : 1;
    const fvy = t.flipV ? -1 : 1;
    let dfx = -dOx / (iw * sx * fhx);
    let dfy = -dOy / (ih * sy * fvy);
    // Shift 中は最初の動き（画面上4px超）で固定軸を確定し、一方向だけに移動を制限する
    if (drag.shift) {
      if (drag.axis === null) {
        const adx = Math.abs(e.clientX - drag.x);
        const ady = Math.abs(e.clientY - drag.y);
        if (adx > 4 || ady > 4) drag.axis = adx >= ady ? "x" : "y";
      }
      if (drag.axis === "x") dfy = 0;
      else if (drag.axis === "y") dfx = 0;
      else {
        dfx = 0; // 軸未確定の間は動かさない
        dfy = 0;
      }
    }
    onTransform({ focus: { fx: clamp01(drag.fx + dfx), fy: clamp01(drag.fy + dfy) } });
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
          onDoubleClick={() => onTransform({ focus: { fx: 0.5, fy: 0.5 } })}
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
      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-[7px] rounded-full bg-[rgba(21,24,30,0.82)] px-3.5 py-[7px] text-xs font-medium text-white backdrop-blur-[4px] sm:flex">
        <Icon name="move" size={13} />
        ドラッグで焦点を移動 ・ Shiftで軸固定 ・ ホイールで拡大縮小 ・ ダブルクリックで中央へ
      </div>
    </div>
  );
}

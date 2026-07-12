/**
 * 画像フィッティング描画エンジン（仕様書 §6）。
 * サムネ・プレビュー・エディタ・書き出しのすべてがこのモジュールを共有する。
 */

import { PREVIEW_MAX_DIM } from "./constants";
import { FORMATS } from "./presets";
import type { OutputSettings, ShapeType, Transform } from "./types";

/** 自動配置の基準スケール（fit に応じて画像が出力枠を満たす倍率） */
export function baseScale(iw: number, ih: number, s: OutputSettings): number {
  const fw = s.width / iw;
  const fh = s.height / ih;
  if (s.fit === "contain") return Math.min(fw, fh);
  return Math.max(fw, fh); // cover / stretch（stretch は sx,sy を別途算出）
}

/** fit に応じた実効スケール（zoom 込み、flip 前）を返す */
function effectiveScale(iw: number, ih: number, s: OutputSettings, t: Transform): { sx: number; sy: number } {
  let sx: number;
  let sy: number;
  if (s.fit === "stretch") {
    sx = s.width / iw;
    sy = s.height / ih;
  } else {
    const b = baseScale(iw, ih, s);
    sx = b;
    sy = b;
  }
  return { sx: sx * t.zoom, sy: sy * t.zoom };
}

/**
 * 正規化フォーカルポイント（focus）から、出力px空間での中心オフセット(ox,oy)を導出する（仕様書 §3）。
 * focus 点が出力枠の中心へ来るよう配置し、cover 時は画像が枠を覆う範囲へクランプする。
 * サイズ非依存なので、同じ focus を全プロファイルへ使い回せる。
 */
export function focusOffset(
  iw: number,
  ih: number,
  s: OutputSettings,
  t: Transform,
): { ox: number; oy: number } {
  const { sx, sy } = effectiveScale(iw, ih, s, t);
  // 画像中心から focus 点までの元px距離
  const ex = (t.focus.fx - 0.5) * iw;
  const ey = (t.focus.fy - 0.5) * ih;
  // flip → scale → rotate の順で出力空間へ写像（renderToCanvas の変換順に一致）
  const vx = ex * sx * (t.flipH ? -1 : 1);
  const vy = ey * sy * (t.flipV ? -1 : 1);
  const rad = (t.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let ox = -(vx * cos - vy * sin);
  let oy = -(vx * sin + vy * cos);
  // cover は背景が見えない範囲へクランプ（回転0前提の近似）
  if (s.fit === "cover") {
    const maxX = Math.max(0, (iw * sx) / 2 - s.width / 2);
    const maxY = Math.max(0, (ih * sy) / 2 - s.height / 2);
    ox = Math.max(-maxX, Math.min(maxX, ox));
    oy = Math.max(-maxY, Math.min(maxY, oy));
  }
  return { ox, oy };
}

/** 角丸矩形のパスを構築する */
export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** 出力形状（rect/rounded/circle/ellipse）に応じてクリップ領域を設定する */
export function applyShapeClip(ctx: CanvasRenderingContext2D, s: OutputSettings): void {
  const w = s.width;
  const h = s.height;
  switch (s.shape) {
    case "rect": {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      return;
    }
    case "rounded": {
      const r = (Math.min(w, h) * s.radius) / 100;
      roundRectPath(ctx, 0, 0, w, h, r);
      ctx.clip();
      return;
    }
    case "circle": {
      const r = Math.min(w, h) / 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.clip();
      return;
    }
    case "ellipse": {
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.clip();
      return;
    }
  }
}

/**
 * 背景の塗りつぶしが必要か判定する。
 * 透過対応形式（PNG/WebP）かつ background === 'transparent' のときのみ不要。
 */
export function needsBackground(s: OutputSettings): boolean {
  const fmt = FORMATS.find((f) => f.id === s.format);
  return !fmt?.alpha || s.background !== "transparent";
}

/** 出力 W×H の canvas に画像をフィット描画する（等倍・書き出し用） */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: OutputSettings,
  t: Transform,
): void {
  const w = s.width;
  const h = s.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context を取得できませんでした");
  }

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  applyShapeClip(ctx, s);

  if (needsBackground(s)) {
    ctx.fillStyle = s.background === "transparent" ? "#ffffff" : s.background;
    ctx.fillRect(0, 0, w, h);
  }

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const { ox, oy } = focusOffset(iw, ih, s, t);
  ctx.translate(w / 2 + ox, h / 2 + oy);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);

  const { sx, sy } = effectiveScale(iw, ih, s, t);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (-iw * sx) / 2, (-ih * sy) / 2, iw * sx, ih * sy);
  ctx.restore();
}

/**
 * サムネ・プレビュー用の縮小描画。
 * `maxDim` を上限に width/height を等倍縮小し、t.x/t.y も同係数で縮小する（負荷軽減目的。書き出しには使わない）。
 */
export function renderPreviewCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: OutputSettings,
  t: Transform,
  maxDim: number = PREVIEW_MAX_DIM,
): void {
  const factor = Math.min(1, maxDim / Math.max(s.width, s.height));
  const previewSettings: OutputSettings = {
    ...s,
    width: Math.max(1, Math.round(s.width * factor)),
    height: Math.max(1, Math.round(s.height * factor)),
  };
  // focus は正規化（サイズ非依存）なので、縮小しても transform はそのまま使える
  renderToCanvas(canvas, img, previewSettings, t);
}

/** 形状プレビュー枠（CSS）用の border-radius 値を算出する */
export function shapeRadiusCSS(shape: ShapeType, w: number, h: number, radiusPct: number): string {
  if (shape === "rounded") return `${(Math.min(w, h) * radiusPct) / 100}px`;
  if (shape === "circle" || shape === "ellipse") return "50%";
  return "0";
}

/** 編集画面のステージ内に出力枠を表示する矩形（左上座標・サイズ・表示倍率） */
export interface StageFrame {
  fw: number;
  fh: number;
  fx: number;
  fy: number;
  scale: number;
}

/** ステージサイズと出力アスペクト比から、出力枠の表示矩形を算出する */
export function computeStageFrame(
  stageW: number,
  stageH: number,
  s: OutputSettings,
  pad = 64,
): StageFrame {
  const aspect = s.width / s.height;
  let fw = stageW - pad * 2;
  let fh = fw / aspect;
  if (fh > stageH - pad * 2) {
    fh = stageH - pad * 2;
    fw = fh * aspect;
  }
  fw = Math.max(40, fw);
  fh = Math.max(40, fh);
  return { fw, fh, fx: (stageW - fw) / 2, fy: (stageH - fh) / 2, scale: fw / s.width };
}

/**
 * 編集画面のステージ全体に、出力枠の外側にはみ出す部分も含めた元画像を薄く描画する。
 * トリミングで除外される範囲をユーザーが把握できるようにするための背景。
 */
export function renderBackdropCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: OutputSettings,
  t: Transform,
  frame: StageFrame,
  stageW: number,
  stageH: number,
): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = stageW * dpr;
  canvas.height = stageH * dpr;
  canvas.style.width = `${stageW}px`;
  canvas.style.height = `${stageH}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, stageW, stageH);
  ctx.save();
  ctx.translate(frame.fx, frame.fy);
  ctx.scale(frame.scale, frame.scale);
  ctx.globalAlpha = 0.26;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const { ox, oy } = focusOffset(iw, ih, s, t);
  ctx.translate(s.width / 2 + ox, s.height / 2 + oy);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);

  const { sx, sy } = effectiveScale(iw, ih, s, t);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (-iw * sx) / 2, (-ih * sy) / 2, iw * sx, ih * sy);
  ctx.restore();
}

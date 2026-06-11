/**
 * アップロード画面の「サンプル画像で試す」用デモ画像生成。
 * Canvas でグラデーション画像を描画し、File/ImageItem として扱えるようにする。
 * 外部リソースを一切使わないため、ネットワークアクセスは発生しない。
 */

import { DEMO_IMAGE_COUNT } from "./constants";
import { roundRectPath } from "./fit";
import { defaultTransform } from "./types";
import type { ImageItem } from "./types";

type DemoKind = "room" | "product" | "arch" | "food";

interface DemoDef {
  name: string;
  w: number;
  h: number;
  kind: DemoKind;
  pal: readonly [string, string];
  tag: string;
}

const DEMO_DEFS: readonly DemoDef[] = [
  {
    name: "客室_デラックスツイン.jpg",
    w: 1600,
    h: 1067,
    kind: "room",
    pal: ["#cda97a", "#6e5236"],
    tag: "HOTEL",
  },
  {
    name: "product_leather_bag.jpg",
    w: 1200,
    h: 1200,
    kind: "product",
    pal: ["#e3c9a8", "#9c7b54"],
    tag: "EC",
  },
  {
    name: "外観_エントランス.jpg",
    w: 1500,
    h: 1000,
    kind: "arch",
    pal: ["#a9c3d8", "#43617a"],
    tag: "REAL ESTATE",
  },
  {
    name: "cafe_latte_top.jpg",
    w: 1080,
    h: 1350,
    kind: "food",
    pal: ["#d8b48c", "#7a4a2b"],
    tag: "BLOG",
  },
  {
    name: "sneaker_white.png",
    w: 1400,
    h: 933,
    kind: "product",
    pal: ["#dfe5ec", "#9aa6b6"],
    tag: "EC",
  },
  {
    name: "リビング_南向き.jpg",
    w: 1000,
    h: 1500,
    kind: "arch",
    pal: ["#cbd3c0", "#5e6e52"],
    tag: "REAL ESTATE",
  },
  {
    name: "デスク周り_物撮り.jpg",
    w: 1600,
    h: 900,
    kind: "room",
    pal: ["#d7c2b0", "#6b5240"],
    tag: "BLOG",
  },
  {
    name: "watch_minimal.jpg",
    w: 1200,
    h: 1200,
    kind: "product",
    pal: ["#cfd6dd", "#3e4a57"],
    tag: "EC",
  },
  {
    name: "pool_terrace.jpg",
    w: 1800,
    h: 1012,
    kind: "arch",
    pal: ["#9ad0d8", "#2f6f78"],
    tag: "HOTEL",
  },
  {
    name: "plate_breakfast.jpg",
    w: 1333,
    h: 1000,
    kind: "food",
    pal: ["#e6cf9e", "#9c7327"],
    tag: "HOTEL",
  },
];

function drawDemo(def: DemoDef): string {
  const canvas = document.createElement("canvas");
  canvas.width = def.w;
  canvas.height = def.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context を取得できませんでした");
  }

  const [c1, c2] = def.pal;
  const bg = ctx.createLinearGradient(0, 0, def.w, def.h);
  bg.addColorStop(0, c1);
  bg.addColorStop(1, c2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, def.w, def.h);

  const cx = def.w / 2;
  const cy = def.h / 2;
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#ffffff";
  if (def.kind === "product") {
    ctx.beginPath();
    ctx.ellipse(cx, def.h * 0.72, def.w * 0.34, def.h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#ffffff";
    roundRectPath(
      ctx,
      cx - def.w * 0.18,
      cy - def.h * 0.2,
      def.w * 0.36,
      def.h * 0.4,
      def.w * 0.04,
    );
    ctx.fill();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = c2;
    roundRectPath(ctx, cx - def.w * 0.18, cy + def.h * 0.06, def.w * 0.36, def.h * 0.14, 6);
    ctx.fill();
  } else if (def.kind === "room" || def.kind === "arch") {
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, def.h * 0.62, def.w, def.h * 0.38);
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 3; i += 1) {
      roundRectPath(ctx, def.w * (0.12 + i * 0.27), def.h * 0.2, def.w * 0.2, def.h * 0.34, 8);
      ctx.fill();
    }
  } else if (def.kind === "food") {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(def.w, def.h) * 0.32, 0, Math.PI * 2);
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(def.w, def.h) * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = c2;
    ctx.globalAlpha = 0.18;
    ctx.fill();
  }
  ctx.restore();

  const vignette = ctx.createRadialGradient(cx, cy, def.h * 0.2, cx, cy, def.h * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, def.w, def.h);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `600 ${Math.round(def.h * 0.035)}px Outfit, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(def.tag, def.w * 0.045, def.h * 0.045);

  ctx.font = `600 ${Math.round(def.h * 0.05)}px Outfit, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${def.w} × ${def.h}`, def.w * 0.045, def.h * 0.955);

  return canvas.toDataURL("image/jpeg", 0.86);
}

function dataUrlToFile(dataUrl: string, filename: string, mime: string): File {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("サンプル画像の生成に失敗しました"));
    element.src = src;
  });
}

let demoIdCounter = 0;

function createDemoId(): string {
  demoIdCounter += 1;
  return `demo-${demoIdCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

/** サンプル画像を ImageItem として生成する（既存画像と同じ ObjectURL ライフサイクルで扱える） */
export async function createDemoImages(count: number = DEMO_IMAGE_COUNT): Promise<ImageItem[]> {
  const defs = DEMO_DEFS.slice(0, count);
  const items: ImageItem[] = [];

  for (const def of defs) {
    const dataUrl = drawDemo(def);
    const file = dataUrlToFile(dataUrl, def.name, "image/jpeg");
    const objectUrl = URL.createObjectURL(file);
    const element = await loadImage(objectUrl);
    items.push({
      id: createDemoId(),
      file,
      name: def.name,
      objectUrl,
      element,
      naturalWidth: element.naturalWidth,
      naturalHeight: element.naturalHeight,
      transform: defaultTransform(),
      edited: false,
    });
  }

  return items;
}

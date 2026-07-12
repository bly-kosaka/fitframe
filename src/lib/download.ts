/**
 * ZIP 生成 + ダウンロード（仕様書 §5.7 / §6）。
 * `画像 × 出力プロファイル` の二重ループで renderToCanvas → toBlob → JSZip に追加し、
 * 1ファイルごとに requestAnimationFrame で UI スレッドを解放しながら進捗を通知する。
 * ZIP のフォルダー構成は global.zipLayout（byLabel / byImage / flat）で切り替える。
 */

import JSZip from "jszip";

import { renderToCanvas } from "./fit";
import { resolveBaseName, resolveExtension, sanitizeLabel } from "./filename";
import { toSettings } from "./presets";
import type { ExportResult, ImageItem, OutputConfig, OutputProfile, OutputSettings } from "./types";

function canvasToBlob(canvas: HTMLCanvasElement, settings: OutputSettings): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const quality = settings.format === "image/png" ? undefined : settings.quality;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("画像の書き出しに失敗しました"));
      },
      settings.format,
      quality,
    );
  });
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** Blob をファイルとしてダウンロードさせる */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** ある集合の中で一意になるよう `_2`, `_3`… を付与する */
function uniqueIn(used: Map<string, number>, base: string): string {
  const n = used.get(base) ?? 0;
  used.set(base, n + 1);
  return n === 0 ? base : `${base}_${n + 1}`;
}

/** 出力1件分の計画（どの画像×プロファイルを、どのフォルダー/ファイル名で出すか） */
export interface OutputEntry {
  id: string;
  profileId: string;
  profile: OutputProfile;
  settings: OutputSettings;
  /** ZIP 内フォルダー（'' はルート） */
  folder: string;
  /** 拡張子つきファイル名 */
  name: string;
  /** フォルダー込みの表示用パス */
  path: string;
}

/**
 * `画像 × プロファイル` の全出力を、ZIP 構成に応じたフォルダー/ファイル名まで確定して列挙する。
 * 書き出し（exportZip）と進捗表示（ProgressList）が同じ順序・同じ名前を共有するための単一の真実。
 */
export function planOutputs(items: ImageItem[], config: OutputConfig): OutputEntry[] {
  const { profiles, global } = config;
  const layout = global.zipLayout;
  const total = items.length;
  const multi = profiles.length > 1;

  // byLabel: プロファイルごとのフォルダー名（ラベル→一意）
  const labelFolderUsed = new Map<string, number>();
  const labelFolder = new Map<string, string>();
  for (const p of profiles) {
    const base = sanitizeLabel(p.label) || `${p.width}x${p.height}`;
    labelFolder.set(p.id, uniqueIn(labelFolderUsed, base));
  }

  // byImage: 画像ごとのフォルダー名（元ファイル名→一意）
  const imageFolderUsed = new Map<string, number>();
  const imageFolder = new Map<string, string>();
  for (const item of items) {
    const base = sanitizeLabel(item.name.replace(/\.[^.]+$/, "")) || "image";
    imageFolder.set(item.id, uniqueIn(imageFolderUsed, base));
  }

  // ファイル名の重複回避（フォルダー単位で dedup）
  const nameUsed = new Map<string, Map<string, number>>();
  const dedup = (folder: string, base: string): string => {
    let m = nameUsed.get(folder);
    if (!m) {
      m = new Map();
      nameUsed.set(folder, m);
    }
    return uniqueIn(m, base);
  };

  const entries: OutputEntry[] = [];
  items.forEach((item, index) => {
    profiles.forEach((profile) => {
      const settings = toSettings(global, profile);
      const ext = resolveExtension(settings);
      let folder = "";
      let base: string;

      if (layout === "byLabel") {
        folder = labelFolder.get(profile.id) ?? "";
        base = resolveBaseName(item, settings, index, total, profile.label);
      } else if (layout === "byImage") {
        folder = imageFolder.get(item.id) ?? "";
        base = sanitizeLabel(profile.label) || `${profile.width}x${profile.height}`;
      } else {
        // flat: 全ファイルを同一階層に。複数プロファイルかつ {label} 未指定なら衝突回避のため付与
        base = resolveBaseName(item, settings, index, total, profile.label);
        if (multi && !(global.namePattern || "").includes("{label}")) {
          const lbl = sanitizeLabel(profile.label) || `${profile.width}x${profile.height}`;
          base = `${base}_${lbl}`;
        }
      }

      const finalBase = dedup(folder, base);
      const name = `${finalBase}.${ext}`;
      const path = folder ? `${folder}/${name}` : name;
      entries.push({ id: item.id, profileId: profile.id, profile, settings, folder, name, path });
    });
  });

  return entries;
}

export interface ExportOptions {
  /** 1ファイル処理するごとに呼ばれる進捗コールバック */
  onProgress?: (done: number, total: number, result: ExportResult) => void;
}

export interface ExportSingleResult {
  result: ExportResult;
  blob: Blob;
  name: string;
}

export interface ExportZipResult {
  results: ExportResult[];
  zipBlob: Blob;
  zipName: string;
}

/** 出力が1件（画像1枚×プロファイル1件）のときに直接ダウンロードする（ZIP なし） */
export async function exportSingle(
  items: ImageItem[],
  config: OutputConfig,
  options: ExportOptions = {},
): Promise<ExportSingleResult> {
  const [entry] = planOutputs(items, config);
  const item = items.find((im) => im.id === entry.id)!;
  const canvas = document.createElement("canvas");
  renderToCanvas(canvas, item.element, entry.settings, item.transform);
  const blob = await canvasToBlob(canvas, entry.settings);
  const result: ExportResult = {
    id: entry.id,
    profileId: entry.profileId,
    name: entry.name,
    bytes: blob.size,
  };
  options.onProgress?.(1, 1, result);
  await nextFrame();
  triggerDownload(blob, entry.name);
  return { result, blob, name: entry.name };
}

/** `画像 × プロファイル` を出力解像度で描画し、ZIP にまとめてダウンロードする */
export async function exportZip(
  items: ImageItem[],
  config: OutputConfig,
  options: ExportOptions = {},
): Promise<ExportZipResult> {
  const zip = new JSZip();
  const entries = planOutputs(items, config);
  const results: ExportResult[] = [];
  const canvas = document.createElement("canvas");
  const byId = new Map(items.map((im) => [im.id, im]));

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const item = byId.get(entry.id);
    if (!item) continue;
    renderToCanvas(canvas, item.element, entry.settings, item.transform);
    const blob = await canvasToBlob(canvas, entry.settings);
    zip.file(entry.path, blob);

    const result: ExportResult = {
      id: entry.id,
      profileId: entry.profileId,
      name: entry.name,
      bytes: blob.size,
    };
    results.push(result);
    options.onProgress?.(i + 1, entries.length, result);

    await nextFrame();
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const zipName = `FitFrame_${items.length}imgs_${config.profiles.length}sizes.zip`;
  triggerDownload(zipBlob, zipName);

  return { results, zipBlob, zipName };
}

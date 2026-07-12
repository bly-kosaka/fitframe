/**
 * 投入ファイルの検証 + ImageItem への変換（仕様書 §7）。
 * 違反ファイルは RejectedFile として収集し、受理分のみ ImageItem 化する。
 * 画像はネットワークへ送信せず、createObjectURL でローカル参照のみ行う。
 */

import {
  ACCEPTED_MIME_TYPES,
  MAX_DIMENSION_PX,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
} from "./constants";
import { convertHeicToPng, isHeic } from "./heic";
import { defaultTransform } from "./types";
import type { ImageItem, RejectedFile } from "./types";
import { isUnlocked } from "./unlock";

let idCounter = 0;

function createImageId(): string {
  idCounter += 1;
  return `img-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

function isAcceptedMime(type: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(type);
}

interface LoadedImage {
  element: HTMLImageElement;
  objectUrl: string;
}

/** Blob（元ファイル、または HEIC 変換後の PNG）から <img> 要素を生成する。 */
function loadImageElement(source: Blob): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(source);
    const element = new Image();
    element.onload = () => resolve({ element, objectUrl });
    element.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    element.src = objectUrl;
  });
}

export interface ProcessFilesResult {
  accepted: ImageItem[];
  rejected: RejectedFile[];
}

/** 取り込み進捗（HEIC 変換など時間のかかる処理の可視化用）。 */
export interface ProcessProgress {
  /** 処理を終えたファイル数（受理・棄却の合計）。 */
  done: number;
  /** 全ファイル数。 */
  total: number;
  /** いま処理中のファイル名。 */
  currentName?: string;
  /** 現在の処理フェーズ。 */
  phase: "converting" | "decoding";
}

/**
 * 投入ファイル群を検証し、受理分を ImageItem に変換する。
 * `existingCount` は投入前に保持済みの画像枚数（合計20枚の上限判定に使用）。
 */
export async function processFiles(
  files: File[],
  existingCount: number,
  onProgress?: (progress: ProcessProgress) => void,
): Promise<ProcessFilesResult> {
  const accepted: ImageItem[] = [];
  const rejected: RejectedFile[] = [];
  let count = existingCount;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const heic = isHeic(file);
    onProgress?.({
      done: i,
      total: files.length,
      currentName: file.name,
      phase: heic ? "converting" : "decoding",
    });

    if (!isUnlocked() && count >= MAX_FILE_COUNT) {
      rejected.push({ name: file.name, reason: "count", message: "上限20枚を超えています" });
      continue;
    }
    // MIME が空/octet-stream で来る HEIC（iOS）を拾うため isHeic も許可条件に含める。
    if (!isAcceptedMime(file.type) && !heic) {
      rejected.push({ name: file.name, reason: "mime", message: "対応していない形式です" });
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      rejected.push({ name: file.name, reason: "size", message: "20MBを超えています" });
      continue;
    }

    // HEIC/HEIF は <img> でデコードできないため、PNG へ変換してから取り込む。
    let decodeSource: Blob = file;
    if (heic) {
      try {
        decodeSource = await convertHeicToPng(file);
      } catch {
        rejected.push({ name: file.name, reason: "decode", message: "HEICを変換できませんでした" });
        continue;
      }
    }

    const loaded = await loadImageElement(decodeSource);
    if (!loaded) {
      rejected.push({ name: file.name, reason: "decode", message: "画像を読み込めませんでした" });
      continue;
    }

    const { element, objectUrl } = loaded;
    if (element.naturalWidth > MAX_DIMENSION_PX || element.naturalHeight > MAX_DIMENSION_PX) {
      URL.revokeObjectURL(objectUrl);
      rejected.push({
        name: file.name,
        reason: "dimension",
        message: "サイズが大きすぎます（最大10000px）",
      });
      continue;
    }

    accepted.push({
      id: createImageId(),
      file,
      name: file.name,
      objectUrl,
      element,
      naturalWidth: element.naturalWidth,
      naturalHeight: element.naturalHeight,
      transform: defaultTransform(),
      edited: false,
    });
    count += 1;
  }

  onProgress?.({ done: files.length, total: files.length, phase: "decoding" });
  return { accepted, rejected };
}

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
import { defaultTransform } from "./types";
import type { ImageItem, RejectedFile } from "./types";

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

function loadImageElement(file: File): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
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

/**
 * 投入ファイル群を検証し、受理分を ImageItem に変換する。
 * `existingCount` は投入前に保持済みの画像枚数（合計100枚の上限判定に使用）。
 */
export async function processFiles(
  files: File[],
  existingCount: number,
): Promise<ProcessFilesResult> {
  const accepted: ImageItem[] = [];
  const rejected: RejectedFile[] = [];
  let count = existingCount;

  for (const file of files) {
    if (count >= MAX_FILE_COUNT) {
      rejected.push({ name: file.name, reason: "count", message: "上限100枚を超えています" });
      continue;
    }
    if (!isAcceptedMime(file.type)) {
      rejected.push({ name: file.name, reason: "mime", message: "対応していない形式です" });
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      rejected.push({ name: file.name, reason: "size", message: "20MBを超えています" });
      continue;
    }

    const loaded = await loadImageElement(file);
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

  return { accepted, rejected };
}

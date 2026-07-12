/**
 * HEIC/HEIF 変換ヘルパー（PoC）。
 * 通常利用者に WASM(約3MB) を負わせないよう、HEIC が投入された時だけ
 * heic-to/next を動的 import する。バイナリは JS にインライン埋め込み
 * されており外部ネットワークへは一切アクセスしない。
 */

/** 拡張子 / MIME による同期判定（iOS は MIME が空/octet-stream で来ることがある）。 */
export function isHeic(file: File): boolean {
  const t = file.type.toLowerCase();
  if (t === "image/heic" || t === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name);
}

let modPromise: Promise<typeof import("heic-to/next")> | null = null;

/** heic-to/next を一度だけ読み込む（動的 import のキャッシュ）。 */
function loadHeic() {
  return (modPromise ??= import("heic-to/next"));
}

/** HEIC/HEIF Blob を PNG Blob へ変換する。 */
export async function convertHeicToPng(file: File): Promise<Blob> {
  const { heicTo } = await loadHeic();
  return heicTo({ blob: file, type: "image/png" });
}

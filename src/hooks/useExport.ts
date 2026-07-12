"use client";

/**
 * ダウンロード画面のZIP生成フロー（仕様書 §4.4 / §5.5）。
 * `画像 × 出力プロファイル` の二重ループで書き出し、進捗（done/results）と
 * 完了後の再ダウンロード用 zipBlob/zipName を保持する。
 */

import { useCallback, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { exportSingle, exportZip, triggerDownload } from "@/lib/download";
import type { ExportPhase, ExportResult, ImageItem, OutputConfig, ToastKind } from "@/lib/types";

export interface UseExportResult {
  phase: ExportPhase;
  done: number;
  total: number;
  results: ExportResult[];
  isSingle: boolean;
  start: () => Promise<void>;
  redownload: () => void;
}

export function useExport(
  images: ImageItem[],
  config: OutputConfig,
  pushToast: (message: string, kind?: ToastKind) => void,
): UseExportResult {
  const [phase, setPhase] = useState<ExportPhase>("ready");
  const [done, setDone] = useState(0);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const total = images.length * config.profiles.length;
  const isSingle = total === 1;

  const start = useCallback(async () => {
    setPhase("processing");
    setDone(0);
    setResults([]);
    setOutput(null);

    const onProgress = (doneCount: number, _total: number, result: ExportResult) => {
      setDone(doneCount);
      setResults((prev) => [...prev, result]);
    };

    try {
      if (isSingle) {
        const { blob, name } = await exportSingle(images, config, { onProgress });
        setOutput({ blob, name });
        setPhase("done");
        pushToast("画像をダウンロードしました");
        trackEvent("resize_export_complete", {
          image_count: images.length,
          is_zip: false,
          format: config.global.format,
          fit_mode: config.global.fit,
        });
      } else {
        const { zipBlob, zipName } = await exportZip(images, config, { onProgress });
        setOutput({ blob: zipBlob, name: zipName });
        setPhase("done");
        pushToast("ZIPをダウンロードしました");
        trackEvent("resize_export_complete", {
          image_count: images.length,
          is_zip: true,
          format: config.global.format,
          fit_mode: config.global.fit,
        });
      }
    } catch {
      setPhase("ready");
      pushToast(isSingle ? "画像の書き出しに失敗しました" : "ZIPの生成に失敗しました", "warn");
    }
  }, [images, config, pushToast, isSingle]);

  const redownload = useCallback(() => {
    if (output) triggerDownload(output.blob, output.name);
  }, [output]);

  return { phase, done, total, results, isSingle, start, redownload };
}

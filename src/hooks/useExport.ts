"use client";

/**
 * ダウンロード画面のZIP生成フロー（仕様書 §5.5）。
 * lib/download.ts の exportZip を呼び出し、進捗（done/results）と
 * 完了後の再ダウンロード用 zipBlob/zipName を保持する。
 */

import { useCallback, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { exportSingle, exportZip, triggerDownload } from "@/lib/download";
import type { ExportPhase, ExportResult, ImageItem, OutputSettings, ToastKind } from "@/lib/types";

export interface UseExportResult {
  phase: ExportPhase;
  done: number;
  results: ExportResult[];
  isSingle: boolean;
  start: () => Promise<void>;
  redownload: () => void;
}

export function useExport(
  images: ImageItem[],
  settings: OutputSettings,
  pushToast: (message: string, kind?: ToastKind) => void,
): UseExportResult {
  const [phase, setPhase] = useState<ExportPhase>("ready");
  const [done, setDone] = useState(0);
  const [results, setResults] = useState<ExportResult[]>([]);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const isSingle = images.length === 1;

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
        const { blob, name } = await exportSingle(images, settings, { onProgress });
        setOutput({ blob, name });
        setPhase("done");
        pushToast("画像をダウンロードしました");
        trackEvent("resize_export_complete", {
          image_count: images.length,
          is_zip: false,
          format: settings.format,
          fit_mode: settings.fit,
        });
      } else {
        const { zipBlob, zipName } = await exportZip(images, settings, { onProgress });
        setOutput({ blob: zipBlob, name: zipName });
        setPhase("done");
        pushToast("ZIPをダウンロードしました");
        trackEvent("resize_export_complete", {
          image_count: images.length,
          is_zip: true,
          format: settings.format,
          fit_mode: settings.fit,
        });
      }
    } catch {
      setPhase("ready");
      pushToast(isSingle ? "画像の書き出しに失敗しました" : "ZIPの生成に失敗しました", "warn");
    }
  }, [images, settings, pushToast, isSingle]);

  const redownload = useCallback(() => {
    if (output) triggerDownload(output.blob, output.name);
  }, [output]);

  return { phase, done, results, isSingle, start, redownload };
}

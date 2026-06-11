"use client";

/**
 * ダウンロード画面のZIP生成フロー（仕様書 §5.5）。
 * lib/download.ts の exportZip を呼び出し、進捗（done/results）と
 * 完了後の再ダウンロード用 zipBlob/zipName を保持する。
 */

import { useCallback, useState } from "react";

import { exportZip, triggerDownload } from "@/lib/download";
import type { ExportPhase, ExportResult, ImageItem, OutputSettings, ToastKind } from "@/lib/types";

export interface UseExportResult {
  phase: ExportPhase;
  done: number;
  results: ExportResult[];
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
  const [zip, setZip] = useState<{ blob: Blob; name: string } | null>(null);

  const start = useCallback(async () => {
    setPhase("processing");
    setDone(0);
    setResults([]);
    setZip(null);

    try {
      const { zipBlob, zipName } = await exportZip(images, settings, {
        onProgress: (doneCount, _total, result) => {
          setDone(doneCount);
          setResults((prev) => [...prev, result]);
        },
      });
      setZip({ blob: zipBlob, name: zipName });
      setPhase("done");
      pushToast("ZIPをダウンロードしました");
    } catch {
      setPhase("ready");
      pushToast("ZIPの生成に失敗しました", "warn");
    }
  }, [images, settings, pushToast]);

  const redownload = useCallback(() => {
    if (zip) triggerDownload(zip.blob, zip.name);
  }, [zip]);

  return { phase, done, results, start, redownload };
}

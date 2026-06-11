"use client";

/**
 * アップロード画面のファイル受け取り処理。
 * `processFiles` で検証し、受理分はストアへ追加して `settings` へ遷移する（仕様書 §5.1）。
 */

import { useCallback, useState } from "react";

import { DECODED_MEMORY_WARNING_BYTES } from "@/lib/constants";
import { createDemoImages } from "@/lib/demo";
import { formatBytes } from "@/lib/format";
import type { RejectedFile } from "@/lib/types";
import { processFiles } from "@/lib/validate";

import { useImageStore } from "./useImageStore";
import { useToasts } from "./useToasts";

export interface UseImageUploadResult {
  rejectedFiles: RejectedFile[];
  isProcessing: boolean;
  handleFiles: (files: File[]) => Promise<void>;
  handleDemo: () => Promise<void>;
  dismissRejected: () => void;
}

export function useImageUpload(): UseImageUploadResult {
  const { state, addImages, goToStep } = useImageStore();
  const { pushToast } = useToasts();
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setIsProcessing(true);
      const { accepted, rejected } = await processFiles(files, state.images.length);
      setIsProcessing(false);
      setRejectedFiles(rejected);

      if (accepted.length > 0) {
        addImages(accepted);
        pushToast(`${accepted.length} 枚を読み込みました`);

        const totalDecodedBytes = [...state.images, ...accepted].reduce(
          (sum, img) => sum + img.naturalWidth * img.naturalHeight * 4,
          0,
        );
        if (totalDecodedBytes > DECODED_MEMORY_WARNING_BYTES) {
          pushToast(
            `画像データの合計が約${formatBytes(totalDecodedBytes)}に達しています。枚数や解像度を減らすとブラウザが安定します。`,
            "warn",
          );
        }

        goToStep("settings", true);
        return;
      }
      if (rejected.length > 0) {
        pushToast("読み込める画像がありませんでした", "warn");
      }
    },
    [state.images, addImages, pushToast, goToStep],
  );

  const handleDemo = useCallback(async () => {
    setIsProcessing(true);
    const items = await createDemoImages();
    setIsProcessing(false);
    addImages(items);
    pushToast(`サンプル ${items.length} 枚を読み込みました`);
    goToStep("settings", true);
  }, [addImages, pushToast, goToStep]);

  const dismissRejected = useCallback(() => setRejectedFiles([]), []);

  return { rejectedFiles, isProcessing, handleFiles, handleDemo, dismissRejected };
}

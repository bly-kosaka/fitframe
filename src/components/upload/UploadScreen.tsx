"use client";

import { useCallback, useEffect } from "react";

import { Icon } from "@/components/ui/Icon";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToasts } from "@/hooks/useToasts";

import { Dropzone } from "./Dropzone";
import { RejectedList } from "./RejectedList";
import { ValueProps } from "./ValueProps";

/** アップロード画面：中央レイアウト（ヒーロー → ドロップゾーン → 価値訴求 → 信頼行）（仕様書 §5.1） */
export function UploadScreen() {
  const { rejectedFiles, isProcessing, handleFiles, handleDemo, dismissRejected } =
    useImageUpload();
  const { pushToast } = useToasts();

  const handleClipboard = useCallback(async () => {
    if (!navigator.clipboard?.read) {
      pushToast("このブラウザではクリップボードペーストに対応していません", "warn");
      return;
    }
    try {
      const clipItems = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of clipItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const ext = type.split("/")[1] ?? "png";
            files.push(new File([blob], `clipboard.${ext}`, { type }));
            break;
          }
        }
      }
      if (files.length === 0) {
        pushToast("クリップボードに画像がありません", "warn");
        return;
      }
      handleFiles(files);
    } catch {
      pushToast("クリップボードへのアクセスが拒否されました", "warn");
    }
  }, [handleFiles, pushToast]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const files = items
        .filter((item) => item.type.startsWith("image/"))
        .flatMap((item) => {
          const blob = item.getAsFile();
          if (!blob) return [];
          const ext = item.type.split("/")[1] ?? "png";
          return [new File([blob], `clipboard.${ext}`, { type: item.type })];
        });
      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handleFiles]);

  return (
    <div className="mx-auto w-full max-w-[880px] animate-screen-fade px-4 pb-8 pt-8 sm:px-8 sm:pb-12 sm:pt-14">
      <div className="mb-9 flex flex-col items-center">
        <span className="mb-[18px] inline-block rounded-full bg-accent-weak px-[11px] py-[5px] text-xs font-bold uppercase tracking-[0.12em] text-accent">
          画像フィッティングツール
        </span>
        <h1 className="mb-4 text-center font-display text-[20px] font-semibold leading-[1.18] tracking-[-0.02em] text-text sm:text-[40px]">
          画像のリサイズ＆トリミングを、
          <br />
          <span className="text-accent">ブラウザだけで</span>。
        </h1>
        <p className="mx-auto max-w-[540px] text-center text-[14px] leading-[1.7] text-text-2 sm:text-base">
          複数画像を指定サイズへ一括フィット。Cover / Contain / Stretch
          とマスク形状を選んで、ZIPでまとめてダウンロード。
        </p>
      </div>

      <div className="mb-[30px]">
        <Dropzone onFiles={handleFiles} onDemo={handleDemo} onClipboard={handleClipboard} big />
        {isProcessing && <p className="mt-3 text-center text-[12.5px] text-text-3">読み込み中…</p>}
      </div>

      <RejectedList items={rejectedFiles} onDismiss={dismissRejected} />

      <ValueProps />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-text-2">
          <Icon name="shield" size={15} className="text-ok" />
          ブラウザ内で完結
        </span>
        <span className="h-[3px] w-[3px] rounded-full bg-border-strong" />
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-text-2">
          <Icon name="lock" size={15} className="text-ok" />
          サーバーに保存しません
        </span>
        <span className="h-[3px] w-[3px] rounded-full bg-border-strong" />
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-text-2">
          <Icon name="bolt" size={15} className="text-ok" />
          インストール不要
        </span>
      </div>
    </div>
  );
}

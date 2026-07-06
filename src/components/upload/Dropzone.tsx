"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

import { Icon } from "@/components/ui/Icon";

const ACCEPT = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
};

const FORMAT_LABELS = ["JPG", "PNG", "WebP"];

export interface DropzoneProps {
  onFiles: (files: File[]) => void;
  onDemo: () => void;
  onClipboard: () => void;
  big?: boolean;
}

/** ドラッグ＆ドロップ／クリックでのファイル選択（仕様書 §5.1） */
export function Dropzone({ onFiles, onDemo, onClipboard, big = false }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const all = [...acceptedFiles, ...fileRejections.map((r) => r.file)];
      if (all.length > 0) onFiles(all);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    noClick: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed bg-surface bg-[radial-gradient(120%_120%_at_50%_0%,_#eef1ff_0%,_rgba(255,255,255,0)_55%)] p-9 text-center transition-[border-color,background-color,transform,box-shadow] duration-150 cursor-pointer ${
        isDragActive
          ? "scale-[1.006] border-accent bg-accent-weak shadow-lg"
          : "border-border-strong hover:border-accent hover:shadow-md"
      }`}
      style={{ minHeight: big ? 320 : 260 }}
    >
      <input {...getInputProps()} />
      <div
        className={`mb-[18px] grid h-[60px] w-[60px] place-items-center rounded-2xl bg-accent text-white shadow-[0_8px_20px_rgba(47,84,255,0.36)] transition-transform duration-150 ${
          isDragActive ? "-translate-y-[3px] scale-105" : ""
        }`}
      >
        <Icon name={isDragActive ? "download" : "upload"} size={26} stroke={2} />
      </div>
      <div className="mb-1.5 text-lg font-bold text-text">
        {isDragActive ? "ここにドロップ" : "画像をドラッグ＆ドロップ"}
      </div>
      <div className="mb-4 text-[13.5px] text-text-3">
        またはクリックしてファイルを選択 ・ 複数枚まとめてOK
      </div>
      <div className="mb-5 flex gap-[7px]">
        {FORMAT_LABELS.map((f) => (
          <span
            key={f}
            className="rounded-[6px] border border-border bg-surface-2 px-[9px] py-[3px] font-display text-[11px] font-semibold text-text-2"
          >
            {f}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClipboard();
          }}
          className="inline-flex items-center gap-[7px] rounded-[8px] border border-border-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-text transition-colors duration-150 hover:border-accent hover:bg-surface-2 hover:text-accent"
        >
          <Icon name="clipboard" size={14} />
          クリップボードから貼り付け
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDemo();
          }}
          className="inline-flex items-center gap-[7px] rounded-[8px] border border-border-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-text transition-colors duration-150 hover:border-accent hover:bg-surface-2 hover:text-accent"
        >
          <Icon name="bolt" size={14} />
          サンプル画像で試す
        </button>
      </div>
    </div>
  );
}

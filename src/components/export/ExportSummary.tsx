import { FIT_MODES, FORMATS, SHAPES } from "@/lib/presets";
import type { ImageItem, OutputConfig } from "@/lib/types";

export interface ExportSummaryProps {
  images: ImageItem[];
  config: OutputConfig;
}

const ZIP_LAYOUT_LABEL: Record<string, string> = {
  byLabel: "ラベル別フォルダー",
  byImage: "画像別フォルダー",
  flat: "フォルダーなし",
};

/** 出力内容の要約カード（仕様書 §4.4 / §5.5 `.out-summary`） */
export function ExportSummary({ images, config }: ExportSummaryProps) {
  const { profiles, global } = config;
  const fmt = FORMATS.find((f) => f.id === global.format);
  const fitLabel = FIT_MODES.find((f) => f.id === global.fit)?.label ?? "";
  const shapeLabel = SHAPES.find((s) => s.id === global.shape)?.label ?? "";
  const formatLabel =
    fmt && fmt.ext !== "png"
      ? `${fmt.label} / ${Math.round(global.quality * 100)}%`
      : (fmt?.label ?? "");

  const sizeText =
    profiles.length === 1
      ? `${profiles[0].width}×${profiles[0].height}`
      : `${profiles.length} サイズ`;

  const items: Array<{ k: string; v: string; mono?: boolean }> = [
    { k: "枚数 × サイズ", v: `${images.length} 枚 × ${profiles.length}`, mono: true },
    { k: "出力ファイル数", v: `${images.length * profiles.length} 個`, mono: true },
    { k: "出力サイズ", v: sizeText, mono: true },
    { k: "ZIP 構成", v: ZIP_LAYOUT_LABEL[global.zipLayout] ?? global.zipLayout },
    { k: "形式", v: formatLabel },
    { k: "形状 / fit", v: `${shapeLabel} / ${fitLabel}` },
  ];

  return (
    <div className="mb-3.5 grid grid-cols-1 rounded-md border border-border bg-surface-2 sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={item.k}
          className={[
            "flex items-center justify-between gap-2.5 px-[18px] py-[9px] sm:py-[11px]",
            i < items.length - 1 ? "border-b border-border" : "",
            i % 2 === 0 && i < items.length - 2 ? "sm:border-b sm:border-border" : "",
            i >= items.length - 2 ? "sm:border-b-0" : "",
            i % 2 === 0 ? "sm:border-r sm:border-border sm:pr-4 sm:pl-[18px]" : "sm:pl-4 sm:pr-[18px]",
          ].filter(Boolean).join(" ")}
        >
          <span className="whitespace-nowrap text-xs text-text-3">{item.k}</span>
          <span
            className={`whitespace-nowrap text-right text-[12px] font-semibold text-text sm:text-[13px] ${item.mono ? "mono-num" : ""}`}
          >
            {item.v}
          </span>
        </div>
      ))}
    </div>
  );
}

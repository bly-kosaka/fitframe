import { FIT_MODES, FORMATS, SHAPES } from "@/lib/presets";
import type { ImageItem, OutputSettings } from "@/lib/types";

export interface ExportSummaryProps {
  images: ImageItem[];
  settings: OutputSettings;
}

/** 出力内容の要約カード（仕様書 §5.5 `.out-summary`） */
export function ExportSummary({ images, settings }: ExportSummaryProps) {
  const fmt = FORMATS.find((f) => f.id === settings.format);
  const fitLabel = FIT_MODES.find((f) => f.id === settings.fit)?.label ?? "";
  const shapeLabel = SHAPES.find((s) => s.id === settings.shape)?.label ?? "";
  const formatLabel =
    fmt && fmt.ext !== "png"
      ? `${fmt.label} / ${Math.round(settings.quality * 100)}%`
      : (fmt?.label ?? "");

  const items: Array<{ k: string; v: string; mono?: boolean }> = [
    { k: "枚数", v: `${images.length} 枚`, mono: true },
    { k: "出力サイズ", v: `${settings.width}×${settings.height}`, mono: true },
    { k: "形式", v: formatLabel },
    { k: "形状", v: `${shapeLabel} / ${fitLabel}` },
  ];

  return (
    <div className="mb-3.5 grid grid-cols-2 rounded-md border border-border bg-surface-2 px-[18px]">
      {items.map((item, i) => (
        <div
          key={item.k}
          className={`flex items-center justify-between gap-2.5 py-[11px] ${
            i % 2 === 0 ? "border-r border-border pr-4" : "pl-4"
          } ${i < 2 ? "border-b border-border" : ""}`}
        >
          <span className="whitespace-nowrap text-xs text-text-3">{item.k}</span>
          <span
            className={`whitespace-nowrap text-right text-[13px] font-semibold text-text ${item.mono ? "mono-num" : ""}`}
          >
            {item.v}
          </span>
        </div>
      ))}
    </div>
  );
}

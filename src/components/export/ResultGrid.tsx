import { FittedThumb } from "@/components/ui/FittedThumb";
import { RESULT_THUMB_MAX_DIM } from "@/lib/constants";
import { shapeRadiusCSS } from "@/lib/fit";
import type { ExportResult, ImageItem, OutputSettings } from "@/lib/types";

export interface ResultGridProps {
  images: ImageItem[];
  settings: OutputSettings;
  results: ExportResult[];
}

const MAX_VISIBLE = 12;

/** 書き出し完了後のサムネイル一覧（仕様書 §5.5 `.done-grid`） */
export function ResultGrid({ images, settings, results }: ResultGridProps) {
  const visible = results.slice(0, MAX_VISIBLE);
  const remaining = results.length - visible.length;
  const radius = shapeRadiusCSS(
    settings.shape,
    90,
    (90 * settings.height) / settings.width,
    settings.radius,
  );

  return (
    <div className="mb-6 mt-1 grid grid-cols-6 gap-2">
      {visible.map((r) => {
        const item = images.find((im) => im.id === r.id);
        if (!item) return null;
        return (
          <div
            key={r.id}
            className="checker overflow-hidden border border-border shadow-xs"
            style={{ aspectRatio: `${settings.width} / ${settings.height}`, borderRadius: radius }}
          >
            <FittedThumb
              element={item.element}
              settings={settings}
              transform={item.transform}
              maxDim={RESULT_THUMB_MAX_DIM}
            />
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="mono-num grid place-items-center rounded-[8px] border border-border bg-surface-2 text-[13px] font-bold text-text-2">
          +{remaining}
        </div>
      )}
    </div>
  );
}

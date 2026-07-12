import { FittedThumb } from "@/components/ui/FittedThumb";
import { RESULT_THUMB_MAX_DIM } from "@/lib/constants";
import { shapeRadiusCSS } from "@/lib/fit";
import { toSettings } from "@/lib/presets";
import type { ExportResult, ImageItem, OutputConfig } from "@/lib/types";

export interface ResultGridProps {
  images: ImageItem[];
  config: OutputConfig;
  results: ExportResult[];
}

const MAX_VISIBLE = 12;

/** 書き出し完了後のサムネイル一覧（`画像 × プロファイル`。仕様書 §4.4 / §5.5） */
export function ResultGrid({ images, config, results }: ResultGridProps) {
  const { profiles, global } = config;
  const visible = results.slice(0, MAX_VISIBLE);
  const remaining = results.length - visible.length;

  return (
    <div className="mb-6 mt-1 grid grid-cols-6 gap-2">
      {visible.map((r, i) => {
        const item = images.find((im) => im.id === r.id);
        const profile = profiles.find((p) => p.id === r.profileId) ?? profiles[0];
        if (!item || !profile) return null;
        const s = toSettings(global, profile);
        const radius = shapeRadiusCSS(global.shape, 90, (90 * profile.height) / profile.width, global.radius);
        return (
          <div
            key={`${r.id}-${r.profileId}-${i}`}
            className="checker overflow-hidden border border-border shadow-xs"
            style={{ aspectRatio: `${profile.width} / ${profile.height}`, borderRadius: radius }}
          >
            <FittedThumb
              element={item.element}
              settings={s}
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

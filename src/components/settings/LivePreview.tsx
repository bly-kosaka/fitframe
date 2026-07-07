import { FittedThumb } from "@/components/ui/FittedThumb";
import { STRIP_THUMB_MAX_DIM } from "@/lib/constants";
import { estimateBytes, formatBytes } from "@/lib/format";
import { shapeRadiusCSS } from "@/lib/fit";
import type { ImageItem, OutputSettings } from "@/lib/types";

export interface LivePreviewProps {
  settings: OutputSettings;
  images: ImageItem[];
}

const STRIP_LIMIT = 5;

/** 先頭画像へのライブプレビュー＋一括適用イメージのサムネ列（仕様書 §5.2） */
export function LivePreview({ settings, images }: LivePreviewProps) {
  const rep = images[0];
  const previewRadius = shapeRadiusCSS(
    settings.shape,
    400,
    (400 * settings.height) / settings.width,
    settings.radius,
  );

  return (
    <aside className="hidden overflow-y-auto border-l border-border bg-surface md:col-start-2 md:row-start-1 md:block">
      <div className="px-[22px] py-6">
        <div className="mb-3.5 flex items-baseline justify-between text-[13px] font-bold text-text">
          <span>プレビュー</span>
          <span className="mono-num text-[11.5px] font-medium text-text-3">
            {settings.width} × {settings.height} px
          </span>
        </div>

        <div className="checker grid min-h-[240px] place-items-center rounded-md border border-border p-[22px]">
          {rep ? (
            <div
              className="mx-auto max-h-[320px] w-full max-w-[320px] overflow-hidden shadow-md"
              style={{
                aspectRatio: `${settings.width} / ${settings.height}`,
                borderRadius: previewRadius,
              }}
            >
              <FittedThumb
                element={rep.element}
                settings={settings}
                transform={rep.transform}
                maxDim={600}
              />
            </div>
          ) : (
            <div className="text-[13px] text-text-3">画像がありません</div>
          )}
        </div>

        {rep && (
          <div className="mt-[18px] flex flex-col gap-px">
            <div className="flex items-center justify-between border-b border-border py-2 text-[12.5px]">
              <span className="text-text-3">元画像</span>
              <span className="mono-num font-semibold text-text">
                {rep.naturalWidth}×{rep.naturalHeight}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2 text-[12.5px]">
              <span className="text-text-3">推定サイズ / 枚</span>
              <span className="mono-num font-semibold text-text">
                {formatBytes(estimateBytes(settings))}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-[12.5px]">
              <span className="text-text-3">合計枚数</span>
              <span className="mono-num font-semibold text-text">{images.length} 枚</span>
            </div>
          </div>
        )}

        {images.length > 1 && (
          <div className="mt-[18px]">
            <div className="mb-[9px] text-[11px] font-bold text-text-3">一括適用イメージ</div>
            <div className="flex items-center gap-[7px]">
              {images.slice(0, STRIP_LIMIT).map((im) => (
                <div
                  key={im.id}
                  className="checker w-[52px] flex-none overflow-hidden border border-border shadow-xs"
                  style={{
                    aspectRatio: `${settings.width} / ${settings.height}`,
                    borderRadius: shapeRadiusCSS(
                      settings.shape,
                      60,
                      (60 * settings.height) / settings.width,
                      settings.radius,
                    ),
                  }}
                >
                  <FittedThumb
                    element={im.element}
                    settings={settings}
                    transform={im.transform}
                    maxDim={STRIP_THUMB_MAX_DIM}
                  />
                </div>
              ))}
              {images.length > STRIP_LIMIT && (
                <div className="mono-num grid h-9 w-9 flex-none place-items-center rounded-[8px] border border-border bg-surface-2 text-xs font-semibold text-text-2">
                  +{images.length - STRIP_LIMIT}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

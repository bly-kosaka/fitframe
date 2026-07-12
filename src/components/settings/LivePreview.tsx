import { FittedThumb } from "@/components/ui/FittedThumb";
import { STRIP_THUMB_MAX_DIM } from "@/lib/constants";
import { shapeRadiusCSS } from "@/lib/fit";
import { estimateBytes, formatBytes } from "@/lib/format";
import { toSettings } from "@/lib/presets";
import { resolveTransform } from "@/lib/types";
import type { ImageItem, OutputConfig } from "@/lib/types";

export interface LivePreviewProps {
  config: OutputConfig;
  images: ImageItem[];
}

/** 先頭画像 × 各プロファイルのライブプレビュー列（仕様書 §4.1） */
export function LivePreview({ config, images }: LivePreviewProps) {
  const { profiles, global } = config;
  const rep = images[0];
  const totalFiles = images.length * profiles.length;
  const perImageBytes = profiles.reduce(
    (sum, p) => sum + estimateBytes(toSettings(global, p)),
    0,
  );
  const totalBytes = images.length * perImageBytes;

  return (
    <aside className="hidden overflow-y-auto border-l border-border bg-surface md:col-start-2 md:row-start-1 md:block">
      <div className="px-[22px] py-6">
        <div className="mb-3.5 flex items-baseline justify-between text-[13px] font-bold text-text">
          <span>プレビュー</span>
          <span className="mono-num text-[11.5px] font-medium text-text-3">
            {profiles.length} サイズ
          </span>
        </div>

        {rep && profiles.length === 0 ? (
          <div className="checker grid min-h-[160px] place-items-center rounded-md border border-dashed border-border-strong px-4 text-center text-[12.5px] leading-[1.6] text-text-3">
            出力サイズが未選択です。<br />
            左の「出力サイズを選択」から追加してください。
          </div>
        ) : rep ? (
          <div className="flex flex-col gap-2.5">
            {profiles.map((p) => {
              const s = toSettings(global, p);
              return (
                <div key={p.id} className="rounded-md border border-border p-2.5">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="truncate font-jp text-[12px] font-semibold text-text" title={p.label}>
                      {p.label}
                    </span>
                    <span className="mono-num text-[11px] text-text-3">
                      {p.width}×{p.height}
                    </span>
                  </div>
                  <div className="checker grid place-items-center overflow-hidden rounded-sm p-2">
                    <div
                      className="max-h-[150px] w-full max-w-[240px] overflow-hidden shadow-sm"
                      style={{
                        aspectRatio: `${p.width} / ${p.height}`,
                        borderRadius: shapeRadiusCSS(
                          global.shape,
                          240,
                          (240 * p.height) / p.width,
                          global.radius,
                        ),
                      }}
                    >
                      <FittedThumb
                        element={rep.element}
                        settings={s}
                        transform={resolveTransform(rep, p.id)}
                        maxDim={STRIP_THUMB_MAX_DIM * 3}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="checker grid min-h-[160px] place-items-center rounded-md border border-border text-[13px] text-text-3">
            画像がありません
          </div>
        )}

        {rep && (
          <div className="mt-[18px] flex flex-col gap-px">
            <div className="flex items-center justify-between border-b border-border py-2 text-[12.5px]">
              <span className="text-text-3">合計ファイル数</span>
              <span className="mono-num font-semibold text-text">{totalFiles} 個</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-2 text-[12.5px]">
              <span className="text-text-3">推定サイズ / 枚</span>
              <span className="mono-num font-semibold text-text">{formatBytes(perImageBytes)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-[12.5px]">
              <span className="text-text-3">推定合計サイズ</span>
              <span className="mono-num font-semibold text-text">{formatBytes(totalBytes)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

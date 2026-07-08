"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useExport } from "@/hooks/useExport";
import { useImageStore } from "@/hooks/useImageStore";
import { useToasts } from "@/hooks/useToasts";
import { ZIP_SIZE_WARNING_BYTES } from "@/lib/constants";
import { estimateBytes, formatBytes } from "@/lib/format";

import { ExportSummary } from "./ExportSummary";
import { ProgressList } from "./ProgressList";
import { ResultGrid } from "./ResultGrid";

/** ダウンロード画面：ZIP生成・進捗表示・完了後の操作（仕様書 §5.5） */
export function ExportScreen() {
  const { state, goToStep, resetAll } = useImageStore();
  const { images, settings } = state;
  const { pushToast } = useToasts();
  const { phase, done, results, isSingle, start, redownload } = useExport(images, settings, pushToast);

  const totalEst = images.length * estimateBytes(settings);
  const isLargeExport = totalEst > ZIP_SIZE_WARNING_BYTES;
  const pct = images.length ? Math.round((done / images.length) * 100) : 0;
  const totalBytes = results.reduce((sum, r) => sum + r.bytes, 0);

  return (
    <div className="flex min-h-0 flex-1 animate-screen-fade flex-col">
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-10">
        <div className="w-full max-w-[560px] rounded-xl border border-border bg-surface px-5 pb-6 pt-6 text-center shadow-md sm:px-[38px] sm:pb-[30px] sm:pt-[38px]">
          {phase === "ready" && (
            <>
              <div className="mx-auto mb-[18px] grid h-16 w-16 place-items-center rounded-[18px] bg-accent-weak text-accent">
                <Icon name={isSingle ? "download" : "zip"} size={28} />
              </div>
              <h2 className="mb-[9px] font-display text-[23px] font-semibold tracking-[-0.01em] text-text">
                ダウンロードの準備ができました
              </h2>
              <p className="mx-auto mb-6 max-w-[420px] text-sm leading-[1.65] text-text-2">
                {isSingle
                  ? "画像を設定どおりに書き出してダウンロードします。処理はすべてこのブラウザ内で行われ、画像が外部に送信されることはありません。"
                  : "全画像を設定どおりに書き出し、1つのZIPファイルにまとめます。処理はすべてこのブラウザ内で行われ、画像が外部に送信されることはありません。"}
              </p>
              <ExportSummary images={images} settings={settings} />
              <p className="mono-num mb-[22px] text-xs text-text-3">
                推定合計サイズ 約 {formatBytes(totalEst)}
              </p>
              {isLargeExport && !isSingle && (
                <p className="mb-[22px] -mt-[14px] rounded-md bg-warn-weak px-3 py-2 text-left text-xs leading-[1.6] text-warn">
                  出力サイズの合計が大きいため、ZIP生成に時間がかかったり、ブラウザの負荷が高くなる場合があります。枚数や出力サイズを減らすことをおすすめします。
                </p>
              )}
              <Button variant="primary" size="lg" className="w-full" onClick={start}>
                <Icon name="download" size={18} />
                {isSingle ? "画像をダウンロード" : "ZIPを生成してダウンロード"}
              </Button>
              <Button
                variant="subtle"
                size="lg"
                className="mt-2.5 w-full"
                onClick={() => goToStep("list")}
              >
                確認画面に戻る
              </Button>
            </>
          )}

          {phase === "processing" && (
            <>
              <div className="mx-auto mb-[18px] grid h-16 w-16 place-items-center rounded-[18px] bg-accent-weak text-accent">
                <Icon name="settings" size={28} className="animate-spin" />
              </div>
              <h2 className="mb-[9px] font-display text-[23px] font-semibold tracking-[-0.01em] text-text">
                書き出し中…
              </h2>
              <p className="mx-auto mb-6 max-w-[420px] text-sm leading-[1.65] text-text-2">
                {isSingle ? "画像をリサイズして書き出しています。" : "画像をリサイズしてZIPに追加しています。"}
              </p>
              <div className="mb-[22px] text-left">
                <div className="mono-num mb-[9px] flex justify-between text-[13px] font-semibold text-text-2">
                  <span>
                    {done} / {images.length} 枚
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-canvas-2">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,theme(colors.accent.DEFAULT),color-mix(in_srgb,theme(colors.accent.DEFAULT)_70%,#7aa0ff))] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <ProgressList images={images} settings={settings} done={done} results={results} />
            </>
          )}

          {phase === "done" && (
            <>
              <div className="mx-auto mb-[18px] grid h-16 w-16 place-items-center rounded-[18px] bg-ok-weak text-ok">
                <Icon name="check" size={30} stroke={2.6} />
              </div>
              <h2 className="mb-[9px] font-display text-[23px] font-semibold tracking-[-0.01em] text-text">
                ダウンロード完了
              </h2>
              <p className="mx-auto mb-6 max-w-[420px] text-sm leading-[1.65] text-text-2">
                {isSingle ? (
                  <>
                    画像を書き出し、<b className="mono-num">{formatBytes(totalBytes)}</b> でダウンロードしました。
                  </>
                ) : (
                  <>
                    <b className="mono-num">{images.length}</b> 枚を書き出し、合計{" "}
                    <b className="mono-num">{formatBytes(totalBytes)}</b> のZIPをダウンロードしました。
                  </>
                )}
              </p>
              <ResultGrid images={images} settings={settings} results={results} />
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button variant="primary" size="lg" className="flex-1" onClick={redownload}>
                  <Icon name="download" size={17} />
                  もう一度ダウンロード
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                  onClick={() => goToStep("settings")}
                >
                  <Icon name="sliders" size={16} />
                  設定を変えて再出力
                </Button>
              </div>
              <Button variant="subtle" size="lg" className="mt-2.5 w-full" onClick={resetAll}>
                <Icon name="reset" size={15} />
                最初からやり直す
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

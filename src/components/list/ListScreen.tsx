"use client";

import { useCallback } from "react";

import { FooterBar } from "@/components/layout/FooterBar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useImageStore } from "@/hooks/useImageStore";
import { useToasts } from "@/hooks/useToasts";
import { processFiles } from "@/lib/validate";

import { ImageGrid } from "./ImageGrid";
import { ImageRow } from "./ImageRow";
import { ListToolbar } from "./ListToolbar";

/** 一覧確認画面：自動配置結果のグリッド/リスト表示と個別調整への入口（仕様書 §5.3） */
export function ListScreen() {
  const {
    state,
    goToStep,
    setEditingId,
    removeImage,
    resetImage,
    addImages,
    setListLayout,
    setGridCellSize,
  } = useImageStore();
  const { pushToast } = useToasts();
  const { images, settings, listLayout, gridCellSize } = state;

  const editedCount = images.filter((item) => item.edited).length;

  const openEdit = useCallback(
    (id: string) => {
      setEditingId(id);
      goToStep("edit");
    },
    [setEditingId, goToStep],
  );

  const handleAddFiles = useCallback(
    async (files: File[]) => {
      const { accepted, rejected } = await processFiles(files, images.length);
      if (accepted.length > 0) {
        addImages(accepted);
        pushToast(`${accepted.length} 枚を追加しました`);
      }
      if (rejected.length > 0) {
        pushToast(`${rejected.length} 件のファイルを読み込めませんでした`, "warn");
      }
    },
    [images.length, addImages, pushToast],
  );

  return (
    <div className="flex min-h-0 flex-1 animate-screen-fade flex-col">
      <div className="flex-1 overflow-y-auto px-8 pb-6 pt-[26px]">
        <ListToolbar
          imageCount={images.length}
          width={settings.width}
          height={settings.height}
          layout={listLayout}
          onLayoutChange={setListLayout}
          cellSize={gridCellSize}
          onCellSizeChange={setGridCellSize}
          onAddFiles={handleAddFiles}
        />
        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-text-3">
            <Icon name="image" size={30} />
            <p className="text-sm">画像がありません</p>
            <Button variant="primary" onClick={() => goToStep("upload")}>
              アップロードへ
            </Button>
          </div>
        ) : listLayout === "rows" ? (
          <div className="mx-auto flex max-w-[1100px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
            {images.map((item, i) => (
              <ImageRow
                key={item.id}
                item={item}
                index={i}
                settings={settings}
                onEdit={openEdit}
                onReset={resetImage}
                onRemove={removeImage}
              />
            ))}
          </div>
        ) : (
          <ImageGrid
            images={images}
            settings={settings}
            cellSize={gridCellSize}
            onEdit={openEdit}
            onReset={resetImage}
            onRemove={removeImage}
          />
        )}
      </div>
      <FooterBar>
        <Button variant="ghost" onClick={() => goToStep("settings")}>
          <Icon name="arrowLeft" size={16} />
          設定に戻る
        </Button>
        <div className="mono-num mx-auto rounded-[8px] border border-border bg-surface-2 px-3.5 py-[7px] text-[12.5px] text-text-2">
          {editedCount > 0 ? (
            <>
              <span className="font-bold text-text">{editedCount}</span> 枚を個別調整 ・
              残り自動配置
            </>
          ) : (
            `全 ${images.length} 枚を自動配置で出力`
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          disabled={images.length === 0}
          onClick={() => goToStep("export")}
        >
          ダウンロードへ進む
          <Icon name="download" size={16} />
        </Button>
      </FooterBar>
    </div>
  );
}

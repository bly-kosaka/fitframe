import type { ImageItem, OutputSettings } from "@/lib/types";

import { ImageCard } from "./ImageCard";

export interface ImageGridProps {
  images: ImageItem[];
  settings: OutputSettings;
  repProfileId: string;
  cellSize: number;
  onEdit: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
}

/** グリッド表示の一覧（仕様書 §5.3 `.thumb-grid`） */
export function ImageGrid({
  images,
  settings,
  repProfileId,
  cellSize,
  onEdit,
  onReset,
  onRemove,
}: ImageGridProps) {
  return (
    <div
      className="mx-auto grid max-w-[1400px] gap-4"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${cellSize}px, 1fr))` }}
    >
      {images.map((item) => (
        <ImageCard
          key={item.id}
          item={item}
          settings={settings}
          repProfileId={repProfileId}
          cellSize={cellSize}
          onEdit={onEdit}
          onReset={onReset}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

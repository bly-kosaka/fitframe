import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ImageItem } from "@/lib/types";

export interface EditorNavProps {
  item: ImageItem;
  index: number;
  total: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onDone: () => void;
}

/** 編集画面の上部バー：一覧へ戻る、前後ナビゲーション、リセット・完了（仕様書 §5.4） */
export function EditorNav({
  item,
  index,
  total,
  onBack,
  onPrev,
  onNext,
  onReset,
  onDone,
}: EditorNavProps) {
  return (
    <div className="flex h-14 flex-none items-center justify-between border-b border-border bg-surface px-[18px]">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <Icon name="arrowLeft" size={15} />
        一覧へ
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="subtle" size="sm" icon title="前の画像 (←)" onClick={onPrev}>
          <Icon name="chevLeft" size={16} />
        </Button>
        <div className="flex min-w-[180px] flex-col items-center">
          <span
            className="max-w-[260px] truncate text-[13px] font-semibold text-text"
            title={item.name}
          >
            {item.name}
          </span>
          <span className="mono-num text-[11px] text-text-3">
            {index + 1} / {total}
          </span>
        </div>
        <Button variant="subtle" size="sm" icon title="次の画像 (→)" onClick={onNext}>
          <Icon name="chevRight" size={16} />
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" disabled={!item.edited} onClick={onReset}>
          <Icon name="reset" size={15} />
          自動配置に戻す
        </Button>
        <Button variant="primary" size="sm" onClick={onDone}>
          <Icon name="check" size={15} stroke={2.6} />
          完了
        </Button>
      </div>
    </div>
  );
}

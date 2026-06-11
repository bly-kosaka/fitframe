import { Icon } from "@/components/ui/Icon";
import type { RejectedFile } from "@/lib/types";

export interface RejectedListProps {
  items: RejectedFile[];
  onDismiss: () => void;
}

/** 検証で拒否されたファイルの一覧表示（仕様書 §7） */
export function RejectedList({ items, onDismiss }: RejectedListProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-[30px] rounded-md border border-danger/30 bg-danger-weak p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-danger">
          <Icon name="warning" size={16} />
          読み込めなかったファイル（{items.length}件）
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="閉じる"
          className="text-text-3 transition-colors duration-150 hover:text-text"
        >
          <Icon name="x" size={16} />
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li
            key={`${item.name}-${i}`}
            className="flex items-center justify-between gap-3 text-[12.5px] text-text-2"
          >
            <span className="truncate">{item.name}</span>
            <span className="flex-none text-danger">{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

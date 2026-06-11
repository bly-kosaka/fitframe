import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";

export interface StatusBadgeProps {
  edited: boolean;
}

/** 自動配置 / 調整済みのステータスピル（仕様書 §5.3） */
export function StatusBadge({ edited }: StatusBadgeProps) {
  if (edited) {
    return (
      <Pill variant="accent">
        <Icon name="sliders" size={11} />
        調整済み
      </Pill>
    );
  }
  return (
    <Pill variant="ok">
      <Icon name="check" size={11} stroke={3} />
      自動配置
    </Pill>
  );
}

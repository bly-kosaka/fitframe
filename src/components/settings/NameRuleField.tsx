import { Icon } from "@/components/ui/Icon";
import { resolveFileName } from "@/lib/filename";
import { FORMATS, NAME_TOKENS } from "@/lib/presets";
import type { ImageItem, OutputSettings } from "@/lib/types";

export interface NameRuleFieldProps {
  settings: OutputSettings;
  onChange: (patch: Partial<OutputSettings>) => void;
  representative?: ImageItem;
  totalCount: number;
}

/** ファイル名ルール（一括）とメタデータ方針（仕様書 §5.2-5, §5.6） */
export function NameRuleField({
  settings,
  onChange,
  representative,
  totalCount,
}: NameRuleFieldProps) {
  const ext = FORMATS.find((f) => f.id === settings.format)?.ext ?? "";

  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-4 flex items-center gap-[9px] text-sm font-bold text-text">
        <Icon name="edit" size={16} className="text-accent" />
        ファイル名 ・ メタデータ
      </div>

      <span className="mb-[7px] block text-xs font-semibold text-text-2">
        ファイル名ルール（全画像に一括適用）
      </span>
      <div className="flex h-9 items-center overflow-hidden rounded-sm border border-border-input bg-surface focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-weak">
        <input
          value={settings.namePattern}
          onChange={(e) => onChange({ namePattern: e.target.value })}
          placeholder="{name}_{w}x{h}"
          className="mono-num h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13.5px] text-text focus:outline-none"
        />
        <span className="grid h-full flex-none place-items-center self-stretch border-l border-border bg-surface-2 px-[11px] text-xs text-text-3">
          .{ext}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-[7px]">
        {NAME_TOKENS.map((tk) => (
          <button
            key={tk.token}
            type="button"
            onClick={() => onChange({ namePattern: (settings.namePattern || "") + tk.token })}
            className="inline-flex items-center gap-1.5 rounded-[7px] border border-border-strong bg-surface px-2.5 py-[5px] text-xs text-text-2 transition-colors duration-150 hover:border-accent hover:bg-accent-weak hover:text-accent"
          >
            <code className="rounded-[4px] bg-accent-weak px-[5px] py-px font-display text-[11.5px] font-semibold text-accent">
              {tk.token}
            </code>
            {tk.label}
          </button>
        ))}
      </div>

      {representative && (
        <div className="mt-3.5 flex items-center gap-2.5 rounded-sm border border-border bg-surface-2 px-[13px] py-2.5">
          <span className="flex-none text-[11px] font-bold text-text-3">出力例</span>
          <span className="mono-num break-all text-[13px] font-semibold text-text">
            {resolveFileName(representative, settings, 0, totalCount)}
          </span>
        </div>
      )}
      <p className="mt-2 text-[11.5px] leading-[1.5] text-text-3">
        個別のファイル名は次の編集画面で画像ごとに上書きできます。
      </p>

      <div className="mt-[18px] flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
        <span className="text-xs font-semibold text-text-2">メタデータ（Exif・位置情報）</span>
        <div className="inline-flex gap-0.5 rounded-sm border border-border bg-surface-2 p-[3px]">
          <span className="inline-flex items-center gap-1.5 rounded-[5px] bg-surface px-3.5 py-1.5 text-[12.5px] font-semibold text-text shadow-xs">
            <Icon name="trash" size={13} />
            削除
          </span>
          <span
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-[5px] px-3.5 py-1.5 text-[12.5px] font-semibold text-text-3 opacity-50"
            title="Phase 2 で対応予定"
          >
            <Icon name="check" size={13} stroke={2.6} />
            保持
          </span>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] leading-[1.5] text-text-3">
        撮影日・カメラ・位置情報を取り除いて軽量化します（Web公開向けの推奨設定）。
      </p>
    </section>
  );
}

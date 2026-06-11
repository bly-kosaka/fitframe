import { Icon } from "@/components/ui/Icon";
import { resolveFileNames } from "@/lib/filename";
import { formatBytes } from "@/lib/format";
import type { ExportResult, ImageItem, OutputSettings } from "@/lib/types";

export interface ProgressListProps {
  images: ImageItem[];
  settings: OutputSettings;
  done: number;
  results: ExportResult[];
}

/** 書き出し中のファイル一覧（仕様書 §5.5 `.out-filelist`） */
export function ProgressList({ images, settings, done, results }: ProgressListProps) {
  const names = resolveFileNames(images, settings);

  return (
    <div className="max-h-60 overflow-y-auto rounded-md border border-border text-left">
      {images.map((item, i) => {
        const isDone = i < done;
        const isActive = i === done;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2.5 border-b border-border px-3.5 py-[9px] text-[12.5px] transition-colors duration-150 last:border-b-0 ${
              isDone ? "text-text" : isActive ? "bg-accent-weak text-accent" : "text-text-3"
            }`}
          >
            <span
              className={`grid h-5 w-5 flex-none place-items-center rounded-[6px] ${
                isDone
                  ? "bg-ok-weak text-ok"
                  : isActive
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-text-3"
              }`}
            >
              {isDone ? (
                <Icon name="check" size={13} stroke={3} />
              ) : isActive ? (
                <Icon name="settings" size={12} className="animate-spin" />
              ) : (
                <Icon name="fileImage" size={13} />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{names[i]}</span>
            {isDone && results[i] && (
              <span className="mono-num text-[11.5px] text-text-3">
                {formatBytes(results[i].bytes)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

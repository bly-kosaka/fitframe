"use client";

import { FooterBar } from "@/components/layout/FooterBar";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useImageStore } from "@/hooks/useImageStore";
import { FIT_MODES, FORMATS, SHAPES } from "@/lib/presets";

import { FitModeCards } from "./FitModeCards";
import { FormatBackground } from "./FormatBackground";
import { LivePreview } from "./LivePreview";
import { NameRuleField } from "./NameRuleField";
import { ShapePicker } from "./ShapePicker";
import { SizePresets } from "./SizePresets";

/** サイズ設定画面：左に設定カード群、右にライブプレビュー（仕様書 §5.2） */
export function SettingsScreen() {
  const { state, setSettings, goToStep } = useImageStore();
  const { settings, images } = state;

  const fitLabel = FIT_MODES.find((f) => f.id === settings.fit)?.label ?? "";
  const shapeLabel = SHAPES.find((s) => s.id === settings.shape)?.label ?? "";
  const formatLabel = FORMATS.find((f) => f.id === settings.format)?.label ?? "";

  return (
    <div className="grid min-h-0 flex-1 animate-screen-fade grid-cols-1 grid-rows-[1fr_auto] overflow-hidden md:grid-cols-[1fr_392px]">
      <div className="overflow-y-auto px-4 pb-6 pt-[22px] sm:px-[34px] sm:pt-[30px]">
        <ScreenHeader
          className="mx-auto mb-[22px] max-w-[760px]"
          title="出力設定"
          subtitle={`ここで決めた設定が全 ${images.length} 枚に適用されます。個別の微調整は次の画面で行えます。`}
        />
        <SizePresets settings={settings} onChange={setSettings} />
        <FitModeCards fit={settings.fit} onChange={(fit) => setSettings({ fit })} />
        <ShapePicker settings={settings} onChange={setSettings} />
        <FormatBackground settings={settings} onChange={setSettings} />
        <NameRuleField
          settings={settings}
          onChange={setSettings}
          representative={images[0]}
          totalCount={images.length}
        />
      </div>

      <LivePreview settings={settings} images={images} />

      <FooterBar className="col-span-full row-start-2 md:row-start-2">
        <Button variant="ghost" onClick={() => goToStep("upload")}>
          <Icon name="arrowLeft" size={16} />
          戻る
        </Button>
        <div className="mono-num mx-auto hidden rounded-[8px] border border-border bg-surface-2 px-3.5 py-[7px] text-[12.5px] text-text-2 sm:block">
          {settings.width}×{settings.height} ・ {fitLabel} ・ {shapeLabel} ・ {formatLabel}
        </div>
        <Button variant="primary" size="lg" onClick={() => goToStep("list")}>
          確認へ進む
          <Icon name="arrowRight" size={16} />
        </Button>
      </FooterBar>
    </div>
  );
}

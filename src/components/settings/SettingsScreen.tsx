"use client";

import { FooterBar } from "@/components/layout/FooterBar";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useImageStore } from "@/hooks/useImageStore";
import { useToasts } from "@/hooks/useToasts";
import {
  createProfileId,
  FIT_MODES,
  FORMATS,
  profileFromPreset,
  repSettings,
  SHAPES,
} from "@/lib/presets";

import { FitModeCards } from "./FitModeCards";
import { FormatBackground } from "./FormatBackground";
import { LivePreview } from "./LivePreview";
import { NameRuleField } from "./NameRuleField";
import { ShapePicker } from "./ShapePicker";
import { SizeBasket } from "./SizeBasket";

/** サイズ設定画面：左に出力サイズのバスケット＋グローバル設定カード群、右にライブプレビュー（仕様書 §4.1） */
export function SettingsScreen() {
  const {
    state,
    setGlobal,
    addProfile,
    removeProfile,
    updateProfile,
    reorderProfiles,
    goToStep,
  } = useImageStore();
  const { pushToast } = useToasts();
  const { config, images } = state;
  const { profiles, global } = config;
  const rep = repSettings(config);

  const fitLabel = FIT_MODES.find((f) => f.id === global.fit)?.label ?? "";
  const shapeLabel = SHAPES.find((s) => s.id === global.shape)?.label ?? "";
  const formatLabel = FORMATS.find((f) => f.id === global.format)?.label ?? "";
  const totalOutputs = images.length * profiles.length;

  return (
    <div className="grid min-h-0 flex-1 animate-screen-fade grid-cols-1 grid-rows-[1fr_auto] overflow-hidden md:grid-cols-[1fr_392px]">
      <div className="overflow-y-auto px-4 pb-6 pt-[22px] sm:px-[34px] sm:pt-[30px]">
        <ScreenHeader
          className="mx-auto mb-[22px] max-w-[760px]"
          title="出力設定"
          subtitle={`出力サイズを選ぶと、全 ${images.length} 枚 × 各サイズに書き出します。fit・形状・形式などは全サイズ共通です。`}
        />
        <SizeBasket
          profiles={profiles}
          imageCount={images.length}
          onAddPreset={(preset) => addProfile(profileFromPreset(preset))}
          onAddCustom={(label, width, height) =>
            addProfile({ id: createProfileId(), label, width, height })
          }
          onUpdateProfile={updateProfile}
          onRemoveProfile={removeProfile}
          onReorder={reorderProfiles}
          onNotify={pushToast}
        />
        <FitModeCards fit={global.fit} onChange={(fit) => setGlobal({ fit })} />
        <ShapePicker settings={rep} onChange={setGlobal} />
        <FormatBackground settings={rep} onChange={setGlobal} />
        <NameRuleField
          settings={rep}
          onChange={setGlobal}
          representative={images[0]}
          totalCount={images.length}
          sampleLabel={profiles[0]?.label}
        />
      </div>

      <LivePreview config={config} images={images} />

      <FooterBar className="col-span-full row-start-2 md:row-start-2">
        <Button variant="ghost" onClick={() => goToStep("upload")}>
          <Icon name="arrowLeft" size={16} />
          戻る
        </Button>
        <div className="mono-num mx-auto hidden rounded-[8px] border border-border bg-surface-2 px-3.5 py-[7px] text-[12.5px] text-text-2 sm:block">
          {profiles.length === 0 ? (
            <span className="text-text-3">出力サイズを1つ以上追加してください</span>
          ) : (
            <>
              {profiles.length} サイズ × {images.length} 枚 = {totalOutputs} ファイル ・ {fitLabel} ・{" "}
              {shapeLabel} ・ {formatLabel}
            </>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          disabled={profiles.length === 0}
          title={profiles.length === 0 ? "出力サイズを追加してください" : undefined}
          onClick={() => goToStep("list")}
        >
          確認へ進む
          <Icon name="arrowRight" size={16} />
        </Button>
      </FooterBar>
    </div>
  );
}

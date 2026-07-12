"use client";

import { useCallback, useEffect, useState } from "react";

import { useImageStore } from "@/hooks/useImageStore";
import { toSettings } from "@/lib/presets";
import { isProfileEdited, resolveTransform } from "@/lib/types";

import { EditorNav } from "./EditorNav";
import { EditorPanel } from "./EditorPanel";
import { EditorProfileStrip } from "./EditorProfileStrip";
import { EditorStage } from "./EditorStage";

/** 個別編集画面：焦点・拡大率・回転・反転・ファイル名を調整する。全出力サイズを同時確認できる（仕様書 §4.3） */
export function EditorScreen() {
  const { state, setEditingId, updateTransform, resetImage, setImageName, applyProfileToAll, goToStep } =
    useImageStore();
  const { images, config, editingId } = state;
  const { profiles, global } = config;

  const [selProfileId, setSelProfileId] = useState<string>(profiles[0]?.id ?? "");
  const selProfile = profiles.find((p) => p.id === selProfileId) ?? profiles[0];
  // プロファイルが削除された等で選択が外れたら先頭へ戻す
  useEffect(() => {
    if (!profiles.some((p) => p.id === selProfileId) && profiles[0]) {
      setSelProfileId(profiles[0].id);
    }
  }, [profiles, selProfileId]);

  const index = images.findIndex((item) => item.id === editingId);
  const item = index >= 0 ? images[index] : undefined;

  const goPrev = useCallback(() => {
    if (images.length === 0 || index < 0) return;
    setEditingId(images[(index - 1 + images.length) % images.length].id);
  }, [images, index, setEditingId]);

  const goNext = useCallback(() => {
    if (images.length === 0 || index < 0) return;
    setEditingId(images[(index + 1) % images.length].id);
  }, [images, index, setEditingId]);

  useEffect(() => {
    if (!item) goToStep("list");
  }, [item, goToStep]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") goToStep("list");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, goToStep]);

  if (!item || !selProfile) return null;

  const selSettings = toSettings(global, selProfile);
  const selTransform = resolveTransform(item, selProfile.id);
  const selEdited = isProfileEdited(item, selProfile.id);
  const multiProfile = profiles.length > 1;

  return (
    <div className="flex min-h-0 flex-1 animate-screen-fade flex-col bg-canvas">
      <EditorNav
        item={item}
        index={index}
        total={images.length}
        canReset={selEdited}
        onBack={() => goToStep("list")}
        onPrev={goPrev}
        onNext={goNext}
        onReset={() => resetImage(item.id, selProfile.id)}
        onDone={() => goToStep("list")}
      />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 flex-1 flex-col">
          <EditorStage
            key={`${item.id}-${selProfile.id}`}
            item={item}
            settings={selSettings}
            transform={selTransform}
            onTransform={(patch) => updateTransform(item.id, selProfile.id, patch)}
          />
          {multiProfile && (
            <EditorProfileStrip
              item={item}
              profiles={profiles}
              global={global}
              selectedId={selProfile.id}
              onSelect={setSelProfileId}
            />
          )}
        </div>
        <EditorPanel
          item={item}
          settings={selSettings}
          index={index}
          total={images.length}
          label={selProfile.label}
          transform={selTransform}
          edited={selEdited}
          multiProfile={multiProfile}
          onTransform={(patch) => updateTransform(item.id, selProfile.id, patch)}
          onName={setImageName}
          onApplyToAll={() => applyProfileToAll(item.id, selProfile.id)}
        />
      </div>
    </div>
  );
}

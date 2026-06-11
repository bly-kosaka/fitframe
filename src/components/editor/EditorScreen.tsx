"use client";

import { useCallback, useEffect } from "react";

import { useImageStore } from "@/hooks/useImageStore";

import { EditorNav } from "./EditorNav";
import { EditorPanel } from "./EditorPanel";
import { EditorStage } from "./EditorStage";

/** 個別編集画面：1枚ずつ位置・拡大率・回転・反転・ファイル名を調整する（仕様書 §5.4） */
export function EditorScreen() {
  const { state, setEditingId, updateTransform, resetImage, setImageName, goToStep } =
    useImageStore();
  const { images, settings, editingId } = state;

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

  if (!item) return null;

  return (
    <div className="flex min-h-0 flex-1 animate-screen-fade flex-col bg-canvas">
      <EditorNav
        item={item}
        index={index}
        total={images.length}
        onBack={() => goToStep("list")}
        onPrev={goPrev}
        onNext={goNext}
        onReset={() => resetImage(item.id)}
        onDone={() => goToStep("list")}
      />
      <div className="flex min-h-0 flex-1">
        <EditorStage
          key={item.id}
          item={item}
          settings={settings}
          onTransform={(patch) => updateTransform(item.id, patch)}
        />
        <EditorPanel
          item={item}
          settings={settings}
          index={index}
          total={images.length}
          onTransform={(patch) => updateTransform(item.id, patch)}
          onName={setImageName}
        />
      </div>
    </div>
  );
}

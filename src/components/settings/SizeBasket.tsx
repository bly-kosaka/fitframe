"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { CUSTOM_SIZE_MAX, CUSTOM_SIZE_MIN, PROFILE_MAX_COUNT } from "@/lib/constants";
import { aspectLabel } from "@/lib/format";
import { SIZE_PRESETS, type SizePreset } from "@/lib/presets";
import type { OutputProfile, ToastKind } from "@/lib/types";

export interface SizeBasketProps {
  profiles: OutputProfile[];
  imageCount: number;
  onAddPreset: (preset: SizePreset) => void;
  onAddCustom: (label: string, width: number, height: number) => void;
  onUpdateProfile: (id: string, patch: Partial<Omit<OutputProfile, "id">>) => void;
  onRemoveProfile: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onNotify: (message: string, kind?: ToastKind) => void;
}

function clampSize(v: number): number {
  if (Number.isNaN(v)) return CUSTOM_SIZE_MIN;
  return Math.max(CUSTOM_SIZE_MIN, Math.min(CUSTOM_SIZE_MAX, Math.round(v)));
}

type AddTab = "preset" | "custom";

/**
 * プリセット選択部（カテゴリタブ＋チップ）。追加パネルと編集行で共用する。
 * - 追加モード：`disableActive` で追加済みを「✓ 追加済み」表示・押下不可にする。
 * - 置換モード（編集）：`currentPresetId` を強調しつつ、どのプリセットも選び直せる。
 */
function PresetPicker({
  onPick,
  activePresetIds,
  disableActive = false,
  currentPresetId,
}: {
  onPick: (preset: SizePreset) => void;
  activePresetIds?: Set<string | undefined>;
  disableActive?: boolean;
  currentPresetId?: string;
}) {
  const [gi, setGi] = useState(0);
  return (
    <div>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {SIZE_PRESETS.map((g, i) => (
          <button
            key={g.group}
            type="button"
            onClick={() => setGi(i)}
            className={`rounded-[7px] border px-[11px] py-1 text-[12px] font-semibold transition-colors duration-150 ${
              i === gi
                ? "border-accent bg-accent-weak text-accent"
                : "border-border-strong bg-surface text-text-2 hover:border-accent"
            }`}
          >
            {g.group}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {SIZE_PRESETS[gi].items.map((p) => {
          const added = disableActive && !!activePresetIds?.has(p.id);
          const current = currentPresetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={added}
              onClick={() => !added && onPick(p)}
              className={`flex flex-col items-start gap-px rounded-sm border px-[13px] py-2 text-left transition-[border-color,background-color] duration-150 ${
                added || current
                  ? "border-accent bg-accent-weak"
                  : "border-border-strong bg-surface hover:border-accent"
              } ${added ? "cursor-default" : ""}`}
            >
              <span className="flex items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-text">
                {(added || current) && <Icon name="check" size={12} stroke={3} className="text-accent" />}
                {p.label}
              </span>
              <span
                className={`mono-num whitespace-nowrap text-[11px] ${added || current ? "text-accent" : "text-text-3"}`}
              >
                {p.w}×{p.h}
                {added && " ・ 追加済み"}
                {current && " ・ 選択中"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 出力サイズのバスケット（仕様書 §4.1 / UX改訂）。
 * 「今の出力構成」を最上部のバスケットで主役化し、追加・編集の双方でプリセット／カスタムを選べる。
 * 初期は未選択（空）で「出力サイズを選択」ボックスから始める。削除・並べ替えはバスケットで行う。
 */
export function SizeBasket({
  profiles,
  imageCount,
  onAddPreset,
  onAddCustom,
  onUpdateProfile,
  onRemoveProfile,
  onReorder,
  onNotify,
}: SizeBasketProps) {
  // 追加パネル
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<AddTab>("preset");
  // カスタム追加フォーム
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(400);
  const [lockedRatio, setLockedRatio] = useState<number | null>(null);
  // ドラッグ並べ替え / インライン編集
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  // 編集行でプリセット選択を開いているか
  const [editPresetOpen, setEditPresetOpen] = useState(false);

  const activePresetIds = new Set(profiles.map((p) => p.presetId).filter(Boolean));
  const total = imageCount * profiles.length;
  const atMax = profiles.length >= PROFILE_MAX_COUNT;

  const startEdit = (id: string) => {
    setEditingId(id);
    setEditPresetOpen(false);
  };
  const endEdit = () => {
    setEditingId(null);
    setEditPresetOpen(false);
  };

  const setW = (v: number) => {
    const w = clampSize(v);
    setWidth(w);
    if (lockedRatio !== null) setHeight(clampSize(w / lockedRatio));
  };
  const setH = (v: number) => {
    const h = clampSize(v);
    setHeight(h);
    if (lockedRatio !== null) setWidth(clampSize(h * lockedRatio));
  };
  const toggleLock = () => setLockedRatio((r) => (r !== null ? null : width / height));
  const swap = () => {
    if (lockedRatio !== null) setLockedRatio(1 / lockedRatio);
    setWidth(height);
    setHeight(width);
  };

  const addPreset = (p: SizePreset) => {
    if (activePresetIds.has(p.id)) return; // 追加済みは何もしない（削除はバスケットから）
    if (atMax) {
      onNotify(`出力サイズは最大 ${PROFILE_MAX_COUNT} 件までです`, "warn");
      return;
    }
    onAddPreset(p);
  };

  const addCustom = () => {
    const w = clampSize(width);
    const h = clampSize(height);
    const lbl = label.trim() || `${w}x${h}`;
    if (profiles.some((p) => p.width === w && p.height === h && p.label === lbl)) {
      onNotify("同じサイズ・ラベルの出力が既にあります", "warn");
      return;
    }
    if (atMax) {
      onNotify(`出力サイズは最大 ${PROFILE_MAX_COUNT} 件までです`, "warn");
      return;
    }
    onAddCustom(lbl, w, h);
    setLabel("");
  };

  // 編集中のプロファイルにプリセットを適用（サイズ・ラベル・presetId を差し替え）
  const applyPresetToEditing = (id: string, preset: SizePreset) => {
    onUpdateProfile(id, {
      label: preset.label,
      width: preset.w,
      height: preset.h,
      presetId: preset.id,
    });
    setEditPresetOpen(false);
  };

  const handleDrop = (to: number) => {
    if (dragIndex === null || dragIndex === to) {
      setDragIndex(null);
      return;
    }
    onReorder(dragIndex, to);
    setDragIndex(null);
  };

  return (
    <section className="mx-auto mb-4 max-w-[760px] rounded-lg border border-border bg-surface px-[22px] py-5 shadow-xs">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-[9px] text-sm font-bold text-text">
          <Icon name="crop" size={16} className="text-accent" />
          出力サイズ
        </div>
        <span className="mono-num rounded-[6px] border border-border bg-surface-2 px-[9px] py-1 text-[11.5px] text-text-2">
          {profiles.length} サイズ × {imageCount} 枚 = {total} ファイル
        </span>
      </div>
      <p className="mb-3.5 text-[12px] leading-[1.55] text-text-3">
        出力したいサイズをバスケットに追加してください。fit・形状・形式などは下のカードで
        <span className="font-semibold text-text-2">全サイズ共通</span>に設定します。
      </p>

      {/* 未選択（初期）＝出力サイズを選ぶところから始める */}
      {profiles.length === 0 && (
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className={`flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-7 text-center transition-colors duration-150 ${
            addOpen
              ? "border-accent bg-accent-weak"
              : "border-border-strong bg-surface-2 hover:border-accent hover:bg-accent-weak"
          }`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-weak text-accent">
            <Icon name="crop" size={20} />
          </span>
          <span className="text-[14px] font-bold text-text">出力サイズを選択</span>
          <span className="text-[12px] leading-[1.5] text-text-3">
            プリセットから選ぶか、カスタムで指定します。<br className="hidden sm:inline" />
            複数追加すると1枚から複数サイズを同時に書き出せます。
          </span>
          <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-sm bg-accent px-3.5 py-2 text-[13px] font-semibold text-white">
            <Icon name="plus" size={15} stroke={2.4} />
            サイズを追加する
          </span>
        </button>
      )}

      {/* バスケット（今の出力構成） */}
      {profiles.length > 0 && (
        <div className="overflow-hidden rounded-md border border-border">
          {profiles.map((p, i) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                draggable={!isEditing}
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className={`border-b border-border bg-surface last:border-b-0 ${
                  dragIndex === i ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-2 px-3 py-2 sm:gap-2.5">
                  <span className="flex-none cursor-grab text-text-3" title="ドラッグで並べ替え">
                    <Icon name="move" size={14} />
                  </span>
                  {isEditing ? (
                    <>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                        <input
                          value={p.label}
                          onChange={(e) => onUpdateProfile(p.id, { label: e.target.value })}
                          placeholder="ラベル"
                          className="h-8 w-full min-w-0 rounded-sm border border-border-input bg-surface px-2 font-jp text-[13px] text-text focus:border-accent focus:outline-none sm:w-[96px] sm:flex-none"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          <input
                            type="number"
                            value={p.width}
                            onChange={(e) =>
                              onUpdateProfile(p.id, { width: clampSize(Number(e.target.value)), presetId: undefined })
                            }
                            className="mono-num h-8 w-[72px] flex-none rounded-sm border border-border-input bg-surface px-2 text-[13px] text-text focus:border-accent focus:outline-none"
                          />
                          <span className="text-text-3">×</span>
                          <input
                            type="number"
                            value={p.height}
                            onChange={(e) =>
                              onUpdateProfile(p.id, { height: clampSize(Number(e.target.value)), presetId: undefined })
                            }
                            className="mono-num h-8 w-[72px] flex-none rounded-sm border border-border-input bg-surface px-2 text-[13px] text-text focus:border-accent focus:outline-none"
                          />
                          <button
                            type="button"
                            title="プリセットから選ぶ"
                            onClick={() => setEditPresetOpen((v) => !v)}
                            className={`inline-flex h-8 flex-none items-center gap-1 rounded-[6px] border px-2 text-[12px] font-semibold transition-colors duration-150 ${
                              editPresetOpen
                                ? "border-accent bg-accent-weak text-accent"
                                : "border-border-strong bg-surface text-text-2 hover:border-accent hover:text-accent"
                            }`}
                          >
                            <Icon name="layers" size={13} />
                            <span className="hidden sm:inline">プリセット</span>
                            <Icon name="chevDown" size={12} className={editPresetOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        title="編集を終了"
                        onClick={endEdit}
                        className="grid h-8 w-8 flex-none place-items-center self-start rounded-[6px] border border-accent bg-accent text-white sm:self-auto"
                      >
                        <Icon name="check" size={15} stroke={2.6} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2.5">
                        <span className="min-w-0 truncate font-jp text-[13px] font-semibold text-text sm:w-[110px] sm:flex-none" title={p.label}>
                          {p.label}
                        </span>
                        <span className="mono-num whitespace-nowrap text-[12.5px] text-text-2 sm:text-[13px]">
                          {p.width} × {p.height}
                        </span>
                        <span className="mono-num hidden rounded-[5px] border border-border bg-surface-2 px-[7px] py-px text-[11px] text-text-3 sm:inline-block">
                          {aspectLabel(p.width, p.height)}
                        </span>
                        {p.presetId && (
                          <span className="hidden rounded-[5px] bg-accent-weak px-[7px] py-px text-[10.5px] font-semibold text-accent sm:inline-block">
                            プリセット
                          </span>
                        )}
                      </div>
                      <div className="ml-auto flex flex-none items-center gap-1">
                        <button
                          type="button"
                          title="編集"
                          onClick={() => startEdit(p.id)}
                          className="grid h-7 w-7 place-items-center rounded-[6px] border border-border bg-surface text-text-3 transition-colors duration-150 hover:border-border-strong hover:text-text"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          title="削除"
                          onClick={() => onRemoveProfile(p.id)}
                          className="grid h-7 w-7 place-items-center rounded-[6px] border border-border bg-surface text-text-3 transition-colors duration-150 hover:border-danger hover:text-danger"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* 編集中のプリセット選択（プリセットで丸ごと差し替え） */}
                {isEditing && editPresetOpen && (
                  <div className="border-t border-dashed border-border bg-surface-2 px-3 py-2.5">
                    <PresetPicker
                      currentPresetId={p.presetId}
                      onPick={(preset) => applyPresetToEditing(p.id, preset)}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* 追加ボタン（バスケット末尾） */}
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className={`flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
              addOpen
                ? "bg-accent-weak text-accent"
                : "bg-surface-2 text-text-2 hover:bg-canvas-2 hover:text-text"
            }`}
          >
            <Icon name={addOpen ? "chevDown" : "plus"} size={15} stroke={2.4} />
            出力サイズを追加する
          </button>
        </div>
      )}

      {/* 追加パネル（その場で開く） */}
      {addOpen && (
        <div className="mt-2.5 rounded-md border border-accent/40 bg-surface-2 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex gap-0.5 rounded-sm border border-border bg-surface p-[3px]">
              {(["preset", "custom"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-[5px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-150 ${
                    tab === t ? "bg-accent text-white" : "text-text-2 hover:text-text"
                  }`}
                >
                  {t === "preset" ? "プリセットから選択" : "カスタムサイズ"}
                </button>
              ))}
            </div>
            <button
              type="button"
              title="閉じる"
              onClick={() => setAddOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-[6px] text-text-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-text"
            >
              <Icon name="x" size={15} />
            </button>
          </div>

          {tab === "preset" ? (
            <PresetPicker activePresetIds={activePresetIds} disableActive onPick={addPreset} />
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[9px]">
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ラベル (例 SP)"
                className="h-9 w-[120px] rounded-sm border border-border-input bg-surface px-2.5 font-jp text-[13px] text-text focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent-weak"
              />
              <div className="flex items-center gap-[9px]">
                <div className="flex h-9 w-[104px] items-center overflow-hidden rounded-sm border border-border-input bg-surface focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-weak">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setW(Number(e.target.value))}
                    className="mono-num h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13.5px] text-text focus:outline-none"
                  />
                  <span className="grid h-full flex-none place-items-center self-stretch border-l border-border bg-surface-2 px-[9px] text-xs text-text-3">
                    W
                  </span>
                </div>
                <button
                  type="button"
                  title="縦横比を固定"
                  onClick={toggleLock}
                  className={`grid h-[30px] w-[30px] flex-none place-items-center rounded-[7px] border transition-colors duration-150 ${
                    lockedRatio !== null
                      ? "border-accent bg-accent-weak text-accent"
                      : "border-border-strong bg-surface text-text-3 hover:border-border-input hover:text-text"
                  }`}
                >
                  <Icon name={lockedRatio !== null ? "lock" : "link"} size={15} />
                </button>
                <div className="flex h-9 w-[104px] items-center overflow-hidden rounded-sm border border-border-input bg-surface focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent-weak">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setH(Number(e.target.value))}
                    className="mono-num h-9 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13.5px] text-text focus:outline-none"
                  />
                  <span className="grid h-full flex-none place-items-center self-stretch border-l border-border bg-surface-2 px-[9px] text-xs text-text-3">
                    H
                  </span>
                </div>
                <button
                  type="button"
                  title="縦横を入れ替え"
                  onClick={swap}
                  className="grid h-8 w-8 flex-none place-items-center rounded-sm bg-surface text-text-2 transition-colors duration-150 hover:bg-canvas-2 hover:text-text"
                >
                  <Icon name="flipH" size={15} />
                </button>
              </div>
              <button
                type="button"
                onClick={addCustom}
                className="inline-flex h-9 flex-none items-center gap-1.5 rounded-sm bg-accent px-3.5 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-accent-hover"
              >
                <Icon name="plus" size={15} stroke={2.4} />
                出力サイズに追加
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

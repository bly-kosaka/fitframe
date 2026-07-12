/**
 * アプリ全体の状態（ステップ・画像・出力設定・トースト等）を管理する reducer。
 * 出力は「出力プロファイル配列（サイズ＋ラベル）＋グローバル設定（fit/形状/形式/…）」の
 * OutputConfig で保持する（仕様書 §2.1）。位置は画像ごとの正規化フォーカルポイント（focus）。
 */

import { GRID_CELL_DEFAULT, PROFILE_MAX_COUNT } from "@/lib/constants";
import { createProfileId, defaultConfig } from "@/lib/presets";
import { defaultTransform } from "@/lib/types";
import type {
  GlobalOutputSettings,
  ImageItem,
  ListLayout,
  OutputConfig,
  OutputProfile,
  Step,
  Toast,
  Transform,
} from "@/lib/types";

export interface AppState {
  step: Step;
  images: ImageItem[];
  config: OutputConfig;
  editingId: string | null;
  listLayout: ListLayout;
  gridCellSize: number;
  toasts: Toast[];
}

export const initialState: AppState = {
  step: "upload",
  images: [],
  config: defaultConfig(),
  editingId: null,
  listLayout: "grid",
  gridCellSize: GRID_CELL_DEFAULT,
  toasts: [],
};

export type AppAction =
  | { type: "SET_STEP"; step: Step }
  | { type: "ADD_IMAGES"; items: ImageItem[] }
  | { type: "REMOVE_IMAGE"; id: string }
  | { type: "RESET_IMAGE"; id: string }
  | { type: "RESET_ALL_TRANSFORMS" }
  | { type: "SET_IMAGE_NAME"; id: string; name: string }
  | { type: "UPDATE_TRANSFORM"; id: string; patch: Partial<Transform> }
  | { type: "APPLY_TRANSFORM_TO_ALL"; zoom: number; rotation: number; resetPosition: boolean }
  | { type: "SET_GLOBAL"; patch: Partial<GlobalOutputSettings> }
  | { type: "ADD_PROFILE"; profile: OutputProfile }
  | { type: "REMOVE_PROFILE"; id: string }
  | { type: "UPDATE_PROFILE"; id: string; patch: Partial<Omit<OutputProfile, "id">> }
  | { type: "TOGGLE_PRESET"; profile: OutputProfile }
  | { type: "REORDER_PROFILES"; from: number; to: number }
  | { type: "SET_EDITING_ID"; id: string | null }
  | { type: "SET_LIST_LAYOUT"; layout: ListLayout }
  | { type: "SET_GRID_CELL_SIZE"; size: number }
  | { type: "RESET_ALL" }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string };

/** 自動配置（defaultTransform）から変更されているかどうか */
function isDefaultTransform(t: Transform): boolean {
  return (
    t.focus.fx === 0.5 &&
    t.focus.fy === 0.5 &&
    t.zoom === 1 &&
    t.rotation === 0 &&
    !t.flipH &&
    !t.flipV
  );
}

/** プロファイル配列を更新するヘルパー。
 *  空も許容する（初期＝未選択。最低1件は「確認へ進む」の条件として扱う。仕様書 §7）。 */
function withProfiles(state: AppState, profiles: OutputProfile[]): AppState {
  return { ...state, config: { ...state.config, profiles } };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };

    case "ADD_IMAGES":
      return { ...state, images: [...state.images, ...action.items] };

    case "REMOVE_IMAGE": {
      const images = state.images.filter((item) => item.id !== action.id);
      return {
        ...state,
        images,
        editingId: state.editingId === action.id ? null : state.editingId,
        step: images.length === 0 ? "upload" : state.step,
      };
    }

    case "RESET_IMAGE":
      return {
        ...state,
        images: state.images.map((item) =>
          item.id === action.id ? { ...item, transform: defaultTransform(), edited: false } : item,
        ),
      };

    case "RESET_ALL_TRANSFORMS":
      return {
        ...state,
        images: state.images.map((item) => ({
          ...item,
          transform: defaultTransform(),
          edited: false,
        })),
      };

    case "SET_IMAGE_NAME":
      return {
        ...state,
        images: state.images.map((item) =>
          item.id === action.id
            ? { ...item, customName: action.name.trim() === "" ? undefined : action.name }
            : item,
        ),
      };

    case "UPDATE_TRANSFORM":
      return {
        ...state,
        images: state.images.map((item) => {
          if (item.id !== action.id) return item;
          const transform = { ...item.transform, ...action.patch };
          return { ...item, transform, edited: !isDefaultTransform(transform) };
        }),
      };

    case "APPLY_TRANSFORM_TO_ALL":
      return {
        ...state,
        images: state.images.map((item) => {
          const transform: Transform = {
            ...item.transform,
            zoom: action.zoom,
            rotation: action.rotation,
            ...(action.resetPosition ? { focus: { fx: 0.5, fy: 0.5 } } : {}),
          };
          return { ...item, transform, edited: !isDefaultTransform(transform) };
        }),
      };

    case "SET_GLOBAL":
      return { ...state, config: { ...state.config, global: { ...state.config.global, ...action.patch } } };

    case "ADD_PROFILE": {
      if (state.config.profiles.length >= PROFILE_MAX_COUNT) return state;
      return withProfiles(state, [...state.config.profiles, action.profile]);
    }

    case "REMOVE_PROFILE":
      return withProfiles(
        state,
        state.config.profiles.filter((p) => p.id !== action.id),
      );

    case "UPDATE_PROFILE":
      return withProfiles(
        state,
        state.config.profiles.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      );

    case "TOGGLE_PRESET": {
      // 同一プリセットが既にあれば外す（トグル）、なければ追記
      const exists = state.config.profiles.some((p) => p.presetId === action.profile.presetId);
      if (exists) {
        return withProfiles(
          state,
          state.config.profiles.filter((p) => p.presetId !== action.profile.presetId),
        );
      }
      if (state.config.profiles.length >= PROFILE_MAX_COUNT) return state;
      return withProfiles(state, [...state.config.profiles, action.profile]);
    }

    case "REORDER_PROFILES": {
      const profiles = [...state.config.profiles];
      const [moved] = profiles.splice(action.from, 1);
      if (!moved) return state;
      profiles.splice(action.to, 0, moved);
      return withProfiles(state, profiles);
    }

    case "SET_EDITING_ID":
      return { ...state, editingId: action.id };

    case "SET_LIST_LAYOUT":
      return { ...state, listLayout: action.layout };

    case "SET_GRID_CELL_SIZE":
      return { ...state, gridCellSize: action.size };

    case "RESET_ALL":
      return {
        ...state,
        images: [],
        config: defaultConfig(),
        editingId: null,
        step: "upload",
      };

    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };

    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };

    default:
      return state;
  }
}

// createProfileId をストア利用側からも参照できるよう再エクスポート
export { createProfileId };

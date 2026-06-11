/**
 * アプリ全体の状態（ステップ・画像・出力設定・トースト等）を管理する reducer。
 * Shape/Fit/Format/Size/background/ファイル名ルール/メタデータはグローバル設定（settings）、
 * x/y/zoom/rotation/flipH/flipV/customName は画像ごと（images[].transform / customName）に保持する。
 */

import { GRID_CELL_DEFAULT } from "@/lib/constants";
import { defaultSettings } from "@/lib/presets";
import { defaultTransform } from "@/lib/types";
import type { ImageItem, ListLayout, OutputSettings, Step, Toast, Transform } from "@/lib/types";

export interface AppState {
  step: Step;
  images: ImageItem[];
  settings: OutputSettings;
  editingId: string | null;
  listLayout: ListLayout;
  gridCellSize: number;
  toasts: Toast[];
}

export const initialState: AppState = {
  step: "upload",
  images: [],
  settings: defaultSettings(),
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
  | { type: "SET_SETTINGS"; patch: Partial<OutputSettings> }
  | { type: "SET_EDITING_ID"; id: string | null }
  | { type: "SET_LIST_LAYOUT"; layout: ListLayout }
  | { type: "SET_GRID_CELL_SIZE"; size: number }
  | { type: "RESET_ALL" }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string };

/** 自動配置（defaultTransform）から変更されているかどうか */
function isDefaultTransform(t: Transform): boolean {
  return t.x === 0 && t.y === 0 && t.zoom === 1 && t.rotation === 0 && !t.flipH && !t.flipV;
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
            ...(action.resetPosition ? { x: 0, y: 0 } : {}),
          };
          return { ...item, transform, edited: !isDefaultTransform(transform) };
        }),
      };

    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };

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
        settings: defaultSettings(),
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

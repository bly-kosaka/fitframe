"use client";

/**
 * グローバル状態（ステップ・画像・出力設定・トースト等）への Context + useReducer アクセス。
 * ObjectURL は画像の追加時に作成され、削除/全リセット/アンマウント時にここで revoke する。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type {
  GlobalOutputSettings,
  ImageItem,
  ListLayout,
  OutputProfile,
  Step,
  Transform,
} from "@/lib/types";

import { appReducer, initialState, type AppAction, type AppState } from "@/store/reducer";

interface ImageStoreContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}

const ImageStoreContext = createContext<ImageStoreContextValue | null>(null);

export function ImageStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // アンマウント時：保持中の全 ObjectURL を revoke する
  useEffect(() => {
    return () => {
      state.images.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <ImageStoreContext.Provider value={value}>{children}</ImageStoreContext.Provider>;
}

export function useImageStoreContext(): ImageStoreContextValue {
  const ctx = useContext(ImageStoreContext);
  if (!ctx) {
    throw new Error("useImageStore は ImageStoreProvider 内で使用してください");
  }
  return ctx;
}

const STEP_ORDER: Record<Step, number> = {
  upload: 0,
  settings: 1,
  list: 2,
  edit: 2,
  export: 3,
};

export function useImageStore() {
  const { state, dispatch } = useImageStoreContext();

  /** 画像未投入時はアップロード以外のステップへ遷移できない */
  const maxStep = state.images.length > 0 ? 3 : 0;

  const goToStep = useCallback(
    (step: Step, force = false) => {
      if (!force && step !== "upload" && STEP_ORDER[step] > maxStep) return;
      dispatch({ type: "SET_STEP", step });
    },
    [dispatch, maxStep],
  );

  const addImages = useCallback(
    (items: ImageItem[]) => dispatch({ type: "ADD_IMAGES", items }),
    [dispatch],
  );

  const removeImage = useCallback(
    (id: string) => {
      const target = state.images.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      dispatch({ type: "REMOVE_IMAGE", id });
    },
    [dispatch, state.images],
  );

  const resetImage = useCallback((id: string) => dispatch({ type: "RESET_IMAGE", id }), [dispatch]);

  const resetAllTransforms = useCallback(
    () => dispatch({ type: "RESET_ALL_TRANSFORMS" }),
    [dispatch],
  );

  const setImageName = useCallback(
    (id: string, name: string) => dispatch({ type: "SET_IMAGE_NAME", id, name }),
    [dispatch],
  );

  const updateTransform = useCallback(
    (id: string, patch: Partial<Transform>) => dispatch({ type: "UPDATE_TRANSFORM", id, patch }),
    [dispatch],
  );

  const applyTransformToAll = useCallback(
    (zoom: number, rotation: number, resetPosition: boolean) =>
      dispatch({ type: "APPLY_TRANSFORM_TO_ALL", zoom, rotation, resetPosition }),
    [dispatch],
  );

  const setGlobal = useCallback(
    (patch: Partial<GlobalOutputSettings>) => dispatch({ type: "SET_GLOBAL", patch }),
    [dispatch],
  );

  const addProfile = useCallback(
    (profile: OutputProfile) => dispatch({ type: "ADD_PROFILE", profile }),
    [dispatch],
  );

  const removeProfile = useCallback(
    (id: string) => dispatch({ type: "REMOVE_PROFILE", id }),
    [dispatch],
  );

  const updateProfile = useCallback(
    (id: string, patch: Partial<Omit<OutputProfile, "id">>) =>
      dispatch({ type: "UPDATE_PROFILE", id, patch }),
    [dispatch],
  );

  const togglePreset = useCallback(
    (profile: OutputProfile) => dispatch({ type: "TOGGLE_PRESET", profile }),
    [dispatch],
  );

  const reorderProfiles = useCallback(
    (from: number, to: number) => dispatch({ type: "REORDER_PROFILES", from, to }),
    [dispatch],
  );

  const setEditingId = useCallback(
    (id: string | null) => dispatch({ type: "SET_EDITING_ID", id }),
    [dispatch],
  );

  const setListLayout = useCallback(
    (layout: ListLayout) => dispatch({ type: "SET_LIST_LAYOUT", layout }),
    [dispatch],
  );

  const setGridCellSize = useCallback(
    (size: number) => dispatch({ type: "SET_GRID_CELL_SIZE", size }),
    [dispatch],
  );

  const resetAll = useCallback(() => {
    state.images.forEach((item) => URL.revokeObjectURL(item.objectUrl));
    dispatch({ type: "RESET_ALL" });
  }, [dispatch, state.images]);

  return {
    state,
    maxStep,
    goToStep,
    addImages,
    removeImage,
    resetImage,
    resetAllTransforms,
    setImageName,
    updateTransform,
    applyTransformToAll,
    setGlobal,
    addProfile,
    removeProfile,
    updateProfile,
    togglePreset,
    reorderProfiles,
    setEditingId,
    setListLayout,
    setGridCellSize,
    resetAll,
  };
}

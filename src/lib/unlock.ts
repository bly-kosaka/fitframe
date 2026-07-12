const PARAM_KEY = "_s";
const PARAM_TOKEN = "3Kx9fP2mR7qLnW";
const STORAGE_KEY = "ff_s";

/** URLパラメータにトークンがあればlocalStorageに保存 */
export function checkAndSaveUnlock(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get(PARAM_KEY) === PARAM_TOKEN) {
    localStorage.setItem(STORAGE_KEY, "1");
  }
}

/** 制限解除済みかどうか */
export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

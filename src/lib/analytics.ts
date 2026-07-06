/**
 * GA4カスタムイベント送信用の薄いラッパー。
 * gtag未ロード時（計測ブロック時・SSR時・広告ブロッカー等）は何もしない。
 * 画像データ自体は一切送信しない（件数・設定値などのメタ情報のみ）。
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

import type {
  FitMode,
  GlobalOutputSettings,
  OutputConfig,
  OutputFormat,
  OutputProfile,
  OutputSettings,
  ShapeType,
} from "./types";

export interface SizePreset {
  id: string;
  label: string;
  w: number;
  h: number;
}

export interface SizePresetGroup {
  group: string;
  items: SizePreset[];
}

/**
 * 出力サイズプリセット（仕様書 §5.2）。
 * 「基本サイズ」グループの6種は必須プリセット。
 * EC・SNS・Web の各グループは任意追加プリセット。
 */
export const SIZE_PRESETS: SizePresetGroup[] = [
  {
    group: "基本サイズ",
    items: [
      { id: "sq-300", label: "正方形（小）", w: 300, h: 300 },
      { id: "card-400x300", label: "カード 4:3（小）", w: 400, h: 300 },
      { id: "card-600x400", label: "カード 3:2", w: 600, h: 400 },
      { id: "card-800x600", label: "カード 4:3", w: 800, h: 600 },
      { id: "ogp", label: "OGP / Twitter", w: 1200, h: 630 },
      { id: "full-hd", label: "フルHD", w: 1920, h: 1080 },
    ],
  },
  {
    group: "EC・商品",
    items: [
      { id: "ec-list", label: "一覧サムネ", w: 400, h: 400 },
      { id: "ec-thumb", label: "商品サムネ", w: 800, h: 800 },
      { id: "ec-main", label: "商品メイン", w: 1200, h: 1200 },
    ],
  },
  {
    group: "SNS",
    items: [
      { id: "ig-square",    label: "Instagram 正方形",       w: 1080, h: 1080 },
      { id: "ig-portrait",  label: "Instagram 縦長（4:5）",  w: 1080, h: 1350 },
      { id: "ig-landscape", label: "Instagram 横長",         w: 1080, h: 566  },
      { id: "ig-story",     label: "ストーリーズ / Reels",   w: 1080, h: 1920 },
      { id: "x-post",       label: "X（投稿）",              w: 1200, h: 675  },
      { id: "x-header",     label: "X（ヘッダー）",          w: 1500, h: 500  },
      { id: "fb-cover",     label: "Facebook カバー",        w: 851,  h: 315  },
      { id: "yt-thumb",     label: "YouTube サムネイル",     w: 1280, h: 720  },
    ],
  },
  {
    group: "Web",
    items: [
      { id: "web-card", label: "カード", w: 1024, h: 768 },
      { id: "web-banner", label: "バナー", w: 728, h: 90 },
    ],
  },
];

export const FLAT_PRESETS: SizePreset[] = SIZE_PRESETS.flatMap((g) => g.items);

export interface FitModeOption {
  id: FitMode;
  label: string;
  jp: string;
  desc: string;
}

export const FIT_MODES: FitModeOption[] = [
  {
    id: "cover",
    label: "Cover",
    jp: "全面を埋める",
    desc: "枠いっぱいに広げ、はみ出しはトリミング",
  },
  {
    id: "contain",
    label: "Contain",
    jp: "全体を収める",
    desc: "画像全体を表示、余白は背景色で補完",
  },
  {
    id: "stretch",
    label: "Stretch",
    jp: "引き伸ばす",
    desc: "縦横比を無視して枠に合わせる",
  },
];

export interface ShapeOption {
  id: ShapeType;
  label: string;
}

export const SHAPES: ShapeOption[] = [
  { id: "rect", label: "四角" },
  { id: "rounded", label: "角丸" },
  { id: "circle", label: "円" },
  { id: "ellipse", label: "楕円" },
];

export interface FormatOption {
  id: OutputFormat;
  label: string;
  ext: string;
  alpha: boolean;
}

export const FORMATS: FormatOption[] = [
  { id: "image/jpeg", label: "JPG", ext: "jpg", alpha: false },
  { id: "image/png", label: "PNG", ext: "png", alpha: true },
  { id: "image/webp", label: "WebP", ext: "webp", alpha: true },
];

/** 背景色スウォッチ（白・グレー・黒・透過） */
export const BG_OPTIONS: readonly string[] = ["#ffffff", "#f5f6f9", "#15181e", "transparent"];

export interface NameToken {
  token: string;
  label: string;
}

export const NAME_TOKENS: NameToken[] = [
  { token: "{name}", label: "元の名前" },
  { token: "{label}", label: "ラベル" },
  { token: "{n}", label: "連番" },
  { token: "{w}", label: "幅" },
  { token: "{h}", label: "高さ" },
];

/** グローバル出力設定の既定値（全プロファイル共通、仕様書 §2.1） */
export const defaultGlobal = (): GlobalOutputSettings => ({
  fit: "cover",
  shape: "rect",
  radius: 16,
  format: "image/jpeg",
  quality: 0.85,
  background: "#ffffff",
  namePattern: "{name}_{w}x{h}",
  keepMetadata: false,
  zipLayout: "byLabel",
});

let profileIdCounter = 0;

/** 出力プロファイルの一意ID */
export function createProfileId(): string {
  profileIdCounter += 1;
  return `pf-${Date.now()}-${profileIdCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

/** プリセットからプロファイルを生成する */
export function profileFromPreset(preset: SizePreset): OutputProfile {
  return {
    id: createProfileId(),
    label: preset.label,
    width: preset.w,
    height: preset.h,
    presetId: preset.id,
  };
}

/** 既定のプロファイル配列は空。ユーザーが最初の出力サイズを選ぶところから始める（UX改訂） */
export const defaultProfiles = (): OutputProfile[] => [];

/** ストアの初期出力設定（プロファイル配列＋グローバル） */
export const defaultConfig = (): OutputConfig => ({
  profiles: defaultProfiles(),
  global: defaultGlobal(),
});

/** グローバル設定カードのプレビュー等に使う、プロファイル未選択時のフォールバックサイズ */
const FALLBACK_PROFILE: OutputProfile = {
  id: "__fallback__",
  label: "OGP",
  width: 1200,
  height: 630,
  presetId: "ogp",
};

/**
 * グローバル設定と1つのプロファイルを、描画エンジン用の OutputSettings に合成する。
 * これによりエンジン（lib/fit.ts）・サムネ・プレビューは単一サイズの実装のまま流用できる。
 */
export function toSettings(global: GlobalOutputSettings, profile: OutputProfile): OutputSettings {
  return {
    width: profile.width,
    height: profile.height,
    presetId: profile.presetId ?? "custom",
    fit: global.fit,
    shape: global.shape,
    radius: global.radius,
    format: global.format,
    quality: global.quality,
    background: global.background,
    namePattern: global.namePattern,
    keepMetadata: global.keepMetadata,
  };
}

/** 代表プロファイル（先頭）で合成した OutputSettings。一覧サムネ等の単一サイズ表示に使う。
 *  プロファイル未選択（空）でもグローバル設定カードが描けるようフォールバックする。 */
export function repSettings(config: OutputConfig): OutputSettings {
  return toSettings(config.global, config.profiles[0] ?? FALLBACK_PROFILE);
}

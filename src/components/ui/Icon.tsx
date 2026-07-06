import type { CSSProperties } from "react";

const ICONS = {
  upload: "M12 16V4m0 0L7 9m5-5l5 5M5 19h14",
  image:
    "M3 5.5A1.5 1.5 0 014.5 4h15A1.5 1.5 0 0121 5.5v13a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-13z|M3 16l4.5-4.5a2 2 0 012.8 0L15 16|M14 13l1.8-1.8a2 2 0 012.7-.1L21 13|M8.5 9.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z",
  settings:
    "M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z|M19.4 13a7.7 7.7 0 000-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 00-1.7-1L14.5 3h-5l-.4 2.5a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.5L2.6 11a7.7 7.7 0 000 2l-2 1.5 2 3.5 2.4-1c.5.4 1.1.7 1.7 1L9.5 21h5l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.5-2-1.5z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  rows: "M4 5h16M4 12h16M4 19h16",
  download: "M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16",
  edit: "M4 20h4l10.5-10.5a2 2 0 000-2.8l-1.2-1.2a2 2 0 00-2.8 0L4 16v4z|M13.5 6.5l4 4",
  rotateCw: "M21 12a9 9 0 11-3-6.7M21 4v4h-4",
  rotateCcw: "M3 12a9 9 0 113 6.7M3 4v4h4",
  flipH: "M12 3v18M7 7l-4 4 4 4M17 7l4 4-4 4",
  flipV: "M3 12h18M7 7l4-4 4 4M7 17l4 4 4-4",
  zoomIn: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5M11 8v6M8 11h6",
  zoomOut: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5M8 11h6",
  move: "M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4",
  plus: "M12 5v14M5 12h14",
  trash: "M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13",
  check: "M5 12.5l4.5 4.5L19 7",
  checkCircle: "M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 12l2.5 2.5L15.5 9.5",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 6l6 6-6 6",
  chevLeft: "M15 6l-6 6 6 6",
  x: "M6 6l12 12M18 6L6 18",
  folder:
    "M3 6.5A1.5 1.5 0 014.5 5h4l2 2.5h7A1.5 1.5 0 0119 9v8.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 17.5v-11z",
  zip: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z|M12 4v2M12 8v2M12 12v2M12 16h.01",
  lock: "M6 11V8a6 6 0 0112 0v3M5 11h14v9H5z",
  shield: "M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z|M9 12l2 2 4-4",
  reset: "M3 12a9 9 0 109-9 9 9 0 00-6.4 2.7L3 8M3 4v4h4",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  sliders: "M4 8h10M18 8h2M4 16h2M10 16h10|M16 6v4M8 14v4",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  cursor: "M5 4l14 6-6 2-2 6-6-14z",
  crop: "M7 3v14h14M3 7h14v14",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  star: "M12 3l2.6 5.6 6.4.8-4.7 4.3 1.2 6.3L12 17.3 6.5 20.3l1.2-6.3L3 9.7l6.4-.8L12 3z",
  duplicate: "M9 9h10v10H9zM5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1",
  warning: "M12 3l9.5 17H2.5L12 3z|M12 10v4M12 17h.01",
  fileImage: "M6 3h8l4 4v14H6z|M14 3v4h4|M9 12.5a1 1 0 100-2 1 1 0 000 2zM7 17l3-3 2 2 3-4 3 5z",
  link: "M9 14a4 4 0 015.6 0l2-2a4 4 0 00-5.6-5.6L10 8|M15 10a4 4 0 01-5.6 0l-2 2a4 4 0 005.6 5.6L14 16",
  clipboard:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** 仕様書のラインアイコン群（24x24 viewBox のストローク／塗りパス） */
export function Icon({ name, size = 18, stroke = 2, fill = false, className, style }: IconProps) {
  const paths = ICONS[name].split("|");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

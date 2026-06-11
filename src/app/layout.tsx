import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// 見出し・数値表示用フォント（next/font で最適化読込）
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitFrame — 画像一括リサイズツール",
  description:
    "複数画像を指定サイズへ一括フィットし、ZIPでまとめてダウンロード。すべてブラウザ内で完結し、画像はサーバーに送信されません。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={outfit.variable}>
      <head>
        {/* next/font/google は Noto Sans JP の日本語サブセットを提供しないため、
            日本語本文フォントは Google Fonts の stylesheet を直接読み込む */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-canvas font-jp text-sm leading-relaxed text-text antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// GA4 測定ID（公開値のためソースへの直書きで問題なし）
const GA_MEASUREMENT_ID = "G-RHQ0MZPSB2";

// 見出し・数値表示用フォント（next/font で最適化読込）
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const SITE_URL = "https://fitframe.pages.dev";
const OGP_TITLE = "FitFrame — 画像一括リサイズツール";
const OGP_DESCRIPTION =
  "複数画像を指定サイズへ一括フィットし、ZIPでまとめてダウンロード。すべてブラウザ内で完結し、画像はサーバーに送信されません。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: OGP_TITLE,
  description: OGP_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "FitFrame",
    title: OGP_TITLE,
    description: OGP_DESCRIPTION,
    locale: "ja_JP",
    images: [{ url: "/ogp.png", width: 1536, height: 1024, alt: OGP_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: OGP_TITLE,
    description: OGP_DESCRIPTION,
    images: ["/ogp.png"],
  },
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}

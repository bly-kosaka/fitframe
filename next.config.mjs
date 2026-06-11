/** @type {import('next').NextConfig} */

// Cloudflare Pages 等の静的ホスティング向けビルドでは
// `STATIC_EXPORT=true npm run build` で `out/` に静的書き出しを行う。
// Railway 等のサーバーモードでは未設定のまま `next start` を使う。
const isStaticExport = process.env.STATIC_EXPORT === "true";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
};

// `headers()` は `output: "export"` と併用できないため、
// 静的書き出し時は public/_headers (Cloudflare Pages) 側で同等の設定を行う。
if (!isStaticExport) {
  nextConfig.headers = async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ];
}

export default nextConfig;

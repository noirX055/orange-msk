import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "db.orangemsk.ru",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // SEO (Яндекс): склейка зеркала www → основной домен через 301.
  // Дублирует правило nginx на случай, если оно не настроено.
  async redirects() {
    return [
      {
        source: "/delivery-and-payment",
        destination: "/delivery",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.orangemsk.ru" }],
        destination: "https://orangemsk.ru/:path*",
        statusCode: 301,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ]
  },
};

export default nextConfig;

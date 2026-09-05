import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/account",
          "/account/*",
          "/cart",
          "/checkout",
          "/checkout/*",
          "/api/*",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/account",
          "/account/*",
          "/cart",
          "/checkout",
          "/checkout/*",
          "/api/*",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/account",
          "/account/*",
          "/cart",
          "/checkout",
          "/checkout/*",
          "/api/*",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  const disallowList = [
    "/admin",
    "/admin/*",
    "/account",
    "/account/*",
    "/cart",
    "/checkout",
    "/checkout/*",
    "/login",
    "/register",
    "/api/checkout",
    "/api/checkout/*",
    "/api/yookassa",
    "/api/yookassa/*",
  ]

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/navigation"],
        disallow: disallowList,
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/navigation"],
        disallow: disallowList,
      },
      {
        userAgent: "Yandex",
        allow: ["/", "/api/navigation"],
        disallow: disallowList,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

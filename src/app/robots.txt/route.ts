/**
 * robots.txt в виде Route Handler (вместо app/robots.ts),
 * потому что MetadataRoute.Robots не поддерживает Яндекс-директиву Clean-param.
 */
export const dynamic = "force-static"

const disallowList = [
  "/admin",
  "/account",
  "/cart",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/",
]

const allowList = ["/", "/api/navigation"]

// Параметры, не влияющие на содержимое страницы: метки рекламы/аналитики и сортировка.
// Яндекс склеит такие URL с основной страницей и не будет тратить на них краулинговый бюджет.
const cleanParams = [
  "utm_source&utm_medium&utm_campaign&utm_content&utm_term",
  "yclid&gclid&fbclid&ysclid&_openstat&from&ref",
  "sort",
]

function block(userAgent: string, extra: string[] = []) {
  return [
    `User-agent: ${userAgent}`,
    ...allowList.map((p) => `Allow: ${p}`),
    ...disallowList.map((p) => `Disallow: ${p}`),
    ...extra,
  ].join("\n")
}

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  const body = [
    block("*"),
    block(
      "Yandex",
      cleanParams.map((p) => `Clean-param: ${p}`),
    ),
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n\n")

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

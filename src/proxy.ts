import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml, rss.xml, yandex-feed.xml (feeds for bots, no user session)
     * - api/moysklad, api/yookassa, api/yandex-market (external webhooks, no user cookies)
     * - api/search, api/navigation (public data, not user-specific)
     * - static assets by extension
     *
     * Each matched request runs supabase.auth.getUser(), which hits 5 auth tables.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|yandex-feed.xml|api/moysklad|api/yookassa|api/yandex-market|api/search|api/navigation|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|css|js|map|txt|xml)$).*)",
  ],
};

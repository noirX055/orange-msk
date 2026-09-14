<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent Quick Guide

Keep this short. Agents should first read linked docs before making changes.

- **Dev / Build**: `npm run dev`, `npm run build`, `npm start`. See [package.json](package.json) for scripts.
- **Key directories**: `src/app` (Next.js App Router), `src/components`, `src/lib`, `scripts/`, `supabase/` (DB schema and policies).
- **Env & secrets**: scripts load `.env`, `.env.local`, `.env.production` — check `scripts/*.mjs` for loading behavior. Do not commit secrets.
- **Supabase**: Database schema and RLS policies live in `supabase/*.sql` and are authoritative for runtime behaviour.
- **Background jobs & webhooks**: see `scripts/setup-webhooks.mjs`, `scripts/sync-products-from-moysklad.mjs` for MoySklad integration; these expect `MOYSKLAD_API_TOKEN`, `SUPABASE_*` env vars.
- **Server vs Client**: Project uses Next.js app router with server components (files under `src/app` are often server-side). Inspect `"use client"` markers in pages/components to determine client components.
- **Revalidation / caching**: Some API routes use `revalidate` or `revalidatePath()` — prefer using provided helpers when changing cache behaviour.

## What to do before editing code

- Run `npm run dev` locally and reproduce the issue when possible.
- Search for existing docs first: `README.md`, SQL files in `supabase/`, and `scripts/` for operational commands.
- For DB changes, update `supabase/*.sql` and mention migration steps in PR description.

## Helpful links

- README: [README.md](README.md)
- Agent instructions (this file): [AGENTS.md](AGENTS.md)
- Project entry: [package.json](package.json)

---

If you want, I can add small skills or prompts next: create an automated `scripts/*` runner skill, a `supabase` migration helper, or targeted instructions for frontend vs backend work. Which would you like first?

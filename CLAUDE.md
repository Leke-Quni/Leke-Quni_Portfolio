# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio for Leke Quni: a public site of Projects and Case Studies, plus an owner-only Admin that edits all content. Use the vocabulary in `GLOSSARY.md` (Project, Case Study, Gallery, Cover Image, Draft/Published, ...); the one architectural decision record is `docs/adr/0001-database-backed-content.md`.

`AGENTS.md` is right: this is Next.js 16 with breaking changes. Read the matching guide in `node_modules/next/dist/docs/` before using a Next API.

## Commands

- `npm run dev` / `npm run build` / `npm run lint` / `npx tsc --noEmit`. There is no test suite (a deliberate v1 decision).
- `npm install` runs `prisma generate` (postinstall); the client is emitted to `generated/prisma/` (gitignored). After any `prisma/schema.prisma` change run `npx prisma generate` and **restart the dev server**, or it keeps the stale client and fails with "Unknown argument".
- `npx prisma migrate deploy` applies migrations; `npx prisma db seed` upserts the three placeholder Projects (`prisma/seed.ts`).
- `npx vercel env pull .env.local` refreshes the Blob credentials (`VERCEL_OIDC_TOKEN`, `BLOB_STORE_ID`) used locally.

## Architecture

- **Stack:** Next.js 16 App Router with `cacheComponents` and `partialPrefetching`, Tailwind 4, Prisma 7 (`pg` driver adapter, `src/lib/prisma.ts`), Auth.js v5 beta (GitHub only), Vercel Blob. Hosted on Vercel; functions pinned to `fra1` in `vercel.json` to sit next to the database.
- **Public reads are cached.** `src/lib/projects.ts` uses `"use cache"` with tag `projects` and `cacheLife("max")`; Home and `/projects/[slug]` are prerendered from it. Every Admin mutation in `src/app/admin/actions.ts` must call `updateTag("projects")` (and `revalidatePath("/admin", "layout")`) or the public site goes stale. The CV address is cached under tag `cv` (`src/lib/site.ts`), and `/cv.pdf` is a dynamic route that redirects to the Blob file.
- **Admin auth has three layers:** `src/proxy.ts` (matcher `/admin`), `requireAdmin()` called by every Admin page **and** every server action, and the `signIn` check in `src/auth.ts` that admits only the GitHub id in `ADMIN_GITHUB_ID`. Admin pages must `await connection()` before `requireAdmin()` (Auth.js generates random values, which Next rejects during prerender) and wrap their async part in `<Suspense>` with a skeleton.
- **Project editing:** `ProjectForm` (client) posts to server actions that validate through `src/lib/project-input.ts` (zod). Summary, Reasoning and Technical Depth are separate Markdown fields, each with its own image Gallery (`*Images` columns). `order` is an integer rewritten by the drag-and-drop `reorderProjects` action.
- **Images:** uploads go through `putImageDeduped` (`src/lib/blob-upload.ts`), which names files `images/<content hash>.<ext>` so identical files are reused. `src/lib/blob-cleanup.ts` deletes images from Blob on save or Project delete once no Project references them. `RemoteImage` uses `next/image` only for URLs in this store (`src/lib/image-url.ts`, matching `remotePatterns` in `next.config.ts`) and a plain `<img>` for any other URL.
- **Site URL** comes from `SITE_URL`, else `VERCEL_PROJECT_PRODUCTION_URL`, else localhost (`src/lib/site-url.ts`); it feeds `metadataBase`, the sitemap and robots.
- The theme is always dark navy; there is no light theme.

## Gotchas

- **Local and production share one database.** `.env`'s `PRISMA_DATABASE_URL` is the production database, so migrations, seeding and anything published from `localhost:3000/admin` affect the live site. Saving locally does not refresh the live cache. Agents are blocked from running `prisma migrate deploy` on it; ask the user to run it (`! npx prisma migrate deploy`), and run it *before* pushing code that needs the new schema, because Vercel builds do not migrate.
- Write migration SQL by hand or with `prisma migrate diff -o <file>`; redirecting CLI stdout into the `.sql` file captures a "Loaded Prisma config" log line and breaks the migration.
- Environment: `PRISMA_DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_ID`. Local and production use separate GitHub OAuth apps (callback `/api/auth/callback/github`). Blob uses OIDC credentials, not a token.
- `staleTimes.dynamic: 30` keeps visited Admin pages in the browser for 30 s; edits made elsewhere can take that long to appear.

# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router project with source under `src/`. Route files live in `src/app`, grouped by access level such as `src/app/(auth)` and `src/app/(unprotected)`. Reusable UI components live in `src/components/ui`, shared utilities in `src/lib`, database helpers and actions in `src/db`, and constants/schemas in `src/constants`. Static assets, logos, and icons are stored in `public/`.

## Build, Test, and Development Commands
- `npm run dev`: start the local Next.js dev server at `http://localhost:3000`.
- `npm run build`: create a production build and catch compile-time issues.
- `npm run start`: serve the production build locally after `npm run build`.
- `npm run lint`: run ESLint across the repository.

Run commands from the repository root.

## Coding Style & Naming Conventions
Use TypeScript with `strict` mode expectations and prefer the existing `@/*` import alias for internal modules. Follow the local style already present in each area:
- route files: lowercase Next.js names such as `page.tsx`, `layout.tsx`, `route.ts`
- React components: `PascalCase` file and component names such as `SignInForm.tsx`
- helpers/constants: lowercase or domain-based names such as `utils.ts`, `schemas.ts`

Prefer functional React components, keep shared logic in `src/lib` or `src/db`, and use ESLint (`eslint.config.mjs`) as the formatting guard before opening a PR.

## Testing Guidelines
There is no dedicated automated test suite yet. Until one is added, treat `npm run lint` and `npm run build` as required validation for every change. For API routes and auth flows, include manual verification notes in the PR describing the path tested, inputs used, and observed result.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `Add semester form` and `Complete profile set up`. Keep commits focused and descriptive, with one change theme per commit.

Pull requests should include:
- a clear summary of behavior changes
- linked issues or task references
- screenshots for UI changes
- notes for any new environment variables, Supabase changes, or API behavior

## Security & Configuration Tips
Keep secrets in `.env` only and never commit credentials. Review any changes touching `src/lib/supabase`, auth actions, or API routes carefully because they affect request scope, session handling, and database access.

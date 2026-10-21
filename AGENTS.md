# 0xAlex Check

## Project
Alex's public site for trying what indie builders and AI projects make: weekly lists of projects he checked,
published reviews, and a budget he spends on paid access. A private admin (one password) runs the weekly
workflow, reviews and the X scheduler.

The public website and the admin are separate surfaces. Redesign work targets the public website; change the
admin only where a website feature needs data entered (and keep that change small).

## Project documentation
- Read README.md for setup, security model and the weekly workflow.
- Read DESIGN.md before any UI work on the public website.
- Keep documentation accurate as decisions change.

## Skills
Use relevant installed skills, with effort proportional to the task:
- agent-skills for planning, implementation, testing, and review.
- ui-ux-pro-max for the design system; Taste (design-taste-frontend) for implementation.
- design-motion-principles for motion refinement.
- web-design-guidelines for UI review.
- playwright-cli for browser verification.
Follow the approved design system when skill recommendations differ.

## Design workflow
- Use UI/UX Pro Max for design planning and Taste for frontend implementation.
- After the owner approves a visual direction, record it in DESIGN.md.
- Follow DESIGN.md for subsequent UI work and update it when agreed decisions change.
- Use relevant motion, accessibility review, and browser-testing skills as needed.

## Engineering
- Prefer simple implementations and clear module boundaries. Match the surrounding code style.
- Editorial data is one versioned JSONB document (`weekendcheck.workspace`); change it only through
  `applyAction` in `src/lib/editorial-actions.ts` so validation and revision checks apply.
- Validate all public input server-side; keep credentials and service keys server-side and out of Git.
- Public pages read data through `src/lib/public-data.ts`; never expose drafts, notes or admin-only fields.

## Commands and verification
Run from the repo root (npm):
- Install: `npm install`
- Env: `.env` holds `DATABASE_URL` (Supabase session pooler). This is the **production** database:
  reading is fine, writes go through the app's actions only, and never run `npm test` or seeds against it.
  Production settings (`APP_URL`, `MEDIA_STORAGE`, Supabase keys) live in Vercel.
- Migrations: `npm run db:migrate`; media bucket: `npm run storage:init`.
- Dev server: `npm run dev` (health check: `GET /api/health`).
- Typecheck: `npx tsc --noEmit`; lint: `npm run lint`.
- Tests: `npm test` (embedded Postgres, unit), `npm run test:browser` (Playwright).
- Build: `npm run build`.
- Stop servers: `pkill -f next-server`.
Run relevant checks; add tests for behavior changes and bug fixes.
Verify UI changes in the browser at desktop and mobile widths.
Report completed checks and anything unverified.

## Git and environments
Work locally. Make focused commits at useful milestones. Push completed, verified changes to `main`
(Vercel deploys `main` to https://check.0xalex.com). No feature branches or pull requests unless asked.
Preserve unrelated work. Before pushing new kinds of files, check that nothing secret is tracked.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

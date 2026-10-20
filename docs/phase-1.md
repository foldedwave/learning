# Phase 1 – Foundations and Roman numerals

Working notes for Phase 1 of the [spec](spec.md). The ticket list lives outside the repo, so this file records the audit, what has been built, where it differs from the spec, and what is still to do.

## P1-01 audit (20 Oct 2026)

| Item                  | Found                                                                                                     | Decision                                                                                                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SvelteKit             | 3.0.1 (stable)                                                                                            | The spec says "stay on SvelteKit 2", written when 3 was in prerelease. The app was already on 3 and it is now stable, so we stay on 3. Config lives in `vite.config.ts`; env vars are declared in `src/env.ts` and read from `$app/env/private` (the spec's `$env/static/private` no longer exists). |
| Svelte                | 5.57, runes forced on                                                                                     | Matches the spec.                                                                                                                                                                                                                                                                                    |
| Node                  | 22.22                                                                                                     | Matches (22 LTS or newer).                                                                                                                                                                                                                                                                           |
| Adapter               | `adapter-auto`                                                                                            | Switched to `@sveltejs/adapter-node` 6.                                                                                                                                                                                                                                                              |
| Styling               | Plain CSS, one global stylesheet                                                                          | New design tokens in `src/app.css`; legacy styles scoped under `.legacy-roman`.                                                                                                                                                                                                                      |
| Tests                 | Vitest (client, server, storybook projects), Playwright                                                   | Kept. New unit tests run in the `server` project.                                                                                                                                                                                                                                                    |
| Roman numerals        | Single page, localStorage progress, remote function for the curriculum, `Math.random` question generation | Preserved at `/legacy/roman-numerals`. Conversion logic extracted to `src/lib/content/maths/number/roman-numerals/convert.ts`; the converter was rebuilt as the `roman-builder` model.                                                                                                               |
| Experimental features | `remoteFunctions` and async Svelte are enabled and used by the legacy page only                           | New code uses load functions, form actions and `+server.ts` endpoints, as the spec asks. Remove the flags when the legacy route is retired.                                                                                                                                                          |

## Built so far

- **Database:** all 13 tables from the spec in `src/lib/server/db/schema.ts`, with a drizzle-kit migration in `drizzle/` that runs automatically on start. `DATABASE_PATH` sets the file (default `data/learning.db`).
- **Auth:** first-run setup, profile picker, child picture PIN (3 of 9 pictures), parent digit PIN, argon2id hashes, hashed session tokens in `httpOnly` cookies, idle expiry (child 4 h, parent 30 min), lock-out after 5 failures in 10 minutes. The parent can open any child page in preview mode, where answers are marked but nothing is recorded.
- **Content model:** types and Zod validation in `src/lib/content`; `pnpm validate:content` and the unit tests check IDs, prerequisites (no cycles) and references. A seeded mulberry32 RNG means any question regenerates exactly from its item id.
- **Roman numerals topic:** 4 skills (to 100, to 1,000, years, roof bar), 11 generators, 5 misconceptions detected from wrong answers (additive reading, subtracting across place values, four repeats, reversed pair, ignoring the roof bar), 6 Learn cards plus a check-in, reteach cards, 4 Stretch tasks.
- **Engine (`src/lib/engine`, pure TypeScript):** evidence, mastery score, level rules, spaced review (1, 3, 7, 14, 30, 60 days), stuck detection, star rules and caps, strengths/weaknesses/ahead, adaptive practice difficulty. All thresholds are in `config.ts`.
- **Pages:** profile picker, setup, My Day (continue, reviews due, suggestions), subject hub, strand stepping stones, topic page with Learn / Practise / Check / Stretch, My Progress, Rewards (balance and recent stars), and a minimal parent page (skill table per child, add a child).
- **API:** `POST /api/sessions`, `POST /api/sessions/[id]/finish`, `POST /api/attempts`, `POST /api/stretch`. JSON only, same origin, and every call checks the session again; a child can only touch their own rows.
- **UI kit:** Button, Card, TopicTabs, Breadcrumb, SpeakButton (browser speech), StarCounter, SteppingStones, Feedback, HintButton, Celebration, PinPad, ModelFrame, plus question renderers and a Roman keypad.

## Differences from the spec

- **Token colours:** `--maths`, `--science`, `--nudge` and a new `--star` were darkened so text meets 4.5:1 on both white and `--bg` (the spec's starting values did not).
- **`mastery` table:** added `practise_attempts`, `practise_correct` (for the 60% rule) and `demoted_at` (for "demoted in the last 14 days").
- **`reward_event` table:** added `topic_id`, for the "once per topic per day" Learn cap.
- **`Question`:** added `skillId` and `answer` (shown after answering, used by the generator tests) and an optional `keypad`. Answers, explanations and the marking function are stripped before a question is shown.
- **Check on a Secure skill** counts as a review (5 questions), so a Secure record can be confirmed or demoted from the Check tab.
- **Generator repeat test:** "under 20% repeats where the answer space allows" is checked against the expected number of distinct values for each generator's real answer space (some easy ranges have only ~24 values).

## Still to do in Phase 1

- Badges (definitions in code, `badge_award` rows) and streaks.
- Child settings page (text size, sound, voice); the stored `fontScale` is already applied.
- "View as" a child for the parent (read-only, with that child's data).
- Quick prerequisite check (3 questions) when stuck; today the child is linked to the prerequisite's practice.
- Playwright + axe accessibility checks on every child page.
- CI workflow (type-check, lint, unit tests, content validation, Playwright).
- Backups and scheduled jobs (Operations section).
- Retire `/legacy/roman-numerals` once both children have used the new topic for a week, then drop the experimental flags.

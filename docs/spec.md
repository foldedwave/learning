# Home Learning Suite – Technical Specification

Oct 20, 2026 · @David

## Scope

This spec turns the [Site Plan](https://claude.ai/code/artifact/449c68b0-d461-4316-a0f5-4a6058240d3c) into buildable requirements for the existing SvelteKit site. Phases 1–3 (foundations, Maths core, plans and parent area) are specified in full and ticketed in the Tickets tab; Phases 4–6 are specified here at design level and will be ticketed later.

**v1 (Phases 1–3) delivers**

- Child profiles with a picture PIN, and a PIN-protected parent area.
- One shared topic template (Learn, Practise, Check, Stretch) driven by content files.
- A question engine with seeded generators, exact marking and misconception detection.
- A mastery engine with spaced review, strengths and weaknesses.
- An adaptive Maths diagnostic and three Maths strands: Number and place value, Calculation, and Fractions, decimals and percentages.
- Roman numerals rebuilt as the first topic on the template.
- Oak National Academy curriculum data, quizzes and videos imported for those strands.
- Stars, badges and streaks, plus parent-set real-world rewards.
- A weekly plan generator, parent plan builder, dashboard, child reports and a printable record of work.

**Not in v1**

- LLM features (Phase 4), Science (Phase 4) and English (Phase 5).
- Themes and skins beyond the default (tokens are in place from day one).
- Hosting for anyone beyond this family: no sign-up, no multi-family accounts.
- Offline mode and native apps.

## Users and roles

There are two roles, child and parent, and a child can only ever see their own data.

| Capability | Child | Parent |
| --- | --- | --- |
| Sign in | Tap avatar, then optional 3-picture PIN | 4–6 digit PIN from the profile picker |
| Session length | Until sign-out or 4 hours idle | 30 minutes idle |
| Do activities, see own progress and rewards | Yes | Can preview any topic without recording attempts |
| See other child's data | No | Yes |
| Edit plans, rewards, settings | No | Yes |
| Approve content and see LLM history | No | Yes |
| Add or remove children | No | Yes |

- A first-run setup screen creates the parent PIN and the first child profile when the database is empty.
- Children are identified internally by ID; only the display name is shown or sent anywhere.
- The parent can “view as” a child (read-only) to see exactly what the child sees.

## Starting point

The current site is a SvelteKit app with one standalone Roman numerals page. It is kept running throughout and becomes the first topic on the new template.

1. **Audit (ticket P1-01).** Record the current SvelteKit, Svelte and Node versions, adapter, styling approach and how the Roman numerals logic is structured. Note any interactive pieces worth keeping.
2. **Preserve.** Move the existing page to `/legacy/roman-numerals` so it stays usable while the new version is built.
3. **Upgrade if needed.** If the app is older than SvelteKit 2 / Svelte 5, upgrade first, before new code is written on top.
4. **Extract.** Move conversion logic (number ↔ numeral, validation) into `src/lib/content/maths/number/roman-numerals/` as pure functions with unit tests.
5. **Rebuild (ticket P1-14).** Recreate the topic from content files: Learn cards, generators, misconceptions and the existing interactive piece wrapped as a model component.
6. **Retire.** Once both children have used the new version for a week, delete the legacy route.

## Tech stack and project structure

Stay on the latest stable SvelteKit 2 with Svelte 5 runes; SvelteKit 3 is only in prerelease (`@next`) as of August 2026 ([source](https://svelte.dev/blog/whats-new-in-svelte-august-2026)), so plan that upgrade once it is stable.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | SvelteKit 2 (latest 2.x), Svelte 5 runes, TypeScript strict | Already in use; one codebase for pages and server |
| Adapter | `@sveltejs/adapter-node` | Runs on a home machine or small server |
| Database | SQLite via `better-sqlite3` | One file, no server, ample for two learners |
| ORM and migrations | Drizzle ORM and drizzle-kit | Typed schema, plain SQL migrations, added by the Svelte CLI (`npx sv add drizzle`) |
| Validation | Zod | Validates content files, form input and LLM JSON output |
| Styling | Plain CSS with custom properties (design tokens), scoped Svelte styles | No framework needed; tokens make themes easy later |
| Fonts | Lexend, self-hosted | Highly legible; no third-party font requests |
| PIN hashing | `@node-rs/argon2` | Strong, fast hashing for short PINs |
| Tests | Vitest (unit), Playwright (end to end) | Both added by the Svelte CLI |
| LLM (Phase 4) | `@anthropic-ai/sdk`, server-only | Key never reaches the browser |

**Server data flow.** Use `+page.server.ts` load functions and form actions for page data and simple submissions. Use `+server.ts` JSON endpoints for the question runner, which posts each answer without a page reload. Avoid experimental features (such as remote functions) until they are stable.

**Project structure**

```text
src/
  app.css                      design tokens + base styles
  hooks.server.ts              session lookup -> event.locals.child / locals.parent
  params/subject.ts            matcher: maths | english | science
  routes/
    +page.svelte               profile picker
    setup/                     first-run setup
    (child)/                   layout requires a child session
      today/                   My Day
      [subject=subject]/       subject hub
        [strand]/              strand page
          [topic]/             topic layout (header, tabs)
            learn/ practise/ check/ stretch/
      diagnostic/[subject=subject]/
      progress/  rewards/
    parent/                    layout requires a parent session
      dashboard/ plans/ children/[id]/ content/ rewards/ settings/ record/
    api/
      attempts/+server.ts      POST an answer, returns marking + mastery change
      sessions/+server.ts      start / finish a learning session
      llm/...                  Phase 4
    legacy/roman-numerals/     existing page, until retired
  lib/
    components/ui/             Button, Card, Tabs, Breadcrumb, ...
    components/questions/      one renderer per question type
    components/models/         interactive models (PlaceValueChart, FractionWall, ...)
    content/                   topic definitions, by subject/strand/topic
    engine/                    pure TS: mastery, review, diagnostic, plan, rewards
    server/db/                 schema.ts, client, queries
    server/auth.ts             sessions, PIN checks
    server/oak/                Oak import + client
    server/llm/                Phase 4
scripts/
  oak-import.ts  validate-content.ts  backup.ts
```

Everything in `lib/engine` is pure TypeScript with no database or SvelteKit imports, so it can be unit tested in isolation and reused on client and server.

## Content model

All teaching content lives in typed files under `src/lib/content`, validated by Zod at build time; the database stores only progress, keyed by stable skill IDs.

**Hierarchy.** Subject → Strand → Topic → Skill. A topic is one page with four tabs; it teaches 1–4 skills. A skill is the smallest unit that gets a mastery record.

**IDs** are dotted, lowercase and never reused: `maths.number.roman.read-to-100`. Renaming a title is fine; changing an ID needs a migration.

**Ladder stage.** Each skill has a stage number matching its usual year group (5, 6, 7, 8). Stages order skills within a strand; they are never shown to the child.

```ts
// src/lib/content/types.ts (abridged)
export interface Skill {
  id: string;                 // 'maths.number.roman.read-to-100'
  title: string;              // child-facing
  stage: number;              // 5 | 6 | 7 | 8 ...
  prerequisites: string[];    // skill IDs
  targetSeconds: number;      // typical time per question when fluent
  oak?: { unitSlug: string; lessonSlugs: string[] };
}

export interface TopicDefinition {
  id: string;                 // 'maths.number.roman'
  subject: 'maths' | 'english' | 'science';
  strand: string;             // 'number'
  title: string;
  icon: string;               // emoji or icon name
  skills: Skill[];
  learn: LearnCard[];         // 3-6 cards
  generators: QuestionGenerator[];
  misconceptions: Misconception[];
  stretch: StretchTask[];
  resources: ExternalResource[];
}

export type LearnCard =
  | { kind: 'explain'; title: string; body: string; speak?: string }   // body = markdown
  | { kind: 'model'; title: string; model: string; props?: object; prompt: string }
  | { kind: 'worked-example'; title: string; steps: { text: string; highlight?: string }[] }
  | { kind: 'check-in'; question: Question }                        // "did that make sense?"
  | { kind: 'oak-video'; lessonSlug: string };                       // optional, after own cards

export interface Misconception {
  id: string;                 // 'roman.additive-only'
  skillId: string;
  description: string;        // parent-facing: 'Adds every symbol, so reads IV as 6'
  feedback: string;           // child-facing, shown on a matching wrong answer
  reteach: LearnCard[];       // pre-written "show me another way"
}
```

**Questions and generators.** A generator produces a fresh question from a seed and a difficulty, so practice never runs out and any question can be regenerated exactly from its stored seed.

```ts
export interface QuestionGenerator {
  id: string;                 // 'roman.to-arabic'
  skillId: string;
  generate(rng: Rng, difficulty: 1 | 2 | 3): Question;
}

export interface Question {
  itemId: string;             // `${generatorId}:${seed}:${difficulty}`
  type: 'numeric' | 'choice' | 'text' | 'order' | 'drag-match' | 'model';
  prompt: string;             // markdown, may include inline maths
  speak?: string;
  choices?: { value: string; misconceptionId?: string }[];
  hints: string[];            // shown one at a time
  scaffold?: ScaffoldStep[];  // partially worked steps for early practice
  explanation: string;        // shown after answering
  mark(response: unknown): { correct: boolean; misconceptionId?: string };
}
```

- `Rng` is a small seeded generator (for example mulberry32); `Math.random` is never used in generators.
- `mark` is pure and runs on the server for recorded attempts. The client may call it for instant feedback, but the server result is the one stored.
- Wrong-answer patterns map to misconceptions in `mark` (for example, a Roman numeral answer equal to the additive reading returns `roman.additive-only`).
- Oak quiz questions are converted into static `Question` objects at import time and stored under `src/lib/content/oak/` with their attribution.

## Data model

Thirteen SQLite tables hold people, progress, plans and rewards; skills and content are not in the database, only referenced by skill ID. All timestamps are stored as UTC ISO strings; “a day” is calculated in Europe/London time.

| Table | Columns | Notes |
| --- | --- | --- |
| `child` | id, display\_name, avatar, pin\_hash (nullable), interests (JSON array), reading\_age, year\_group, settings (JSON), created\_at, archived\_at | Settings hold read-aloud voice, sound on/off, font size |
| `parent` | id (always 1), pin\_hash, settings (JSON), created\_at | Settings hold time budgets, plan mix, reward options |
| `auth_session` | id (random 32 bytes, hashed), role, child\_id (nullable), expires\_at, last\_seen\_at | One row per signed-in browser |
| `pin_attempt` | id, role, child\_id, success, created\_at | For lock-out after 5 failures in 10 minutes |
| `learning_session` | id, child\_id, skill\_id, topic\_id, tab, source (own / oak / external), plan\_item\_id (nullable), started\_at, ended\_at, completed | One per tab visit; drives time-on-task and the own-vs-external mix |
| `attempt` | id, child\_id, learning\_session\_id, skill\_id, item\_id, mode (practise / check / review / diagnostic / stretch), response (JSON), correct, hints\_used, scaffolded, time\_ms, misconception\_id, created\_at | Append-only; never edited or deleted |
| `mastery` | child\_id + skill\_id (primary key), level, score, attempts, correct, last\_practised\_at, secure\_at, mastered\_at, review\_step, next\_review\_at, provisional, updated\_at | Recalculated from the engine after each attempt |
| `plan` | id, child\_id, week\_start (Monday), status (draft / approved / archived), child\_note, parent\_summary, created\_at, approved\_at | One per child per week |
| `plan_item` | id, plan\_id, day (0–4), slot, skill\_id, topic\_id, tab, category (weak / review / stretch / new / parent), minutes, locked, status (todo / done / skipped), custom\_title | Parent-added items use custom\_title and may have no skill |
| `reward_event` | id, child\_id, kind, stars, reason, skill\_id, created\_at | Balance = sum of stars minus spent |
| `badge_award` | child\_id + badge\_id, awarded\_at | Badge definitions live in code |
| `real_reward` | id, child\_id (nullable = either child), title, star\_cost, active, claimed\_at, approved\_at | Set and approved by the parent |
| `resource_check` | url (primary key), last\_checked\_at, status\_code, ok | Result of the monthly link checker |

Phase 4 adds `llm_exchange` (child\_id, feature, skill\_id, prompt, response, model, tokens\_in, tokens\_out, cached, flagged, created\_at) and `llm_cache` (key, response, created\_at).

**Indexes:** `attempt (child_id, skill_id, created_at)`, `attempt (child_id, created_at)`, `learning_session (child_id, started_at)`, `mastery (child_id, next_review_at)`, `plan (child_id, week_start)` unique.

## Learning engine

The engine (`src/lib/engine`) turns each attempt into an updated mastery record using the fixed rules below; every threshold is a named constant in `engine/config.ts` so it can be tuned later.

**Evidence per attempt** (e, from 0 to 1)

| Attempt | e |
| --- | --- |
| Correct, no hints | 1.0 |
| Correct after 1 hint | 0.7 |
| Correct after 2+ hints or with scaffold | 0.4 |
| Wrong | 0 |
| Correct but slower than 3 × targetSeconds | e × 0.8 |

**Mastery score** (S, 0–100) is an exponentially weighted average, so recent answers count most:

```latex
S_{new} = S + \alpha \, (100e - S)
```

with α = 0.2 for practise, 0.3 for check, review and diagnostic, and 0.1 for stretch. S starts at 0.

**Levels.** A skill moves between five levels as shown; “correct” in the 60% rule means e ≥ 0.7, and the rule needs at least 5 practise attempts.

&#91;embedded content: mastery levels · 5 states, promotions and demotions\]

A Check is 10 questions at difficulty 2–3 with no hints. A Review is 5 mixed questions. Mastered and Secure skills can be demoted, so the record stays honest.

**Spaced review.** Review intervals are 1, 3, 7, 14, 30 and 60 days. Reaching Secure sets step 0 (review tomorrow). A review of 80% or more moves up one step; 60–79% repeats the step; under 60% resets to step 0 and applies the demotion rules.

**Stuck detection** (within one learning session)

- Trigger when two wrong answers share a misconception, or after three wrong answers in a row.
- Show the matching misconception's pre-written reteach cards, or the topic's alternative explanation if none matches. From Phase 4, offer the LLM “Show me another way” after those.
- If any prerequisite has S < 60 or is below Secure, offer a 3-question quick check on it. A failed quick check adds that prerequisite to today's queue.

**Strengths and weaknesses** (recalculated after every session and nightly)

- **Weak:** level Learning or above, and any of S < 50 after 2+ sessions, the same misconception 3+ times in 14 days, or a demotion in the last 14 days.
- **Strong:** Secure or above, with 85%+ correct in the last 20 attempts and median time within targetSeconds, or 2+ Stretch tasks completed.
- **Ahead:** any Secure skill whose stage is above the child's year group. Used for the dashboard and for choosing Stretch work.

## Diagnostic placement

The diagnostic places each child on every strand of a subject in 15–20 minutes by searching up and down that strand's ordered skill list, not by testing every skill.

1. Order the strand's skills by stage, then by prerequisite depth.
2. Start at the first skill whose stage equals the child's year group.
3. Ask 2 questions at difficulty 2. Both correct counts as a pass; one correct asks a third question, which decides.
4. Binary search: on a pass, jump halfway towards the top of the remaining range; on a fail, jump halfway down. Stop after 6 probes per strand or when the range closes.
5. The placement point is the highest passed skill.
6. Set records: skills at or below the placement point become Secure with `provisional = true` and a review in 3 days. The first failed skill above it becomes Learning. Skills further up stay Not started.
7. A provisional skill that fails its first review drops to Developing and loses the flag, so a lucky diagnostic corrects itself within a week.

**Rules for the experience**

- Shown to the child as a “warm-up quest”, never a test. No marks or right/wrong feedback during it; a progress bar fills instead.
- Split into short sections of one strand each, with a break screen between. It can be paused and resumed.
- Every answer is recorded with `mode = 'diagnostic'` and earns participation stars only.
- The parent can rerun it at the start of each term. A rerun only ever raises provisional levels, never lowers earned ones.

## Weekly plan generator

`engine/plan.ts` exports one pure function, `generatePlan(input): PlanDraft`, run every Saturday at 08:00 for each child and on demand from the plan builder; the parent approves the draft before Monday.

**Input:** the child's mastery records, the skill graph, the last 14 days of sessions, the time budget (default 5 days × 3 sessions × 25 minutes), the mix (default weak 50%, review 20%, stretch 20%, new 10%) and any locked items carried from the parent.

**Candidates and priority** (only unlocked skills: every prerequisite at Secure or above)

| Category | Candidates | Priority | Tab |
| --- | --- | --- | --- |
| Weak | Skills flagged weak; if a weak skill has a weak prerequisite, the prerequisite replaces it | (50 − S) / 50 + 0.2 × misconceptions in 14 days | Practise (Learn first if not visited in 14 days) |
| Review | Skills with next\_review\_at in the coming week | 1 + days overdue / interval | Check (review mode) |
| Stretch | Strong skills with unfinished Stretch tasks, or the next skill up a strong strand | S / 100 | Stretch, or Learn for a new skill |
| New | Not-started skills whose prerequisites are all Secure | 1 / stage, so earlier skills come first | Learn |

Each category's priority is multiplied by 1.2 if its subject has had no session in the last 7 days, so no subject is neglected.

**Filling the week**

1. Slot count = days × sessions (15 by default). Give each category its share, rounded, with any remainder going to Weak.
2. Fill each category with its highest-priority candidates. If a category runs short, pass the spare slots to Weak, then Review, then New.
3. Place items into days: at least one session per subject each day where possible, at most 2 sessions per skill per day, the same skill not on consecutive days unless it is weak, and review items no earlier than their review date.
4. Within a day, order hardest first: weak, then new, then review, then stretch.
5. Locked parent items keep their slots; parent-added items (such as “Museum trip”) take a slot with no skill.

**Mid-week rebalance.** After each completed session, if a planned skill has reached Secure early it is swapped for the next candidate in its category. If a child triggered stuck detection twice on a skill, its prerequisite is added the next day. Approved plans are only changed in unlocked future slots, and every change is listed for the parent.

**Output:** a `PlanDraft` with items and a one-line reason each (“Weak: 3 misconceptions this fortnight”), shown in the plan builder. In Phase 4 the LLM writes the child's weekly note and the parent summary from this output.

## Rewards

`engine/rewards.ts` turns events into stars, badges and streak updates; star values are weighted so that effort on weak skills earns at least as much as success on strong ones.

| Event | Stars | Cap |
| --- | --- | --- |
| Correct answer (practise, check, review) | 1 | 20 per skill per day |
| Wrong answer then correct on retry | 1 | Counts within the same cap |
| Learn tab completed | 5 | Once per topic per day |
| Session completed | 5 | None |
| Diagnostic section completed | 10 | Once per section |
| Level up (any level) | 15 | None |
| Weak skill reaches Secure | 25 bonus | None |
| Beat previous best Check score on a skill | 10 | Once per skill per day |
| Stretch task attempted | 10 | 3 per day |
| Planned day completed | 20 | Once per day |

Stars are never deducted. Spent stars (real-world rewards and collection items) are recorded as negative `reward_event` rows, so the balance is always the sum.

**Badges v1** (defined in code; awarded once)

| Badge | Rule |
| --- | --- |
| First Steps | First session completed |
| Secure Start | First skill reaches Secure |
| Memory Master | First skill reaches Mastered |
| Bounce Back | A skill reaches Secure after stuck detection fired on it |
| Strand Explorer | 10 skills Secure in one strand |
| Full Week | Every planned session in a week completed |
| Stretcher | 5 Stretch tasks completed |
| Roman Ruler | All Roman numerals skills Secure |

**Streak.** A day counts when the day's planned sessions are completed (or 2 sessions if there is no plan). Weekends neither break nor extend a streak. One missed weekday per Monday–Friday week is forgiven automatically as a rest day.

**Real-world rewards.** The parent creates rewards with a star cost. The child taps “Claim”, which deducts stars and notifies the parent dashboard; the parent marks it as given.

**Celebrations.** A short animation (under 1.5 seconds) for level-ups and badges, skippable with a tap and disabled when the device asks for reduced motion. Collection items (Phase 6) will spend the same stars.

## LLM service (Phase 4)

All LLM use goes through one server-only module, `src/lib/server/llm`, exposed as a few fixed-purpose endpoints; there is no free-text chat and the browser never sees the API key or raw prompts.

| Endpoint | Purpose | Input from client | Output (Zod-validated JSON) |
| --- | --- | --- | --- |
| `POST /api/llm/explain` | “Show me another way” | skillId, itemId, last 3 responses | `{ steps: string[], tryThis: Question-like }` |
| `POST /api/llm/writing-feedback` | Feedback on a writing task (Phase 5) | taskId, text | `{ strengths: [string, string], target: string, targetSkillId }` |
| `POST /api/llm/mark-open` | Mark an open answer against a model answer | itemId, text | `{ score: 0–2, feedback: string }` |
| `POST /api/llm/parent-summary` | Weekly struggle diagnosis and summary | childId (parent session only) | `{ summary: string, concerns: string[] }` |

**Prompt building.** Templates live in `server/llm/prompts/*.ts` as functions. The server, not the client, adds context: the authored explanation, the misconception description, any Oak transcript for the lesson, the child's first name, interests and reading age. The model is asked for JSON only; a response that fails Zod validation is retried once, then the feature falls back to the pre-written reteach cards.

**System prompt rules (all features)**

- Audience is a child aged 10–12; warm, encouraging, British English, under 150 words.
- Never give the final answer to the question being practised; work a parallel example instead.
- Stay on the topic supplied; refuse anything else with a fixed friendly message.
- Use only facts in the supplied material for Science and English content.

**Limits, cost and caching**

- Default 30 calls per child per day, set in parent settings; over the limit, the pre-written help is shown.
- Two models, both set by environment variables (`LLM_MODEL_FAST` for explanations and marking, `LLM_MODEL_WRITING` for writing feedback), so the parent can trade cost against quality.
- `explain` responses are cached by `hash(skillId, misconceptionId, interestsKey, readingAge)` for 30 days.
- Token use is logged per call and totalled monthly on the parent dashboard.

**Safety and logging**

- Every call is stored in `llm_exchange` and shown in the parent's LLM history, with a flag button.
- Output passes a blocklist filter and length check before display; anything caught is logged as flagged and the fallback is shown.
- Only the child's first name or nickname, interests and learning data are sent. No surname, location, photos or free personal text.
- `ANTHROPIC_API_KEY` is read with `$env/static/private`, so SvelteKit refuses to bundle it into client code.

## Oak and external resources

Oak content enters through an offline import script, never live calls from a child's page, so the site stays fast, works within Oak's limits and every imported item is reviewable in git.

**What Oak provides.** All endpoints are read-only GET requests ([source](https://open-api.thenational.academy/docs/api-endpoints/endpoints-overview)). The documentation highlights four that we need: `GET /sequences/{sequence}/units` (units in order), `GET /lessons/{lesson}/summary` (including misconceptions and suggested responses), `GET /key-stages/{keyStage}/subject/{subject}/questions` (quiz questions and answers) and `GET /lessons/{lesson}/assets` (a lesson's resources) ([source](https://open-api.thenational.academy/docs)). The standard limit is 1,000 requests per hour per user ([source](https://open-api.thenational.academy/docs/about-oaks-api/api-limits)). The bulk JSON per subject and phase is the simplest starting point ([source](https://open-api.thenational.academy/bulk-download)).

**Import pipeline** (`scripts/oak-import.ts`, run by hand each term)

1. Download the KS2 and KS3 bulk JSON for Maths (Phase 2), then Science and English (Phases 4–5), into `data/oak/raw/` (git-ignored).
2. Read `src/lib/content/oak/mapping.ts`, a hand-maintained map from our skill IDs to Oak unit and lesson slugs.
3. For each mapped lesson, write `src/lib/content/oak/<subject>/<lessonSlug>.json` holding: title, video asset reference, transcript, quiz questions converted to our `Question` shape, misconceptions and the attribution line.
4. Validate every output file with Zod; unmapped or malformed questions are written to an import report for the parent's Content review page rather than included.
5. Commit the generated files, so each import is a reviewable diff.

**Use and attribution rules**

- Every Oak item rendered on a page shows Oak's attribution statement as required by the API terms ([source](https://www.thenational.academy/legal/terms-and-conditions-api-version)), for example “A maths lesson by Oak National Academy licensed under Open Government Licence (OGL)”.
- Never imply Oak endorses the site; the attribution is the only use of Oak's name.
- Oak videos appear only after our own Learn cards, and are always followed by our own questions, in line with the Site Plan's “own teaching first” rule.
- Oak quiz questions are tagged `source: 'oak'` and count towards the own-versus-external time mix.
- `OAK_API_KEY` is server-only and used only by the import script.

**Other external resources** are stored per topic as `ExternalResource { url, title, source, kind, skillIds }` and shown as “See it another way” links. A monthly job checks each URL and records results in `resource_check`; broken links are hidden and listed for the parent.

## UI

The interface is built from a small set of shared components styled only through design tokens, so every page looks consistent and a future theme is just a new set of token values.

**Design tokens** (`src/app.css`; components never use raw colours or sizes)

```css
:root {
  --font-body: 'Lexend', system-ui, sans-serif;
  --text-base: 1.125rem;   /* 18px */
  --text-lg: 1.375rem;  --text-xl: 1.75rem;  --text-2xl: 2.25rem;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --radius-sm: 8px; --radius-md: 14px; --radius-lg: 22px;
  --tap-min: 48px;
  --bg: #f7f8fa; --surface: #ffffff; --ink: #1d2433; --ink-soft: #55607a;
  --line: #dfe3ea;
  --maths: #2f6fdb; --english: #7b4fd0; --science: #1f9d6b;
  --good: #1f9d6b; --nudge: #e08a1e;   /* no red for wrong answers */
  --focus: #ffb400;
  --shadow-card: 0 2px 6px rgb(29 36 51 / 0.08);
  --motion-fast: 150ms; --motion-celebrate: 1200ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --motion-fast: 0ms; --motion-celebrate: 0ms; }
}
```

All subject colours must reach 4.5:1 contrast against white for text and against `--bg` for icons; the token values above are starting points to verify in ticket P1-02.

**Shared components** (`src/lib/components/ui`)

| Component | Purpose |
| --- | --- |
| `Button` | Primary, secondary and big “card” variants; minimum height `--tap-min` |
| `Card` | Activity and topic cards with subject colour stripe and status |
| `TopicTabs` | The four tabs, with locked state for Stretch |
| `Breadcrumb` | Subject › Strand › Topic, always on topic pages |
| `SpeakButton` | Reads its text aloud with the child's chosen voice |
| `StarCounter` | Header star balance with gain animation |
| `SteppingStones` | Strand page path of topics with mastery fill |
| `SkillMap` | My Progress view of all skills in a subject |
| `Feedback` | Correct, nudge and misconception messages after an answer |
| `HintButton` | Reveals hints one at a time and records hint count |
| `Celebration` | Level-up and badge overlay, skippable |
| `PinPad` | Picture PIN for children, digit PIN for the parent |
| `ModelFrame` | Wraps interactive models with title, reset and read-aloud |

**Page spec**

| Route | Purpose | Must have |
| --- | --- | --- |
| `/` | Profile picker | Avatars of each child, small “Parent” button; picture PIN if set |
| `/today` | My Day | Today's sessions as big cards in order, first undone highlighted; streak and stars; “Pick something myself” |
| `/[subject]` | Subject hub | Strand cards with progress rings; “Continue” card for the last topic |
| `/[subject]/[strand]` | Strand page | Stepping stones; locked topics show which skill unlocks them |
| `/…/[topic]/learn` | Learn tab | One card at a time, Next/Back, read-aloud on every card, check-in at the end |
| `/…/[topic]/practise` | Practise tab | One question at a time, hints, scaffold fading, misconception feedback, “Show me another way” when stuck |
| `/…/[topic]/check` | Check tab | 10 questions, no hints, result screen with level change and stars |
| `/…/[topic]/stretch` | Stretch tab | Problem tasks; locked until Secure, with “I want to try anyway” |
| `/diagnostic/[subject]` | Warm-up quest | Strand sections, progress bar, break screens, no right/wrong |
| `/progress` | My Progress | Skill map per subject tab, badges earned |
| `/rewards` | Rewards | Star balance, badges, real-world rewards to claim |
| `/parent/dashboard` | Parent dashboard | Both children side by side: week completion, strengths, weaknesses, alerts, own/external mix |
| `/parent/plans` | Plan builder | Draft per child by day; drag, swap, lock, remove, add custom; approve |
| `/parent/children/[id]` | Child report | Skill table with level, score, misconceptions, time, trend |
| `/parent/record` | Record of work | Date range, printable layout of topics, progress and samples |
| `/parent/content` | Content review | Oak import report, external link health |
| `/parent/rewards`, `/parent/settings` | Settings | Real-world rewards, time budgets, plan mix, PINs, children |

**Interaction rules:** one main action per screen; the Home button and breadcrumb are always visible on child pages; every finished activity ends on a screen with one clear next step; feedback appears within 300 ms of answering; wrong answers show “Not quite” with the nudge colour, never a red cross.

## Accessibility, privacy and security

The site targets WCAG 2.2 AA, keeps all children's data on the family's own server, and treats the parent PIN and API keys as the only secrets.

**Accessibility**

- Everything works by keyboard and touch; drag interactions always have a tap alternative.
- Visible focus ring using `--focus`; no focus traps except in modal dialogs.
- Every instruction, Learn card and question can be read aloud with the browser's built-in speech; text is highlighted as it is read where the browser supports it.
- Child-adjustable text size (100%, 115%, 130%) stored in child settings.
- Colour is never the only signal: correct and wrong states also use an icon and words.
- Respect `prefers-reduced-motion`; sounds off by default until the child turns them on.
- Interactive models expose their state as text for screen readers (for example “3 tens, 4 ones: 34”).

**Privacy**

- Data stays in the local SQLite file; no analytics, trackers or third-party scripts.
- Fonts and icons are self-hosted. Oak videos are the only third-party media and load only when the child presses play.
- From Phase 4, only the data listed in the LLM section is sent to the LLM provider.
- The parent can export all data for a child as JSON, and delete a child, which removes every row for that child.

**Security**

- PINs are hashed with argon2id; 5 failed attempts in 10 minutes locks that profile for 10 minutes.
- Session cookies are random, `httpOnly`, `sameSite=lax`, and `secure` when served over HTTPS; only a hash of the token is stored.
- Every `(child)` and `parent` route checks the session in its `+layout.server.ts`, and every `+server.ts` endpoint checks `locals` again. A child can only read and write rows with their own `child_id`.
- Form actions rely on SvelteKit's built-in CSRF origin check; JSON endpoints accept only same-origin requests with `application/json`.
- Secrets (`OAK_API_KEY`, `ANTHROPIC_API_KEY`) live in `.env`, are read through `$env/static/private` and are never committed.
- If the site is ever exposed beyond the home network, it must sit behind HTTPS (for example a reverse proxy with automatic certificates).

## Testing, deployment and operations

The engine and content are tested hardest, because a wrong mark or a broken generator teaches a child something false; pages get a thin layer of end-to-end tests.

**Testing**

| Layer | Tool | Requirement |
| --- | --- | --- |
| Engine (`lib/engine`) | Vitest | 90%+ line coverage; table-driven tests for every rule and threshold in this spec |
| Content validation | Vitest + `scripts/validate-content.ts` | Every topic parses with Zod; IDs unique; prerequisites exist with no cycles; every misconception referenced exists |
| Generator fuzzing | Vitest | Each generator run 500 times per difficulty: repeats under 20% across 50 runs where the answer space allows, answer passes its own `mark`, no NaN or empty prompts, numbers within the declared range |
| Server endpoints | Vitest with an in-memory SQLite | Auth checks, child isolation, attempt recording, mastery update |
| Journeys | Playwright | Sign in → My Day → Learn → Practise → Check → level up; parent PIN → approve plan; diagnostic resume |
| Accessibility | Playwright + axe | No serious or critical violations on every child page |

CI (GitHub Actions or similar) runs type-check, lint, unit tests, content validation and Playwright on every push; `main` must be green to deploy.

**Deployment**

- Build with `adapter-node`; run as a service (systemd or Docker) on a home mini PC or small server, Node 22 LTS or newer.
- The SQLite file and `.env` live outside the app directory (for example `/var/lib/learning/`).
- Migrations run automatically on start via drizzle-kit's migrator; a migration is never edited after release.
- Releases are tagged; rollback means deploying the previous tag and restoring the pre-release backup.

**Operations**

- Nightly backup at 02:00 using SQLite's online backup, kept for 30 days, plus a weekly copy off the machine (cloud drive or USB).
- Scheduled jobs run in-process with a simple scheduler: weekly plan drafts (Saturday 08:00), nightly strengths and weaknesses refresh (02:30), monthly link check.
- A `/parent/settings` “System” panel shows app version, last backup, last Oak import and job status.

## Roadmap

Phases 1–3 contain 45 tickets, listed in the Tickets tab with dependencies, sizes and acceptance criteria; later phases are ticketed once the previous phase passes its gate.

&#91;embedded content: roadmap · 6 phases, 45 tickets in Phases 1–3\]

Sizes are S (up to 1 day), M (2–3 days) and L (4–5 days) for one developer, which puts Phases 1–3 at roughly 105–110 developer days: about 41 for Phase 1, 41 for Phase 2 and 26 for Phase 3. That is about 5 months full-time, or around a year at 2 days a week, plus content-writing time. Within a phase, tickets can run in any order their dependencies allow; the gate is checked with the children, not just by tests.

## Open decisions

None of these block Phase 1 except the first two, which ticket P1-01 resolves.

- [ ] **Existing app details.** SvelteKit/Svelte versions, adapter, styling and test setup (P1-01 audit).
- [ ] **Hosting.** Home network only, or reachable from outside (needs HTTPS and a stronger parent PIN)?
- [ ] **Content authoring.** Who writes Learn cards, misconceptions and Stretch tasks, and in what format? Content is the largest effort in Phase 2. A suggested approach: the developer builds generators and models, while the parent writes or reviews card text in the topic files, optionally drafting it with an LLM offline.
- [ ] **Picture PINs.** On or off for each child.
- [ ] **Defaults.** Time budget (3 × 25 minutes, 5 days) and plan mix (50/20/20/10) per child.
- [ ] **Weekends.** Should weekend activity count towards streaks and plans, or stay free choice?
- [ ] **Real-world rewards.** The first list and star costs, so the economy can be balanced in Phase 3.
- [ ] **Profiles.** Each child's avatar, interests and reading age.
- [ ] **LLM budget and provider** (Phase 4): a monthly cap sets the daily call limit.

## Sources

- [What's new in Svelte: August 2026](https://svelte.dev/blog/whats-new-in-svelte-august-2026) (SvelteKit 3 prerelease)
- [Oak Curriculum API – overview](https://open-api.thenational.academy/docs)
- [Oak Curriculum API – endpoints overview](https://open-api.thenational.academy/docs/api-endpoints/endpoints-overview)
- [Oak Curriculum API – API limits](https://open-api.thenational.academy/docs/about-oaks-api/api-limits)
- [Oak Curriculum API – bulk download](https://open-api.thenational.academy/bulk-download)
- [Oak API terms and conditions](https://www.thenational.academy/legal/terms-and-conditions-api-version)
- [Home Learning Suite – Site Plan](https://claude.ai/code/artifact/449c68b0-d461-4316-a0f5-4a6058240d3c)

# Home Learning Suite – Site Plan

Oct 20, 2026 · @David

## Overview

The suite is a teach-first learning site for two home-educated children (Years 6 and 7) covering Maths, English and Science, where every topic teaches before it tests and a weekly plan adapts to each child's strengths and gaps.

The existing Roman numerals page becomes the first topic built on the new shared template, so it acts as the proof that the template works.

**Goals for the first release**

- Each child can log in, see today's plan and start learning without adult help.
- Every topic follows the same Learn → Practise → Check → Stretch pattern.
- Every answer updates a per-skill mastery record, which drives strengths, weaknesses and the weekly plan.
- Rewards recognise effort and improvement, not just correct answers.
- An LLM is used where judgement or language is needed (writing feedback, re-explaining a concept), never for things code can check exactly.

**Guiding principles**

- **One ladder, not two year groups.** Year 6 and Year 7 content overlaps heavily, so topics sit on a single progression ladder and each child is placed by a short diagnostic rather than by year label.
- **Teach, then check.** No topic opens with a test. Testing confirms learning and feeds the tracker.
- **Mistakes are data.** Wrong answers are tagged with the misconception they reveal, so the site can respond to *why* a child got it wrong.
- **Independence by design.** Big buttons, read-aloud on every page, no dead ends, and at most three taps to any activity.
- **Parent stays in control.** The parent approves plans, sets real-world rewards and can see every LLM exchange.

## What this site adds

The site's value is that it knows each child and acts on it, which no content library can do. Oak, Bitesize and similar sites provide material; this site decides what each child does next, teaches it interactively, responds to their specific mistakes and gives the parent a clear picture.

| A content library provides | This site adds |
| --- | --- |
| Lessons in a fixed sequence | A per-child skill map, a diagnostic starting point and a weekly plan that changes as they learn |
| Videos and slides to watch | Interactive models to manipulate, plus generated practice that never runs out |
| Quizzes marked right or wrong | Feedback aimed at the specific misconception behind a wrong answer, with prerequisite checks |
| One explanation for everyone | “Show me another way” explanations built around the child's interests and reading level |
| Writing tasks without personal feedback | A write, feedback, redraft cycle with targets that feed into the plan |
| Spaced review left to the learner | Automatic review dates so Secure skills become Mastered rather than forgotten |
| No link between subjects or siblings | One view of both children across Maths, English and Science |
| No reason to come back | Rewards for effort and improvement, streaks and family-set real-world goals |
| Nothing for the parent | A dashboard, alerts when a child is stuck, plan approval and a termly record of work |

The termly record of work matters for home education in particular. It gives the parent dated evidence of topics covered, progress and sample writing, ready for any local authority enquiry.

**Rules that keep it from becoming a front door**

- **Own teaching first.** No topic goes live without our own Learn cards, an interactive model or worked example, and generated Practise questions. External material is added afterwards and is never the only teaching on a topic.
- **External content is wrapped, never a dead end.** An Oak video or Bitesize page is always followed by our own questions, so the tracker still learns from it. A bare link out never counts as a completed session.
- **The removal test.** For every topic: if Oak and the other sites disappeared tomorrow, would this topic still teach? If not, it isn't finished.
- **The personal test.** For every feature: does it use what we know about the child? If not, question whether it belongs here or is better left to the source site.
- **Track the mix.** The parent dashboard shows how much of each child's time went on our own activities versus external material. A suggested target is at least 70% on our own activities.

**How we will know it is working** – reviewed each term on the parent dashboard:

- Skills moved up a mastery level, and how long each took to reach Secure.
- Retention: share of Mastered skills still passing their spaced review.
- Weaknesses closed: skills that were weak at the start of term and are now Secure.
- Independence: sessions completed without asking an adult for help.
- Enjoyment: a quick two-tap “how did that feel?” at the end of each session.

## How learning works

Every topic page has the same four tabs, so the children learn one way of working and reuse it everywhere.

1. **Learn** – a short explanation (3–6 “cards”), a worked example shown step by step, and an interactive model the child can play with (place-value blocks, a fraction wall, a circuit builder). Ends with a one-question “did that make sense?” check.
2. **Practise** – guided questions with scaffolding that fades: hints and partially completed steps at first, then plain questions. Wrong answers get an explanation targeted at the specific mistake.
3. **Check** – a short quiz (8–12 questions) with no hints. This is what moves the mastery level.
4. **Stretch** – problem solving, reasoning (“explain why”), real-world application and puzzles. Opens once the topic is Secure, or earlier if the child asks.

**Mastery levels per skill**

| Level | What it means | How it is reached |
| --- | --- | --- |
| Not started | Never attempted | Default |
| Learning | Has seen the Learn tab | Learn tab completed |
| Developing | Getting there with support | Practise accuracy 60%+ |
| Secure | Can do it unaided | Check score 80%+ |
| Mastered | Remembers it over time | Secure, then 80%+ on a review at least 7 days later |

Mastered skills can slip back to Secure if a later review goes badly, which keeps the record honest and triggers spaced review.

**When a child is stuck** (two wrong answers sharing the same misconception, or three wrong in a row), the page offers “Show me another way”: first an alternative pre-written explanation, then an LLM-generated one built from the misconception and the child's interests (see the LLM section).

## Site map

The site has a child area built around a daily home page, and a PIN-protected parent area; any activity is three taps from My Day (subject → strand → topic).

&#91;embedded content: site map · child area and parent area\]

**Child pages**

- **Profile picker** – each child taps their avatar (optional simple picture PIN).
- **My Day** – today's planned sessions as big cards, streak, star count and a “pick something myself” option.
- **Subject hubs** (Maths, English, Science) – the strands for that subject with progress shown on each.
- **Strand page** – the topics in order as stepping stones; locked topics show which skill unlocks them.
- **Topic page** – the four tabs (Learn, Practise, Check, Stretch). The existing Roman numerals page is rebuilt here first.
- **My Progress** – child-friendly skill maps per subject and badges earned.
- **Rewards** – stars, badges and the child's collection or personal space.

**Parent pages**

- **Dashboard** – both children side by side: this week's completion, strengths, weaknesses and alerts (“stuck on long division for 3 sessions”).
- **Plan builder** – review, edit and approve next week's draft plans.
- **Child reports** – skill-level detail, misconceptions, time spent and termly trends.
- **Content review** – approve LLM-drafted reading passages or questions before children see them.
- **LLM history** – every LLM exchange, searchable, with flags.
- **Reward settings** – real-world rewards, star values, sibling goal on or off, time budgets.

## Maths

Maths is organised into seven strands that follow the National Curriculum for Year 6 (end of KS2) and Year 7 (start of KS3); each strand runs as one ladder so either child can move up or down it.

| Strand | Year 6 topics (KS2) | Year 7 topics (KS3) | Interactive models |
| --- | --- | --- | --- |
| Number & place value | Numbers to 10 million, rounding, negative numbers in context, **Roman numerals** (existing page) | Ordering integers and decimals, negative number arithmetic, powers of 10, standard form intro | Place-value chart, number line zoom |
| Calculation | Long multiplication, long division, order of operations, mental strategies, estimation | Factors, multiples, primes, HCF and LCM, squares, cubes and roots, BIDMAS with indices | Area model for multiplication, division “bus stop” animator |
| Fractions, decimals & percentages | Equivalence, adding and subtracting with different denominators, multiplying and dividing fractions, FDP conversion | Fractions of amounts, percentage change, decimal calculation | Fraction wall, percentage bar |
| Ratio & proportion | Scaling, simple ratio, unequal sharing | Ratio notation and simplifying, dividing in a ratio, direct proportion | Ratio bar model, recipe scaler |
| Algebra | Simple formulae, linear number sequences, missing numbers, two unknowns | Expressions and simplifying, substitution, solving linear equations, nth term | Balance-scale equation solver |
| Measurement & geometry | Unit conversion, area of triangles and parallelograms, volume, angles, circle parts, nets, coordinates in four quadrants, translations and reflections | Perimeter and area of compound shapes, angle facts, constructions, properties of 2D and 3D shapes | Protractor tool, shape builder, coordinate grid |
| Statistics & probability | Pie charts, line graphs, mean | Mean, median, mode and range, bar and frequency charts, basic probability scale | Chart builder, spinner and dice simulator |

Maths is almost entirely code-driven: questions are generated from templates with random values, so practice never runs out and every answer can be marked exactly. Distractors in multiple-choice questions are chosen to match known misconceptions (for example, adding denominators when adding fractions).

## English

English splits into five strands; spelling and grammar are code-marked, while reading responses and writing need the LLM for feedback.

| Strand | Year 6 topics (KS2) | Year 7 topics (KS3) | Marked by |
| --- | --- | --- | --- |
| Spelling & vocabulary | Year 5/6 statutory word list, suffixes (-cious/-tious, -cial/-tial, -ant/-ent, -able/-ible), homophones, silent letters, prefixes | Root words and etymology (Latin and Greek), subject-specific vocabulary, synonyms and nuance | Code |
| Grammar & punctuation | Word classes, clauses, active and passive voice, subjunctive, formal vs informal, semicolons, colons, dashes, hyphens, bullet points | Sentence variety for effect, complex punctuation, Standard English, paragraph cohesion | Code (multiple choice, drag-and-drop, sentence fix-it) |
| Reading & comprehension | Retrieval, inference, vocabulary in context, summarising, predicting, author's choice of language | Analysing language and structure, comparing texts, introduction to Shakespeare, poetry analysis, non-fiction viewpoints | Code for retrieval questions; LLM for open answers |
| Writing | Narrative (setting, character, dialogue), recount, instructions, explanation, persuasion, balanced argument, letter | Writing for audience and purpose, descriptive writing, speeches, articles, drafting and redrafting | LLM against a rubric |
| Speaking & listening | Reading aloud with expression, presenting a short talk | Debate, formal presentation | Parent-assessed with a checklist |

**How English teaches**

- Grammar and spelling use the same Learn cards and interactive models as Maths (sentence builders, sorting words by suffix, “spot the passive”).
- Reading uses short passages graded by difficulty. The core library is hand-picked or LLM-drafted and parent-reviewed, so every passage is checked before a child sees it.
- Writing follows a cycle: model text → plan with a scaffold → write → LLM feedback (two strengths, one target) → redraft. The target feeds straight back into the tracker as a skill, such as “uses varied sentence openers”.

## Science

Science is grouped into Biology, Chemistry, Physics and Working Scientifically, with simulations doing the teaching wherever a real experiment isn't practical at home.

| Strand | Year 6 topics (KS2) | Year 7 topics (KS3) | Simulations and activities |
| --- | --- | --- | --- |
| Biology | Classifying living things (keys, Linnaeus), circulatory system, diet, exercise and drugs, evolution and inheritance, fossils and adaptation | Cells and microscopy, organ systems, reproduction, ecosystems and food webs | Classification key builder, heart and blood flow animation, virtual microscope, food web builder |
| Chemistry | Properties and changes of materials (Year 5 recap), reversible and irreversible changes | Particle model and states of matter, mixtures and separation, acids and alkalis, simple chemical reactions | Particle box (heat it, watch it change), separation lab, pH indicator scale |
| Physics | Light travels in straight lines, reflection and shadows, electrical circuits and symbols, voltage and brightness | Forces and balanced/unbalanced forces, speed, energy stores and transfers, sound, space (seasons, day and night) | Ray-box simulator, circuit builder, forces tug-of-war, solar system model |
| Working Scientifically | Fair tests, variables, recording results, line graphs, conclusions | Hypotheses, controlling variables, accuracy and repeat readings, evaluating method | Virtual investigation runner, results table and graph tool |

**How Science teaches**

- Each topic is anchored on one “big question” (for example, “Why do we see shadows?”), with a simulation in the Learn tab.
- Each topic suggests one optional kitchen-table experiment with a printable sheet, recorded back on the site.
- Science facts come from authored content, not the LLM, to avoid confident wrong answers. The LLM is used only to re-explain authored content and to mark short “explain why” answers against a model answer.

## Curriculum alignment and external resources

The topic maps follow the National Curriculum for England (Year 6 = end of KS2, Year 7 = start of KS3), and Oak National Academy can supply both the official-style sequencing and ready-made lessons to sit alongside our own teaching.

**How closely it follows the curriculum**

- The Year 6 lists match the KS2 Year 6 programmes of study, including the content covered by the Year 6 tests.
- KS3 is one key stage covering Years 7–9, so the Year 7 lists are the usual first-year slice of it; the ladder model lets either child move into Year 8 content when ready.
- The National Curriculum applies to England; Wales, Scotland and Northern Ireland have their own. Home-educated children don't have to follow it, but it is a sensible benchmark and keeps a return to school or GCSEs straightforward.
- A revised National Curriculum is due to be published in spring 2027 for first teaching from September 2028 ([source](https://thirdspacelearning.com/blog/curriculum-assessment-review-report-response-prepare-your-school/)). The current programmes apply until then; by 2028 the children will be in Years 8 and 9, so the skill map gets one review when the new programmes appear. Because content is tagged to skills, that is a data change, not a rebuild.

**Oak National Academy**

Oak's curriculum plans are aligned to the National Curriculum for England and sequenced across year groups ([source](https://github.com/oaknational)). Its free Curriculum API, under the Open Government Licence, offers curriculum data and lesson resources for every subject across KS1–4 ([source](https://open-api.thenational.academy/docs/about-oaks-data/content-coverage)). The data includes unit sequences, prior knowledge requirements, National Curriculum links and lesson titles; resources include slides, videos, transcripts, worksheets and starter and exit quizzes. A bulk JSON download per subject also carries quiz answers, transcripts and misconceptions ([source](https://open-api.thenational.academy/bulk-download)).

| Oak data | Where it goes in our site | Phase |
| --- | --- | --- |
| Unit sequences, prior knowledge, curriculum links | Seed the skill ladder and prerequisite graph; each skill records its matching Oak unit and lessons | 2 |
| Starter and exit quizzes | Extra Practise and Check questions, tagged to skills and marked by code | 2 |
| Misconceptions and suggested responses | Seed our misconception tags and pre-written “another way” explanations | 2 |
| Lesson videos and slides | An optional “Watch the Oak lesson” card after our own Learn cards, followed by our own check questions | 2 (Maths), 4 (Science), 5 (English) |
| Video transcripts | Ground the LLM: re-explanations draw on the transcript rather than the model's memory, which matters most in Science | 4 |
| Worksheets (PDF) | Printable offline practice from the topic page | Any |

**Practicalities**

- Request a free API key; Oak asks for access to usage data in return ([source](https://open-api.thenational.academy/docs)).
- Every Oak item shows Oak's required attribution line under the Open Government Licence ([source](https://www.thenational.academy/legal/terms-and-conditions-api-version)).
- Import rather than call live: a script pulls the bulk JSON into the content library each term and videos stream from Oak. Oak simply becomes a second source for the content library, so the architecture does not change.
- Our own Learn cards, interactive models and misconception-targeted practice stay the core. Oak adds breadth, a second explanation and a large question bank.

**Other resources (linked, not imported)**

| Resource | Use | Where it appears |
| --- | --- | --- |
| [BBC Bitesize](https://www.bbc.co.uk/bitesize) (KS2, KS3) | Short explainer videos and guides | “See it another way” link in the Learn tab |
| [NRICH](https://nrich.maths.org) (University of Cambridge) | Rich maths problem-solving tasks | Stretch tab, linked to specific tasks |
| [Project Gutenberg](https://www.gutenberg.org) | Public-domain classics, including Shakespeare | Imported as reading passages (out of copyright) |
| [NCETM](https://www.ncetm.org.uk) | Guidance on teaching maths for mastery | Parent area |

Each external link is stored as a resource record (skill, URL, source, type, date checked), and a monthly link check flags any that have broken.

## Progress tracking

Progress is tracked per skill, not per test: every question is tagged to one skill (and optionally a misconception), and every answer updates that skill's record.

**Skill record (one per child per skill)**

- Mastery level (Not started → Mastered)
- Mastery score 0–100, a weighted average with recent answers counting more
- Attempts, accuracy and average time per question
- Hints used (so a correct answer after three hints counts for less than an unaided one)
- Last practised date and next review date (spaced repetition: 1, 3, 7, 14, 30 days)
- Active misconceptions, with a count of how often each appears

**Prerequisites.** Skills are linked in a graph (for example, equivalent fractions → adding fractions). If a child struggles with a skill, the tracker checks its prerequisites first, because the real gap is often one step back.

**Strengths and weaknesses are calculated, not guessed.**

- **Weakness:** mastery score under 50 after at least two sessions, a recurring misconception, or a Mastered skill that slipped on review.
- **Strength:** Secure or Mastered with accuracy above 85% and quick answers, or a strand where the child is ahead of their year-group expectation.

**What the child sees** is a skill map per subject: a path of stepping stones that fill in as skills progress, with no red marks or percentages. **What the parent sees** is the detail: scores, misconceptions, time spent, trends and the list of current strengths and weaknesses.

**Starting point.** A 15–20 minute adaptive diagnostic per subject places each child on the ladder at the start, and can be rerun every term.

## Weekly plan generator

Each weekend the site drafts a plan per child from their skill records, the parent reviews and approves it, and it becomes the child's “My Day” list for each day.

**Default mix of sessions** (adjustable per child in parent settings)

| Share of time | Purpose | Chosen from |
| --- | --- | --- |
| 50% | Build on weaknesses | Weak skills, checking prerequisites first |
| 20% | Spaced review | Skills whose next review date has arrived |
| 20% | Stretch strengths | Stretch tabs on strong skills, or the next skill up the ladder |
| 10% | New learning | Next unlocked skill in a balanced rotation across subjects |

**How a plan is built**

1. Read the time budget (for example, 3 × 25-minute sessions a day, 5 days).
2. Score every unlocked skill for priority: weakness severity, days overdue for review, and time since the subject was last touched.
3. Fill each category's share with the highest-priority skills, choosing the right tab (Learn for new, Practise for weak, Check for review, Stretch for strong).
4. Balance the week: at least one session of each subject per day, no more than two sessions on the same skill per day, and hard tasks placed before easy ones in a day.
5. Show the draft to the parent, who can drag, swap, lock or remove sessions, and add their own (for example, a museum trip logged as Science).
6. Mid-week, if a child masters a skill early or gets stuck, the remaining days rebalance automatically and the parent is notified.

Optionally, the LLM writes a short friendly note at the top of each week (“This week you'll crack long division and try your first persuasive letter!”) and a plain-English summary for the parent.

## Rewards

Rewards are earned for effort, persistence and improvement as well as correct answers, so a child working on a weak area earns as much as one cruising through a strength.

| Reward | Earned by | Purpose |
| --- | --- | --- |
| Stars | Completing sessions, correct answers, finishing a Learn tab, redrafting writing | Everyday currency |
| Bonus stars | Improving a weak skill by a level, beating a previous Check score, trying a Stretch task | Rewards growth over raw ability |
| Badges | Milestones: first Mastered skill, 10 skills in a strand, a full week's plan done, “Bounce Back” (Secure after being stuck) | Long-term goals |
| Streak | Days with the day's plan completed; one free “rest day” per week so a missed day doesn't reset it | Habit without pressure |
| Collection | Stars spent on items for a personal space (a garden, a creature, a space station) | Something to build and show off |
| Real-world rewards | Parent-set targets, e.g. 200 stars = film night | Links effort to family life |

**Rules that keep it healthy**

- No leaderboard between siblings by default; each child competes with their past self. The parent can enable a shared family goal instead.
- Stars are never taken away.
- Rewards are capped per skill per day, so repeating an easy quiz cannot farm stars.
- Celebrations are short and skippable so they never slow learning down.

## Using an LLM

The LLM handles judgement and language tasks; anything with one right answer stays in code, which is cheaper, faster and never wrong about 7 × 8.

| Use | When it is called | What it receives | Priority |
| --- | --- | --- | --- |
| “Show me another way” | Child is stuck on a skill | The authored explanation, the question, the child's wrong answers, the detected misconception, the child's interests and reading age | High |
| Writing feedback | Child submits a piece of writing | The task, a rubric for the genre and level, the text | High |
| Open-answer marking | Comprehension or “explain why” answers | The question, a model answer, marking points | High |
| Struggle diagnosis for parents | Weekly, or on demand from the parent dashboard | A skill's attempt history and misconceptions | Medium |
| Passage and question drafting | Parent requests new reading material | Topic, reading level, length | Medium (parent reviews before use) |
| Weekly notes | Plan approval | The approved plan and last week's progress | Low |

**Safeguards**

- **No open chat.** Every LLM feature is a fixed prompt template with the child's input slotted in. The child cannot type free questions to the model.
- **API key stays on the server.** The browser calls your own backend, which calls the API, so the key is never exposed.
- **Every exchange is logged** and visible to the parent, with a “flag this” button.
- **System prompts** fix the tone (warm, encouraging, age 10–12), forbid giving the final answer outright in practice mode, and keep responses under about 150 words.
- **Child-friendly output check:** responses are run through the provider's moderation, or a simple keyword filter, before display.
- **Cost control:** a daily call limit per child, and caching of explanations so the same misconception gets a stored response next time.
- **Privacy:** only first names (or nicknames) and learning data are sent, never surnames, location or photos.

## Look and feel

The first design is clean, calm and friendly, built so that a 10–12-year-old can find, start and finish an activity alone.

- **Colour per subject** used consistently on cards, headers and buttons (for example, Maths blue, English purple, Science green), on a light neutral background.
- **Readable type:** a rounded, highly legible font such as Lexend or Atkinson Hyperlegible, body text at 18px or larger, short lines.
- **Big targets:** buttons at least 48px tall, generous spacing, works on a tablet as well as a laptop.
- **Always know where you are:** breadcrumb (Maths › Fractions › Adding fractions), a persistent Home button, and the four topic tabs always in the same place.
- **Read aloud:** a speaker button on every instruction and Learn card, using the browser's built-in speech so no extra service is needed.
- **Kind feedback:** “Not quite – let's look again” rather than red crosses; correct answers get a quick tick and sound (with a mute toggle).
- **No dead ends:** every screen offers a clear next step (“Next question”, “Back to My Day”).
- **Themes later, ready now:** all colours, fonts and corner styles live in CSS variables (design tokens) from day one, so skins and a dark mode can be added later without touching the pages.

## Technical architecture

A browser app, a small backend and a single-file database are enough for two learners; the backend exists mainly to save progress and keep the LLM key private.

&#91;embedded content: architecture · browser, backend, database, LLM\]

**Suggested stack** (to be matched to whatever the Roman numerals page already uses)

- **Front end:** plain HTML, CSS and JavaScript, or React if you prefer components. Topics are data files read by one shared topic template, so adding a topic means writing content, not new code.
- **Backend:** Node.js (Express) or Python (FastAPI), a few dozen endpoints.
- **Database:** SQLite to start. It is one file, needs no server and copes easily with two children. Supabase is an alternative if you want hosted login and access from anywhere.
- **Hosting:** a home machine on the local network is simplest and most private; a small hosted service (such as Render or Railway) if the site is needed away from home.

**Core data model**

| Entity | Key fields | Notes |
| --- | --- | --- |
| Child | name, avatar, interests, reading age, time budget | Interests personalise LLM explanations |
| Skill | subject, strand, title, ladder stage, prerequisites | The prerequisite graph lives here |
| Content item | skill, type (Learn card, question template, passage, simulation, video, external link), difficulty, source (own, Oak, other), attribution | Stored as JSON files |
| Misconception | skill, description, matching wrong-answer patterns | Linked from question distractors |
| Attempt | child, item, answer, correct, time taken, hints used, misconception, timestamp | Raw history, never deleted |
| Mastery record | child, skill, level, score, next review date, active misconceptions | Recalculated after each attempt |
| Plan / plan item | child, week, day, skill, tab, status, locked by parent | Created by the plan generator |
| Reward event | child, type, amount, reason, timestamp | Star balance is the sum |
| LLM exchange | child, feature, prompt, response, flagged | Shown in LLM history |

## Roadmap

Build in six phases, starting with the shared foundations and the Roman numerals rebuild, so every later topic reuses proven parts; each phase ends with a check the children themselves can pass.

&#91;embedded content: roadmap · 6 phases, 5 gates\]

Maths and Science come before English because they are code-driven and reuse the same machinery, while English depends on the LLM features being in place and trusted.

**Open questions**

- What stack and hosting does the Roman numerals page use today? This decides the front end and backend choices.
- Should the site work away from home (hosted), or only on the home network?
- Which LLM provider and monthly budget? This sets the daily call limits.
- What are each child's interests, so explanations and the rewards collection theme can be personalised?
- Is a sibling shared goal wanted, or should progress stay fully separate?
- How long should a typical session be (default 25 minutes) and how many per day?

## Sources

- [Oak Curriculum API – content coverage](https://open-api.thenational.academy/docs/about-oaks-data/content-coverage)
- [Oak Curriculum API – overview](https://open-api.thenational.academy/docs)
- [Oak Curriculum API – bulk download](https://open-api.thenational.academy/bulk-download)
- [Oak API terms and conditions](https://www.thenational.academy/legal/terms-and-conditions-api-version)
- [Oak National Academy on GitHub](https://github.com/oaknational)
- [Curriculum and Assessment Review: report and response (Third Space Learning)](https://thirdspacelearning.com/blog/curriculum-assessment-review-report-response-prepare-your-school/)

# Home Learning Suite

A teach-first learning site for two home-educated children (Years 6 and 7). See [docs/site-plan.md](docs/site-plan.md) for the plan, [docs/spec.md](docs/spec.md) for the technical spec and [docs/phase-1.md](docs/phase-1.md) for progress on the first phase.

## Running it

```sh
pnpm install
pnpm dev                 # http://localhost:5173 – the first visit opens first-run setup
pnpm test:unit -- --run --project server   # engine, content, generators and server tests
pnpm validate:content    # checks every topic file
pnpm test:e2e            # Playwright journeys (uses a fresh data/e2e.db)
pnpm build && pnpm start # production build with adapter-node
```

The database is a single SQLite file at `DATABASE_PATH` (default `data/learning.db`); migrations run on start. After changing `src/lib/server/db/schema.ts`, run `pnpm db:generate` and commit the new migration.

The original Roman Quest page is still available at `/legacy/roman-numerals`.

---

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@1.1.1 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright="demo:no" sveltekit-adapter="adapter:auto" storybook ai-tools="ide:other" experimental="features:async,remoteFunctions" --install pnpm ./
```

## Adding features

Add features to your project with `sv add`:

```sh
npx sv add
```

For example, to add Tailwind CSS:

```sh
npx sv add tailwindcss
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

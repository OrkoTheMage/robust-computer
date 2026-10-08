<div align="center">
  <img src="landing/public/banner2-cut.svg" width="560" alt="Robust Computer">
</div>

**Version 0.12.5**

Full-stack web app for Robust Computer's Marketing Site & API

## Tech stack

| Project | Stack | Dev Port | Purpose |
|---------|-------|----------|---------|
| `landing/` | React + Vite | 3000 | Marketing site |
| `server/` | Express + MongoDB | 5000 | API |

Package manager: **Yarn**

## Installation

```bash
yarn install
yarn install:all
yarn dev
```

Before `yarn dev` will boot the server, create your local env files at the
repo root. Copy the committed [`.env.example`](.env.example) and fill in real values:

```bash
cp .env.example .env.dev
cp .env.example .env.prod
```

The server selects between these via `NODE_ENV` (set by the
`scripts/dev.js` wrapper). The Vite app points `envDir` at the
repo root and reads whichever file the wrapper chose.

The file is shared by the server and `landing/`.

- **`.env.dev`** — local development values.
- **`.env.prod`** — reference / production-side script use. Real values live
  on Railway and Vercel

> NOTE: See [Environment Variables](#environment-variables) below for the full contract per project.

### Switching env at boot

```bash
yarn dev          # default — loads .env.dev (dev DB)
yarn dev:prod     # loads .env.prod (prod DB, prod URLs)
```

### Field Notes publishing

Three scripts regenerate the public feeds (`landing/public/rss.xml`,
`feed.txt`, `latest.xml`, `latest.txt`) from `landing/src/data/issues/`.

```bash
yarn feeds:build               # write all four files; load .env.dev
yarn feeds:broadcast           # write all four files + fire the prod broadcast
yarn feeds:latest              # write only the latest.{xml,txt} pair
yarn feeds:build --dry-run     # print the four files; no writes, no broadcast
```

`feeds:build` is the local pre-flight: it loads `.env.dev` (no
broadcast) so you can eyeball the output before committing. Flags
(`--xml-only`, `--txt-only`, `--full-only`, `--latest-only`,
`--dry-run`) all compose.

`feeds:broadcast` is the production publish step. It sets
`NODE_ENV=production` so the script reads `.env.prod`, picks up the
real `API_URL` + `NEWSLETTER_ADMIN_SECRET`, and POSTs to
`https://api.robust.computer/api/newsletter/broadcast`. The server
returns 202 immediately; the broadcast loop runs server-side and
dedupes per-subscriber via `Subscriber.issueSlugs`. A re-run is a
no-op once every active subscriber has been marked. Run after
pushing to `main` so Vercel has already deployed the post the
email CTA links to.

## Project Structure

```
robust-computer/
├── landing/                # Marketing site (React + Vite, port 3000)
│   ├── public/                  # Static assets (SVGs, fonts, favicons, rss.xml, feed.txt, robots.txt, ...)
│   ├── src/
│   │   ├── api.js               # fetch wrapper (api + ApiError)
│   │   ├── components/
│   │   │   ├── brand/           # Logo, Zer0Text
│   │   │   ├── modals/          # Modal
│   │   │   ├── sections/        # Page-level shells
│   │   │   └── ui/              # Generic primitives
│   │   ├── data/                # copy.js, jokes.js, fieldNotes.js, brand.js
│   │   ├── hooks/               # State + effects
│   │   ├── pages/               # Home, About, Contact, Field Notes, Bug report, Unsubscribe, Privacy, Terms, NotFound
│   │   ├── styles/              # index.css, colors.js, animations.js, highlight.css
│   │   └── utils/               # Pure helpers
│   └── vite.config.js
│
│
├── server/                 # API server (Express + MongoDB, port 5000)
│   └── src/
│       ├── middleware/          # rateLimit.js
│       ├── models/              # Enquiry, Subscriber, BugReport
│       ├── routes/              # contact, newsletter, bug-report
│       └── utils/
│           ├── email/           # layout, email templates
│
│
├── scripts/                # Repo-root tooling
│
├── package.json            # root scripts: dev, dev:prod, mail, install:all
```

### Style Component Conventions
**Folders that produce visual UI. Each layer wraps the next.**

| Folder | Purpose |
|---|---|
| `pages/`    | Route-level components. Page-specific styled components live at the top, then a default export with hook calls → clean JSX return |
| `sections/` | Page-level shells composed of `ui/` primitives (landing: `Hero`, `Navbar`, `Footer`, `FieldNotes`) |
| `ui/`       | Reusable primitives. Must be generic — no project-specific knowledge |


Page-level components rule: Each file in `pages/` or `sections/` should contain _only_
- Imports
- page-specific `styled-components` (the ones that can't be promoted to `ui/`)
- a default export with **hook calls → clean JSX return**

If you find yourself writing a non-styled component, useEffect logic, a
helper function, or a state mutation inside a page, move it to
`hooks/`, `utils/`, or `context/` first.

### Logical Component Conventions
**Folders that produce behavior. Nothing in here renders JSX on its own.**

| Folder      | Purpose |
|-------------|---------|
| `hooks/`    | Page-level behavior (state + effects). Each page consumes a small number of focused hooks |
| `data/`     | `copy.js` and other data sets |
| `utils/`    | Pure helpers (formatters, validators, permission calculators) |
| Others      | `modals/` (reusable dialogs), `styles/` (design tokens), `middleware/`, etc. |

## Versioning

| Branch | Purpose |
|--------|---------|
| `feature:[feature-name]` | Feature development |
| `dev` | Integration, testing |
| `main` | Production releases |

### Release Flow
1. Create feature branch → merge to `dev`
2. Update version controllers (`package.json` + `README.md`)
2. Squash-merge `dev` into `main` with version tag
3. Fast-forward `dev` to `main`
4. Delete feature branch

> FORMAT: `MAJOR.MINOR.PATCH` (e.g., `v1.1.1`)

## Deployment

| App | URL | Host |
|-----|-----|------|
| Landing | robust-computer.vercel.app | Vercel |
| API     | TBD | Railway |

Landing is a Vercel projects rooted at `landing/`. The API is a Railway service rooted at `server/`.

> NOTE: Auto-deploys on push to `main`.

### Environment Variables

Every variables listed below is required by the code. `NODE_ENV` and `PORT` default to `'development'`/`5000` for bare-`node` startup but are set by Railway / `scripts/dev.js` in practice. The full contract lives in [`.env.example`](.env.example).


| Project | Environment Variables |
|---|---|
| **Vercel — Landing** | `VITE_API_URL`, `VITE_LANDING_URL` |
| **Railway (Server)** | `NODE_ENV`, `MONGODB_URI`, `RESEND_API_KEY`, `LANDING_URL`, `API_URL`, `PORT`, `NEWSLETTER_ADMIN_SECRET` |

> NOTE: Each project owns their own `config.js` which is their own processor for envs.
<div align="center">
  <img src="landing/public/brand/banner2-cut.svg" width="560" alt="Robust Computer">
</div>

**Version 0.12.7**

Full-stack web app for Robust Computer's Marketing Site & API

## Tech stack

| Project | Stack | Dev Port | Purpose |
|---------|-------|----------|---------|
| `landing/` | React + Vite | 3000 | Marketing site |
| `server/` | Express + MongoDB | 5000 | API |

Package manager: **Yarn**

<div align="left">
  <img src="landing/public/icons/icon-var-installer.svg" width="200" alt="">
</div>

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
`scripts/dev.js` wrapper - see [Scripts](#Scripts)). The Vite app points `envDir` at the
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

<div align="left">
  <img src="landing/public/icons/icon-var-tree.svg" width="200" alt="">
</div>

## Project Structure

```
robust-computer/
├── landing/                # Marketing site (React + Vite, port 3000)
│   ├── public/                  # Static assets (images, fonts, feed files, robots.txt)
│   ├── src/
│   │   ├── api.js               # fetch wrapper (api + ApiError)
│   │   ├── components/
│   │   │   ├── brand/           # Logo, Zer0Text
│   │   │   ├── modals/          # Modal
│   │   │   ├── sections/        # Page-level shells (Hero, Navbar, Footer, FieldNotes, ...)
│   │   │   ├── seo/             # SEO
│   │   │   └── ui/              # Generic primitives
│   │   ├── context/             # LocaleContext
│   │   ├── data/                # brand, fieldNotes, jokes, issues/
│   │   ├── hooks/               # State + effects
│   │   ├── i18n/                # en, es, fr
│   │   ├── pages/               # Home, About, Contact, ...
│   │   ├── styles/              # index.css, colors.js, animations.js, ...
│   │   └── utils/               # Pure helpers
│   └── vite.config.js
│
│
├── scripts/                # Repo-root tooling (build-rss, dev, mailpit)
│
│
├── server/                 # API server (Express + MongoDB, port 5000)
│   └── src/
│       ├── middleware/          # rateLimit.js
│       ├── models/              # Enquiry, Subscriber, BugReport
│       ├── routes/              # contact, newsletter, bug-report
│       └── utils/
│           ├── email.js         # Mailer dispatcher
│           ├── newsletterBroadcast.js
│           └── email/           # layout, per-type templates, fonts
│
│
├── package.json            # root scripts, version controller
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

<div align="left">
  <img src="landing/public/icons/icon-var-script.svg" width="200" alt="">
</div>

## Scripts

### dev ([`dev.js`](/scripts/dev.js))

`yarn dev` boots `landing/` + `server/` together, defaulting to `.env.dev`. `yarn dev:prod` is shorthand for `--env=prod` and points the server at prod.

```bash
yarn dev          # .env.dev — dev DB, dev URLs
yarn dev:prod     # .env.prod — prod DB, prod URLs
```

### mail ([`mailpit.js`](/scripts/mailpit.js))

`yarn mail` boots Mailpit, a local SMTP catcher (UI on `:8025`, SMTP on `:1025`), so server emails land in an in-browser inbox during dev. The server's `config.js` auto-points at `localhost:1025` when `NODE_ENV=development`, no wiring required.

```bash
yarn mail         # foreground; Ctrl+C to stop
```

### feeds ([`build-rss.mjs`](/scripts/build-rss.mjs))

Three scripts split the two concerns — write the public feed files,
or fire the broadcast — across the local pre-commit and the
post-deploy steps.

```bash
yarn feeds:build          # write all four files (pre-commit; no broadcast)
yarn feeds:broadcast-dev  # fire the broadcast against dev subscribers
yarn feeds:broadcast      # fire the broadcast against prod subscribers
```

The underlying script (`scripts/build-rss.mjs`) also accepts the
format / variant / dry-run flags directly: `--xml-only`,
`--txt-only`, `--full-only`, `--latest-only`, `--dry-run`, plus the
two split-concern flags `--no-write` and `--no-broadcast`. All flags
compose.

<div align="left">
  <img src="landing/public/icons/icon-var-versioning.svg" width="200" alt="">
</div>

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

<div align="left">
  <img src="landing/public/icons/icon-var-deploy.svg" width="200" alt="">
</div>

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
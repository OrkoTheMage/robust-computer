<div align="center">
  <img src="landing/public/banner2-cut.svg" width="560" alt="Robust Computer">
</div>

**Version 0.10.1**

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
`scripts/dev.js` wrapper). Both Vite apps point `envDir` at the
repo root and read whichever file the wrapper chose.

The file is shared by all three projects (server selects `.env.dev` or
`.env.prod` based on `NODE_ENV`; both Vite apps point `envDir` at the
repo root).

- **`.env.dev`** — local development values.
- **`.env.prod`** — reference / production-side script use. Real values live
  on Railway and Vercel

> NOTE: See [Environment Variables](#environment-variables) below for the full contract per project.

### Switching env at boot

```bash
yarn dev          # default — loads .env.dev for all three (dev DB)
yarn dev:prod     # loads .env.prod for all three (prod DB, prod URLs)
```

## Project Structure

```
robust-computer/
├── landing/                # Marketing site (React + Vite, port 3000)
│   ├── public/                  # Static assets (SVGs, fonts, favicons, rss.xml, feed.txt, robots.txt, ...)
│   ├── src/
│   │   ├── api/                 # fetch wrapper (index.js exports api + ApiError)
│   │   ├── components/
│   │   │   ├── sections/        # Page-level shells
│   │   │   └── ui/              # Reusable primitives
│   │   ├── data/                # copy.js, jokes.js
│   │   ├── hooks/               # useEffects + State
│   │   ├── pages/               # Routes: Home, About, Contact, Privacy, Terms, NotFound
│   │   ├── styles/              # index.css, animations.js; colors.js, typography, ...
│   │   └── utils/               # Helpers & Reusable logic
│   └── vite.config.js
│
│
├── server/                 # API server (Express + MongoDB, port 5000)
│   └── src/
│       ├── middleware/          # rateLimit.js
│       ├── models/              # Enquiry, Subscriber
│       ├── routes/              # contact, newsletter
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
| **Railway (Server)** | `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY`, `LANDING_URL`, `API_URL` |

> NOTE: Each project owns their own `config.js` which is their own processor for envs.
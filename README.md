# Robust Computer — v0.5.0

Public marketing site for **Robust Computer**, a small developer studio.
Built per the `PROJECT-CONVENTIONS.md` blueprint: one marketing frontend
plus an Express + MongoDB API, both in a single monorepo, no workspaces.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18, Vite 5, `@emotion/styled` |
| Routing | `react-router-dom` |
| Icons | `lucide-react` |
| HTTP | Native `fetch` wrapped in `src/api.js` |
| Backend | Node 20+, Express 4, Mongoose 8 |
| Auth (future) | `jsonwebtoken` + `bcryptjs` |
| Email | `nodemailer` (Mailpit in dev, real SMTP in prod) |
| Package manager | Yarn 1 (classic) |

## Repository layout

```
.
├── landing/                  # React + Vite marketing site
├── server/                   # Express + MongoDB API
├── scripts/
│   └── dev.js                # single-script dev orchestrator
├── .env.example              # canonical env-var contract
├── .env.dev                  # git-ignored, dev values
├── .env.prod                 # git-ignored, prod-shaped values
├── package.json              # root — version controller + dev wrapper
└── README.md
```

### landing/

```
landing/
├── public/                   # static SVG assets + robots.txt
│   ├── icon.svg
│   ├── badge.svg
│   ├── poster.svg            # hero mascot
│   └── …
├── src/
│   ├── main.jsx              # ReactDOM root + BrowserRouter
│   ├── App.jsx               # <Routes> + 404
│   ├── index.css             # reset + theme tokens
│   ├── config.js             # frozen env reader, throws on missing
│   ├── api.js                # JSON fetch wrapper + ApiError
│   ├── components/
│   │   ├── sections/         # Hero, Navbar, Services, …
│   │   └── ui/               # Container, Button, Chip, Field
│   ├── pages/                # Home, About, Contact, NotFound
│   ├── hooks/                # useContactForm, useNewsletterForm
│   ├── data/                 # work.js, copy.js
│   └── styles/               # colors.js, typography.js
├── vercel.json               # SPA rewrites → /index.html
└── vite.config.js
```

### server/

```
server/
└── src/
    ├── index.js              # bootstrap, middleware, /api routers
    ├── config.js             # frozen env reader, loads .env.<NODE_ENV>
    ├── models/               # Enquiry, Subscriber
    ├── routes/               # contact.js, newsletter.js
    ├── middleware/           # rateLimit.js
    └── utils/                # email.js (nodemailer transport)
```

## Local development

### Prereqs

- Node 20+
- Yarn 1 (`npm i -g yarn`)
- MongoDB 6+ running locally (`mongod` on default port)
- Mailpit (optional, for capturing dev email) — `mailpit` on `:1025`

### Install everything

```bash
yarn install:all
```

That runs `yarn install` in the root, `landing/`, and `server/`.

### Boot everything

```bash
yarn dev
```

That runs `scripts/dev.js` which:

1. Parses `--env=dev|prod` (default `dev`).
2. Loads `.env.<env>` from the repo root.
3. Pre-flights ports `3000` (landing) and the server `PORT` (default `5000`).
4. Spawns `landing` (Vite) and `server` (Express) under `concurrently`.

Visit:

- Landing: <http://localhost:3000>
- Server health: <http://localhost:5000/api/health>
- Mailpit UI (if running): <http://localhost:8025>

### Run a single sub-project

```bash
yarn dev:landing
yarn dev:server
```

## Environment variables

Every var lives in `.env.example`. Deployers copy that file and fill
in real values.

| Var | Read by | Required | Notes |
|---|---|---|---|
| `NODE_ENV` | server | yes | `development` or `production` |
| `PORT` | server | no | default `5000` |
| `MONGODB_URI` | server | yes | `mongodb://…` |
| `JWT_SECRET` | server | yes | long random string |
| `SMTP_HOST` | server | yes | `127.0.0.1` in dev |
| `SMTP_PORT` | server | no | `1025` (Mailpit) / `587` (real) |
| `SMTP_SECURE` | server | no | `true` for port 465 |
| `SMTP_USER` | server | no | blank for Mailpit |
| `SMTP_PASS` | server | no | blank for Mailpit |
| `SMTP_FROM` | server | yes | sender header |
| `LANDING_URL` | server | yes | used in email links |
| `API_URL` | server | yes | used in email links |
| `VITE_API_URL` | landing | yes | backend origin |
| `VITE_LANDING_URL` | landing | no | landing origin |

## API

### `POST /api/contact`

Project enquiry. Validated, persisted to Mongo, team notified by email.

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "company": "Analytical Engines Ltd",
  "projectType": "webapp",
  "budget": "15k_50k",
  "message": "We need a portal for our service team…"
}
```

`projectType` ∈ `landing | webapp | saas | unsure`
`budget` ∈ `under_5k | 5k_15k | 15k_50k | 50k_plus`

### `POST /api/newsletter`

Subscribe an email to Field Notes. Idempotent on duplicates.

```json
{ "email": "ada@example.com" }
```

### `GET /api/health`

Returns `{ ok, env, time }`. Used by the dev wrapper and uptime checks.

## Deployment

| App | Host | Root |
|---|---|---|
| `landing` | Vercel | `landing/` |
| `server` | Railway / Fly / Render | `server/` |

Vercel auto-detects Vite. The `vercel.json` in `landing/` rewrites all
routes to `index.html` so the SPA routing works on hard refresh.

The server is a stock Node app; Nixpacks will pick it up. Set `start`
to `node src/index.js`, and inject every env var from `.env.example`.

## Versioning

- `MAJOR.MINOR.PATCH` (current: `v0.1.0`)
- Branch model: `feature:<name>`, `dev`, `main`
- Bump in `package.json` (root) on release.

## Conventions reference

See `PROJECT-CONVENTIONS.md` for the full style guide. Highlights
applied here:

- Frontend per-page structure (one `pages/` file per route)
- `ui/` primitives that know nothing about the project
- `hooks/` own state, no JSX
- Frozen `config.js` that throws on missing env
- Single `api.js` with `ApiError`
- Centralized rate limiting, error mapping, CORS allowlist

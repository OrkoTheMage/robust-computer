# Project Conventions

A generalized blueprint for setting up full-stack web projects of this shape:
**2–3 frontend apps** (e.g. a marketing site + a logged-in client portal) plus
**1 API backend**, all in a single monorepo with a shared root. Heavily
inspired by the premier-tax project layout (`landing/`, `portal/`, `server/`).

Use this document as a starting checklist when you scaffold a new project.
Every section below should have an explicit answer in the new repo before
the first PR lands.

---

## 1. Tech Stack (defaults)

| Layer | Default | Why |
|---|---|---|
| Frontends | **React 18 + Vite 5** | Fast HMR, zero-config TypeScript escape hatch, tiny production builds |
| Styling | **`@emotion/styled`** (CSS-in-JS) | Theme-able, supports prop-based variants, no global namespace pollution |
| Icons | **`lucide-react`** | Tree-shakable, consistent stroke style, MIT |
| Routing | **`react-router-dom`** | De-facto standard, supports data routers when you need them |
| HTTP | Native `fetch` wrapped in a small `api.js` | No axios lock-in, JSON errors stay typed |
| Backend | **Node.js + Express 4** | Battle-tested, minimal surface area, plays well with `node --watch` |
| Database | **MongoDB via Mongoose 8** | Schema-validated documents; swap to Postgres if the data is relational |
| Auth | **`jsonwebtoken` + `bcryptjs`** | Stateless, no session store to operate |
| Email | **`nodemailer`** | Same lib works against Mailpit (dev) and real SMTP (prod) |
| Uploads | **`multer` + GridFS** (or S3) | Single-binary deploys; no separate bucket to provision for small projects |
| Security headers | **`helmet`** + **`cors`** allowlist | Sensible defaults; allowlist instead of `*` |
| Brute-force | **`express-rate-limit`** | In-memory store is fine at this scale |
| Validation | **`express-validator`** | Schema lives next to the route |
| Package manager | **Yarn 1 (classic)** | Lockfile-per-project, fewer surprises than npm |
| Monorepo | **No workspaces** — root + sub-projects with their own `package.json` | Smaller blast radius between sub-projects; env vars stay explicit |
| Frontend hosting | **Vercel** | Zero-config Vite, preview deploys per PR, free SSL |
| Backend hosting | **Railway** (or Fly.io / Render) | Nixpacks auto-detects Node, managed Mongo addon |
| Mail (dev) | **Mailpit** | Single binary, runs locally, no third-party service in dev |

> **Rule of thumb**: if you need to deviate from a default above, write the
> reason in the repo's README before swapping it in. Defaults only stay
> defaults when they're consciously re-chosen.

---

## 2. Repository Layout

```
project-root/
├── <frontend-a>/                  # e.g. landing (marketing)
├── <frontend-b>/                  # e.g. portal (logged-in app)
├── <frontend-c>/                  # optional — admin tools, etc.
├── server/                        # Express + MongoDB API
├── scripts/                       # repo-root tooling
│   ├── dev.js                     # the dev wrapper (see §7)
│   └── *.mjs                      # bootstrap / reset / mail scripts
├── .env.example                   # canonical env-var contract
├── .env.dev                       # git-ignored, local dev values
├── .env.prod                      # git-ignored, prod-shaped values
├── package.json                   # root — version controller + dev wrapper
└── README.md
```

### Per-frontend structure (React + Vite)

```
<frontend>/
├── index.html
├── package.json                   # { "name": "<frontend>", "type": "module" }
├── vite.config.js                 # envDir: '../', proxy /api → server
├── vercel.json                    # SPA rewrites → /index.html
├── public/                        # static assets, robots.txt, sitemap.xml
└── src/
    ├── main.jsx                   # ReactDOM root, providers, BrowserRouter
    ├── App.jsx                    # <Routes> + protected routes
    ├── index.css                  # CSS reset / globals
    ├── config.js                  # frozen env reader, throws on missing vars
    ├── api.js                    # fetch wrapper, JSON, ApiError class
    ├── components/
    │   ├── sections/             # page-level shells (Hero, Navbar, AppShell)
    │   ├── ui/                   # reusable primitives (Button, Input, Card)
    │   ├── modals/               # (optional) reusable dialogs
    │   └── <other>/              # domain-specific (e.g. seo/, charts/)
    ├── pages/                    # route-level components for navigated pages
    ├── hooks/                    # state + behavior, one concern per file
    ├── context/                  # (optional) cross-cutting providers
    ├── data/                     # (optional) static copy / fixtures
    ├── utils/                    # (optional) pure helpers, formatters
    └── styles/                   # design tokens (colors.js, typography.js)
```

### Server structure (Express + MongoDB)

```
server/
├── package.json                   # { "name": "server", "type": "module" }
└── src/
    ├── index.js                   # app bootstrap: middleware, routes, listen
    ├── config.js                  # frozen env reader, loads .env.<NODE_ENV>
    ├── models/                    # Mongoose schemas, one per resource
    ├── routes/                    # Express routers, one per resource
    ├── middleware/                # auth, RBAC, rate limiters
    └── utils/                     # email, audit, encryption, RBAC, validation
```

---

## 3. Component Conventions — "Style" (visual layers)

Folders that produce visible UI. Each layer wraps the next.
**A layer can only depend on layers to its right.**

| Folder | Scope | Purpose |
|---|---|---|
| `pages/` | per-frontend | Route-level components. One file per route. Pure layout + composition. |
| `sections/` | per-frontend | Page-level shells composed of `ui/` primitives (e.g. `Hero`, `Navbar`, `AppShell`, `AuthShell`). |
| `modals/` | per-frontend | Reusable dialogs (only when the same dialog is needed by multiple pages). |
| `ui/` | per-frontend | Reusable primitives. **Must be generic — no project-specific knowledge.** |
| `<other>/` | per-frontend | Anything genuinely cross-cutting (e.g. `seo/` for SEO config + schema components). |

### The Page/Section rule

A file in `pages/` or `sections/` may contain **only**:

1. Imports
2. **Page-specific** `styled-components` — primitives that can't reasonably be promoted to `ui/` because no other file uses them
3. A default export whose body is:
   - hook calls (top)
   - clean JSX return (bottom)

**If you find yourself writing any of the following inside a page, extract it first:**

- A non-styled component → `ui/` (or `modals/`)
- A `useEffect`, `useState`, or other hook → `hooks/`
- A helper function or constant → `utils/` (or `data/`)
- A cross-cutting provider/state mutation → `context/`
- A fetch call → wrap in `api.js` and consume from a `hooks/` file

**Example (a page that follows the rule):**

```jsx
// pages/Email.jsx
import styled from '@emotion/styled'
import { PageWrapper, Container, PageHero, PageTitle, PageSubtitle,
         PageCard, PageCardBody, PageLinkButton, CTABox, CTATitle, CTAText } from '../components/ui'
import { useEmailForm } from '../hooks/useEmailForm'

// Page-specific styled components — kept here because nothing else uses them.
const Form = styled.form` display: flex; flex-direction: column; gap: 16px; `
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `
// ...other form-element styles

export default function Email() {
  // 1. Hook calls
  const { formData, submitted, submitting, error, /* ... */, handleChange, handleSubmit } = useEmailForm()

  if (submitted) { return /* thank-you screen */ }

  // 2. Clean JSX return
  return (
    <PageWrapper>
      {/* ... */}
    </PageWrapper>
  )
}
```

### Why a `ui/` index.js?

Each layer re-exports through a single `index.js`. Pages import:

```jsx
import { Button, Card, Modal } from '../components/ui'   // ✅
import { Button } from '../components/ui/Button'        // ❌ deep import
```

This keeps refactors cheap (rename a file, the page doesn't change), and
makes the surface area of `ui/` auditable in one place.

### The `ui/` rule

A primitive in `ui/` **must not**:

- Import from `pages/` or `sections/`
- Import from `hooks/` or `context/`
- Contain `useEffect`, `useState`, or other React hooks (unless it's a styled wrapper around a hook-using primitive — and even then, prefer leaving state at the page level)
- Reference copy, brand names, or routes from the project

If it does any of these, it doesn't belong in `ui/`.

---

## 4. Component Conventions — "Logical" (behavior layers)

Folders that produce **behavior**, not pixels. Nothing in here renders JSX
on its own.

| Folder | Scope | Purpose |
|---|---|---|
| `hooks/` | per-frontend | State + effects. One file per concern. Pages consume a small number of focused hooks. |
| `context/` | per-frontend | Cross-cutting providers (auth, theme, toast, etc.). Wrap providers in `main.jsx`. |
| `utils/` | per-frontend | Pure helpers (formatters, validators, permission calculators, constants). |
| `api.js` | per-frontend | One file. Centralized `fetch` wrapper. Exports `{ get, post, put, del }` and an `ApiError` class. |
| `config.js` | per-frontend | One file. Frozen env reader. **Throws on missing required vars.** |
| `data/` | per-frontend (optional) | Static copy, fixtures, JSON-shaped content. |
| `middleware/` | server only | Express middleware (auth, rate limit, RBAC). |
| `models/` | server only | Mongoose schemas. One file per resource. |
| `routes/` | server only | Express routers. One file per resource. |
| `utils/` | server only | Email, audit, encryption, RBAC, validation, background sweeps. |

### Hooks

- **One hook per file.** Naming: `use<Concern>.js` (e.g. `useEmailForm.js`).
- **A hook owns the state** for a single concern and returns the bindings a page needs (state values + handlers + derived flags).
- Hooks may call other hooks; they may call `api.js`; they may read `config.js`. They must not import styled-components or render JSX.

```js
// hooks/useEmailForm.js
import { useState } from 'react'
import { api, ApiError } from '../api'
import { emailPage } from '../data/copy'

export function useEmailForm() {
  const [formData, setFormData] = useState({ /* ... */ })
  const [submitted, setSubmitted] = useState(false)
  // ...
  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await api.post('/email', formData); setSubmitted(true) }
    catch (err) { /* ... */ }
  }
  return { formData, submitted, handleSubmit /* ... */ }
}
```

### Context

Use context for state that **multiple unrelated subtrees** need:
authentication, theme, toasts, message inbox state, etc.

Wrap providers in `main.jsx`, **outermost-first**, so each provider can
read from the ones above it:

```jsx
// main.jsx
<BrowserRouter>
  <ToastProvider>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </ToastProvider>
</BrowserRouter>
```

Don't use context for things that only one component subtree needs —
lift state to the page, or extract a hook.

### `api.js` (frontend)

Single-purpose: JSON `fetch` wrapper. Same shape in every frontend project.

```js
// api.js
import config from './config'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message); this.status = status; this.data = data
  }
}

async function request(endpoint, options = {}) {
  const init = {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  }
  if (options.body && !(options.body instanceof FormData)) init.body = JSON.stringify(options.body)

  const response = await fetch(`${config.apiUrl}/api${endpoint}`, init)
  let data = null
  try { data = await response.json() } catch { /* non-JSON */ }

  if (!response.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${response.status})`
    throw new ApiError(message, response.status, data)
  }
  return data
}

export const api = {
  get:    (endpoint)        => request(endpoint),
  post:   (endpoint, body)  => request(endpoint, { method: 'POST', body }),
  put:    (endpoint, body)  => request(endpoint, { method: 'PUT', body }),
  del:    (endpoint)        => request(endpoint, { method: 'DELETE' }),
}
export { ApiError }
```

### `config.js` (frontend)

Same shape in every frontend project. **Required vars throw at boot** —
no silent `undefined` propagating into production.

```js
// config.js
const APP_NAME = 'MyApp'

const required = (key) => {
  const value = import.meta.env[key]
  if (value === undefined) {
    throw new Error(
      `[${APP_NAME}] Missing required env var: ${key}\n` +
      `   Set it in .env.dev, .env.prod, or your Vercel project env vars.\n` +
      `   See README > Environment Variables for the full contract.`
    )
  }
  return value
}

// Code constants — values that aren't secrets and don't change per-env.
const BRAND_NAME = 'My Brand'
const BRAND_DOMAIN = 'example.com'

const config = Object.freeze({
  apiUrl: required('VITE_API_URL'),
  // ...
  brand: Object.freeze({ name: BRAND_NAME, domain: BRAND_DOMAIN }),
})

export default config
```

### Server: models, routes, middleware, utils

- **models/** — One Mongoose schema per resource. Keep schema validators narrow; complex business rules belong in routes.
- **routes/** — One Express router per resource. Validate input with `express-validator` at the top, gate auth with middleware, then dispatch. Keep route handlers short — push heavy logic into `utils/`.
- **middleware/** — `authenticate`, `requireRole`, `adminOnly`, `systemAdminOnly`. Single source of truth for RBAC checks lives here, not duplicated in route handlers.
- **utils/** — Side-effecting helpers (email, audit, storage) and pure helpers (RBAC predicates, validation, formatters). The `audit()` and `auditSystem()` wrappers are how every state change gets recorded — call them from every mutating route handler.

---

## 5. Code Style

Cross-cutting style rules that apply to **every** file in the repo (frontends
and server). These run alongside the layer-specific conventions in §3 and §4.

### Comments

- **File-level documentation lives at the top of the file, after the imports,
  in a multi-line doc-comment block.** It explains what the file is for, why
  it exists, and any non-obvious gotchas. Example:

  ```js
  // src/hooks/useEmailForm.js
  import { useState } from 'react'
  import { api, ApiError } from '../api'

  /**
   * useEmailForm
   *
   * Owns the state for the contact-email form on the marketing site:
   * field values, submission lifecycle, and server-error surfacing.
   *
   * Returns a single binding object the page destructures directly.
   */

  export function useEmailForm() {
    // ...
  }
  ```

- **Avoid inline comments almost always.** If a line needs a comment to be
  understood, the code should usually be rewritten or extracted instead.
  Code that names itself well doesn't need narration.
- **The only acceptable inline comment is one placed *above* a line that
  handles an edge case** — a non-obvious branch, a workaround, or a place
  where the "right" thing to do is surprising. Don't explain *what* the
  code does; explain *why* this approach was taken.

### Semicolons

- **Avoid any and all unnecessary semicolons.** JavaScript's ASI
  (Automatic Semicolon Insertion) terminates statements reliably. Add a
  semicolon only when the grammar actually requires one (rare). In
  practice: no trailing `;` after statements, exports, function
  declarations, or object/array literals.
- Configure your formatter to enforce this — for example Prettier's
  `{ "semi": false }` — so it never comes up in review.

---

## 6. Environment Variables

Every env var lives in **one shared file** at the repo root. The dev wrapper
(§7) chooses between `.env.dev` and `.env.prod`. Each sub-project points at
the repo root to load it.

### `.env.example`

The canonical contract. **All deployers copy this and fill in real values.**
It must list every var the code reads.

```
# ── Server (read by server/src/config.js) ──
MONGODB_URI=
JWT_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
NODE_ENV=
LANDING_URL=
PORTAL_URL=
API_URL=

# ── Frontend-A (read by <frontend>/src/config.js) ──
VITE_API_URL=
VITE_LANDING_URL=
VITE_PORTAL_URL=
```

### Splitting concerns

- **`API_URL`** — public URL of the backend. Used by the backend itself to build absolute URLs in outbound email.
- **`LANDING_URL` / `PORTAL_URL`** — public URLs of each frontend. The backend needs these for setup/reset/inbox links in transactional email. Each frontend needs all three URLs so cross-app links work.
- **`VITE_*`** — exposed to the frontend by Vite. **Never put a secret in a `VITE_*` var** — it's shipped to the browser.

### Frontend env-loading pattern

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../',   // ← point at repo-root, not the frontend dir
  server: {
    port: 3000,
    strictPort: true,   // ← fail loud on busy port (better than silent re-allocation)
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
      },
    },
  },
})
```

### Server env-loading pattern

```js
// server/src/config.js
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NODE_ENV = process.env.NODE_ENV || 'development'
const envFileName = NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
const envFilePath = path.resolve(__dirname, `../../${envFileName}`)
dotenv.config({ path: envFilePath })
```

---

## 7. Dev Wrapper (`scripts/dev.js`)

A single script boots **all** sub-projects at once. Required because:

- Sub-projects need to coordinate which env file to load.
- The Vite proxies need to know the **actual** server port, not the default.
- Pre-flight port checks prevent cryptic "address already in use" errors.

The wrapper must:

1. **Parse `--env=dev|prod`** (default: `dev`). Map to `NODE_ENV=development|production` for the server and `--mode dev|prod` for Vite.
2. **Probe every port** (landing, portal, server) before spawning anything. Bind to `0.0.0.0` to avoid IPv4/IPv6 false-negatives.
3. **Allocate the server port upfront** and inject `PORT` into every child's env. The Vite proxies read `process.env.PORT || 5000`, so they need this to point at the bound port, not the default.
4. **Print a colored banner** showing which env file, which DB, and which ports — before any child connects.
5. **Spawn all children with `concurrently`** with a timestamped prefix per child.

```js
// package.json (root)
{
  "scripts": {
    "dev": "node scripts/dev.js",
    "dev:prod": "node scripts/dev.js --env=prod",
    "dev:<a>": "cd <a> && yarn dev",
    "dev:<b>": "cd <b> && yarn dev",
    "dev:server": "cd server && yarn dev",
    "install:all": "cd <a> && yarn install && cd ../<b> && yarn install && cd ../server && yarn install"
  }
}
```

A sub-project's `package.json` always has:

```json
{
  "scripts": {
    "dev":   "vite --mode dev",
    "build": "vite build --mode prod",
    "preview": "vite preview"
  }
}
```

The server:

```json
{
  "scripts": {
    "dev":   "NODE_ENV=development node --watch src/index.js",
    "start": "NODE_ENV=production node src/index.js"
  }
}
```

---

## 8. Routing & Page Composition

### Frontend-A (marketing, e.g. `landing/`)

```
src/
├── App.jsx                  # <Routes> + ScrollToTop + SpokePage wrapper
├── pages/                   # one file per "spoke" route (FAQ, Contact, Privacy, ...)
├── components/sections/     # one file per hub section (Hero, Services, About, Footer, Navbar)
└── seo/                     # <SEO /> component + JSON-LD schemas
```

- **Hub page** is composed inline in `App.jsx` (`<HomePage>`).
- **Spoke pages** are route-level — each renders its own `<SpokePage>` shell (with `Navbar variant="spoke"` and an `<SEO title=... description=... />`).
- **Sections** are large visual blocks (Hero, Services, About, etc.) composed of `ui/` primitives.

### Frontend-B (logged-in app, e.g. `portal/`)

```
src/
├── App.jsx                  # <Routes> + ProtectedRoute wrapper
├── pages/                   # one file per route (Dashboard, Documents, Users, ...)
├── components/sections/     # AppShell, AuthShell — page-level shells
└── components/modals/       # (optional) dialogs reused across pages
```

- **`AppShell`** wraps the sidebar + main content area; an `<Outlet />` from React Router places the matched page inside it.
- **`AuthShell`** wraps login / setup / reset-password routes.
- **`ProtectedRoute`** reads from `AuthContext` and gates routes by `requireElevated` (admin/owner/sysadmin) or just authentication.

### Server

```
/api/<resource>             # one router per resource, mounted in src/index.js
```

- All routers are prefixed with `/api`. Mount them in one place:

```js
// server/src/index.js
app.use('/api/auth',      authRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/documents', documentRoutes)
// ...
```

- The error handler in `src/index.js` must recognize:
  - `multer.MulterError` (file size, unexpected field)
  - The custom "Invalid file type" error from multer's fileFilter
  - Mongoose `ValidationError`, `CastError`, code `11000` (duplicate key)
  - Fallback `500` that does **not** leak internals

---

## 9. Deployment Topology

| App | Host | Root | Auto-deploy branch |
|---|---|---|---|
| Frontend-A (marketing) | Vercel | `<frontend-a>/` | `main` |
| Frontend-B (app) | Vercel | `<frontend-b>/` | `main` |
| Frontend-C (admin) | Vercel | `<frontend-c>/` | `main` |
| Server (API) | Railway | `server/` | `main` |

- **Vercel** — point the project root at the sub-directory; SPA rewrites via `vercel.json`:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Railway** — Nixpacks auto-detects Node; set `start` to `node src/index.js`; inject env vars (don't check them in).

### Env vars per host

| Host | Vars |
|---|---|
| Vercel — Frontend-A | `VITE_API_URL`, `VITE_<B>_URL`, `VITE_<A>_URL` |
| Vercel — Frontend-B | `VITE_API_URL`, `VITE_<A>_URL`, `VITE_<B>_URL` |
| Railway (Server) | `MONGODB_URI`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `NODE_ENV=production`, `PORT`, `<A>_URL`, `<B>_URL`, `API_URL` |

---

## 10. Versioning

- **`MAJOR.MINOR.PATCH`** (e.g. `v1.4.2`).
- **Branch model**:
  - `feature:<name>` — feature work
  - `dev` — integration
  - `main` — production
- **Release flow**:
  1. Merge feature → `dev`
  2. Bump version in root `package.json` + repo `README.md`
  3. Squash-merge `dev` → `main` with version tag
  4. Fast-forward `dev` to `main`
  5. Delete feature branch
- **Version controller**: root `package.json` is the source of truth. README header shows the current version.

---

## 11. Bootstrap Checklist

Use this when scaffolding a new project from scratch.

### Repo

- [ ] Create root `package.json` with name + version + scripts (`dev`, `dev:prod`, `dev:*`, `install:all`).
- [ ] Add `.env.example` listing every required var, grouped by sub-project.
- [ ] Add `.gitignore` covering `node_modules`, `.env*` (keep `.env.example`), `**/dist/`, `yarn.lock` at root (keep each sub-project's).
- [ ] Write `README.md` with: tech-stack table, installation, project-structure map, env-var contract, deployment table.

### Per frontend

- [ ] `package.json` with `{ name, type: "module", scripts: { dev, build, preview } }`.
- [ ] `vite.config.js` with `envDir: '../'`, `strictPort: true`, `/api` proxy.
- [ ] `vercel.json` with SPA rewrites.
- [ ] `index.html` with root `<div id="root">` + module script tag.
- [ ] `src/main.jsx` wrapping `<App />` in `<BrowserRouter>` + any providers.
- [ ] `src/App.jsx` with `<Routes>` + protected-route component if needed.
- [ ] `src/config.js` — frozen env reader that throws on missing vars.
- [ ] `src/api.js` — JSON `fetch` wrapper exporting `api` + `ApiError`.
- [ ] `src/styles/colors.js`, `typography.js`, `index.css` with the design tokens.
- [ ] `src/components/ui/index.js` — start with 3–5 primitives (Button, Section/Container, Card, Text, Animations).

### Server

- [ ] `package.json` with `{ name, type: "module", scripts: { dev, start } }`.
- [ ] `src/config.js` — frozen env reader, loads `.env.dev` or `.env.prod` based on `NODE_ENV`.
- [ ] `src/index.js` — app bootstrap with `helmet`, `cors` allowlist, JSON middleware, route mounting, error handler.
- [ ] `src/middleware/auth.js` — `authenticate`, `requireRole`, `adminOnly`, `systemAdminOnly`.
- [ ] `src/models/<Resource>.js` — Mongoose schema.
- [ ] `src/routes/<resource>.js` — Express router, mounted at `/api/<resource>`.
- [ ] `src/utils/email.js` — nodemailer transport + per-template send helpers.

### Dev wrapper

- [ ] `scripts/dev.js` with port pre-flight, env-file selection, `concurrently` spawn.
- [ ] Verify `yarn install:all` installs every sub-project cleanly.
- [ ] Verify `yarn dev` boots all three with no errors.

### Deploy

- [ ] Vercel projects for each frontend, rooted at the sub-directory.
- [ ] Railway (or equivalent) for the server.
- [ ] DNS / custom domain (optional): update env vars + `BRAND_DOMAIN` in every `config.js`.

---

## 12. Anti-Patterns to Reject in PR Review

- A page file that contains `useEffect`, `useState`, fetch calls, or helper functions. **Extract them.**
- A `ui/` primitive that imports from `hooks/`, `context/`, `pages/`, or `sections/`. **It doesn't belong in `ui/`.**
- A `useEffect` whose dependency array is empty but reads from state — usually a missing dep or a state-update-in-render bug.
- A direct `fetch()` call in a page or hook. **Use `api.js`.**
- A direct `import.meta.env.X` read outside `config.js`. **Centralize.**
- A `process.env.X` read outside `server/src/config.js`. **Centralize.**
- An env var with a code-side fallback. **Deployers must set the var.** Defaults belong in code, exposed values belong in env.
- A CORS allowlist of `*` or `'true'`. **Allowlist specific origins.**
- A password reset / setup token that doesn't expire. **Always expiring, single-use.**
- A route handler that returns the raw error stack to the client. **Map known errors to friendly messages; fall back to a generic 500.**
- A new env var added without an entry in `.env.example` and the README env-var table. **The contract lives in `.env.example`.**
- A `console.log` of a secret, a token, or a JWT. **Strip before commit.**

---

## 13. When to Break the Rules

The conventions above are defaults, not laws. Break them consciously, in writing:

- **State management**: if a screen has 10+ interacting state slices, consider Zustand or Redux instead of `useState` + context. Document the choice in the README.
- **CSS-in-JS**: if the team prefers Tailwind, CSS-in-JS, or CSS Modules — pick one and stick with it. Don't mix.
- **Backend framework**: Express is the default. Fastify / Hono are fine if the project is API-first and latency-sensitive.
- **Database**: MongoDB is the default for document-shaped data. Postgres for relational. Pick one per project; don't mix without a reason.
- **Monorepo tooling**: Yarn 1 + no workspaces works at 2–4 sub-projects. Beyond that, adopt Turborepo or Nx.

When you deviate, update this document with the new default and the rationale.
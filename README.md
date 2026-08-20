# The Bridge — Frontend

> **Angular 18** · **Vercel** · **GitHub Actions CI/CD**

[![CI](https://github.com/YOUR_ORG/the_bridge_frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/YOUR_ORG/the_bridge_frontend/actions/workflows/frontend-ci.yml)
[![codecov](https://codecov.io/gh/YOUR_ORG/the_bridge_frontend/branch/main/graph/badge.svg?token=YOUR_CODECOV_TOKEN)](https://codecov.io/gh/YOUR_ORG/the_bridge_frontend)

> **Replace** `YOUR_ORG` and `YOUR_CODECOV_TOKEN` with your actual GitHub organization/username and Codecov token.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 18.2 |
| Styling | TailwindCSS + SCSS |
| Tests | Karma + Jasmine (unit) · Playwright (e2e) |
| Linting | ESLint (@angular-eslint) + Prettier |
| Git hooks | Husky + lint-staged |
| CI/CD | GitHub Actions |
| Deploy | Vercel |
| Coverage | Codecov |
| Performance | Lighthouse CI |

---

## Development server

```bash
npm start
# → http://localhost:4200
```

## Build

```bash
# Development
npm run build

# Production
npm run build:prod
```

## Testing

```bash
# Unit tests (interactive)
npm test

# Unit tests (CI / headless)
npm run test:ci

# E2E smoke tests against local dev server
npm run e2e:local

# E2E against a specific URL (CI style)
E2E_BASE_URL=https://your-preview.vercel.app npm run e2e
```

## Linting & Formatting

```bash
# ESLint check
npm run lint

# ESLint auto-fix
npm run lint:fix

# Prettier format
npm run format

# Prettier check only (CI)
npm run format:check
```

---

## CI/CD Pipeline

```
push / PR  ─────────────────────────────────────────────────────────────────────
                │
                ├── quality ──── ESLint + Prettier check
                │                └── ng test --browsers=ChromeHeadlessCI --code-coverage
                │                    └── Upload to Codecov
                │                └── ng build --configuration production
                │
                ├── e2e ──────── Playwright smoke tests → Vercel preview URL
                │
                └── lighthouse ─ Lighthouse CI → Vercel preview URL
                                  (perf≥80 · a11y≥90 · best-practices≥85 · seo≥80)
```

### Required GitHub Secrets & Variables

| Name | Type | Description |
|---|---|---|
| `CODECOV_TOKEN` | Secret | Token from codecov.io for coverage upload |
| `PROD_API_URL` | Secret | Production backend API URL (injected at build) |
| `LHCI_GITHUB_APP_TOKEN` | Secret | Lighthouse CI GitHub App token (optional but recommended) |
| `VERCEL_TEAM_SLUG` | Variable | Your Vercel team slug (for preview URL construction) |
| `VERCEL_PROD_URL` | Variable | Production Vercel URL, e.g. `https://the-bridge.vercel.app` |

---

## Vercel Configuration

The project already has a [`vercel.json`](./vercel.json) with SPA rewrite rules.

### Connect to Vercel (one-time setup)

1. Go to [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. Set **Framework Preset** to: `Other` (or Angular)
3. Configure:
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist/the_bridge_frontend/browser`
   - **Install Command**: `npm ci`
   - **Node.js Version**: `20.x`
4. Add **Environment Variables** in the Vercel dashboard:
   - `PROD_API_URL` → `https://nineantra-the-bridge-backend.onrender.com/api`

> **Angular environment files vs Vercel env vars**: The `environment.prod.ts` file
> currently has the API URL hardcoded. For a more flexible setup, you can use
> `process.env['PROD_API_URL']` in `environment.prod.ts` — Angular CLI will
> substitute it from `PROD_API_URL` defined in Vercel's environment variables.

### Preview Deployments

Vercel automatically creates a preview deployment for every PR. The URL pattern is:
```
https://the-bridge-frontend-git-<branch-slug>-<team-slug>.vercel.app
```
Set `VERCEL_TEAM_SLUG` in GitHub Variables to match your Vercel team name.

---

## Git Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via Husky:

```
feat(auth): add JWT refresh token logic
fix(dashboard): correct chart data aggregation
docs(readme): update Vercel setup instructions
chore(deps): bump @angular/core to 18.3
```

Valid types: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `perf` · `ci` · `build` · `revert`

---

## First-time Setup (Local)

```bash
# 1. Clone and install
git clone https://github.com/YOUR_ORG/the_bridge_frontend.git
cd the_bridge_frontend
npm install        # also runs `prepare` to set up Husky hooks

# 2. Copy and fill in environment
cp .env.example .env
# Edit .env: set DEV_API_URL=http://localhost:8080/api

# 3. Start dev server
npm start
```
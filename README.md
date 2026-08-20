# The Bridge — Frontend

> **Angular 18** · **Vercel** · **GitHub Actions CI/CD**

[![CI/CD — The Bridge Frontend](https://github.com/YOUR_ORG/the_bridge_frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/YOUR_ORG/the_bridge_frontend/actions/workflows/frontend-ci.yml)
[![codecov](https://codecov.io/gh/YOUR_ORG/the_bridge_frontend/branch/main/graph/badge.svg?token=YOUR_CODECOV_TOKEN)](https://codecov.io/gh/YOUR_ORG/the_bridge_frontend)

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
| Deploy | Vercel (orchestrated exclusively via GitHub Actions) |
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

# E2E against a specific URL
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

## CI/CD Pipeline Architecture

Vercel automatic Git builds are **disabled**. Deployments are orchestrated **exclusively** by GitHub Actions **after** all quality checks pass.

```
push / PR  ───────────────────────────────────────────────────────────────────────────
                │
                ├── quality ──────── ESLint + Prettier + Unit Tests (Karma Headless)
                │                    └── Codecov Upload
                │
                ├── deploy-preview ─ Vercel Preview Deploy (PRs only, after quality)
                │
                ├── e2e ──────────── Playwright smoke tests (after preview)
                │
                ├── lighthouse ───── Lighthouse CI audit (after preview)
                │
                └── deploy-prod ──── Vercel Production Deploy (main push only)
                                     (ONLY if quality + e2e + lighthouse ALL pass)
```

---

## Required GitHub Secrets & Variables

### Secrets (encrypted)

| Name | Description | Where to get |
|---|---|---|
| `VERCEL_TOKEN` | Vercel Personal Access Token | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel Team / Org ID | From `.vercel/project.json` after `npx vercel link` |
| `VERCEL_PROJECT_ID` | Vercel Project ID | From `.vercel/project.json` after `npx vercel link` |
| `PROD_API_URL` | Production Backend API URL | `https://nineantra-the-bridge-backend.onrender.com/api` |
| `CODECOV_TOKEN` | Codecov Repository Token | [codecov.io](https://codecov.io) |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI Token (optional) | [github.com/apps/lighthouse-ci](https://github.com/apps/lighthouse-ci) |

---

## How to Obtain Vercel Secrets (Step-by-Step)

### 1. Get `VERCEL_TOKEN`
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Click **Create Token** → Name: `GitHub Actions CI`.
3. Copy the token and add it as `VERCEL_TOKEN` in GitHub Secrets.

### 2. Get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
1. Run in your terminal at the root of `the_bridge_frontend`:
   ```bash
   npx vercel link
   ```
2. Follow prompts to link your local project to your Vercel project.
3. Open `.vercel/project.json` in your editor:
   ```json
   {
     "orgId": "team_xxxxxxxxxxxxxxxxxxxx",
     "projectId": "prj_xxxxxxxxxxxxxxxxxxxx"
   }
   ```
4. Copy `orgId` → Save as `VERCEL_ORG_ID` in GitHub Secrets.
5. Copy `projectId` → Save as `VERCEL_PROJECT_ID` in GitHub Secrets.

### 3. Disable Vercel Automatic Git Deployments
1. Go to **Vercel Dashboard → Project Settings → Git**.
2. Under **Git Repository**:
   - Turn **OFF** "Automatically deploy" OR
   - The [`vercel.json`](./vercel.json) already sets `"git": { "deploymentEnabled": false }`.

---

## Git Commit Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) via Husky:

```bash
git commit -m "ci(setup): add vercel deployment jobs"
```
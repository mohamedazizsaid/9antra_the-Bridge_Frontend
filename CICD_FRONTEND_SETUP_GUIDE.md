# Frontend CI/CD — Setup Guide & Configuration Steps

This file documents **every manual action** required after the files in this PR are committed.
Follow the steps in order.

---

## Step 1 — Install new npm dependencies

```bash
cd the_bridge_frontend
npm install
```

This installs:
- `@angular-eslint/*` — ESLint integration for Angular
- `@typescript-eslint/*` — TypeScript ESLint rules
- `eslint`, `eslint-config-prettier` — linting engine + Prettier compat
- `prettier` — code formatter
- `husky` — git hooks
- `lint-staged` — run linters on staged files only
- `@playwright/test` — E2E test framework

---

## Step 2 — Initialize Husky (one-time per dev machine)

Husky is initialized via the `prepare` lifecycle script automatically on `npm install`.
If it wasn't set up, run:

```bash
npx husky init
```

Then **manually verify** the hooks exist and are executable:

```bash
# Windows: just check the files exist
ls .husky/pre-commit
ls .husky/commit-msg
```

On **Linux/macOS** (e.g. CI containers), ensure they are executable:
```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

---

## Step 3 — Install Playwright browsers (one-time per machine)

```bash
npx playwright install --with-deps chromium
```

---

## Step 4 — Test the toolchain locally

```bash
# Run linter
npm run lint

# Run formatter check
npm run format:check

# Run unit tests headless (same as CI)
npm run test:ci

# Run e2e tests locally (starts dev server automatically)
npm run e2e:local
```

---

## Step 5 — GitHub Repository Secrets & Variables

Go to: **GitHub → Your Repo → Settings → Secrets and variables → Actions**

### Secrets (encrypted)

| Secret name | Value | Required? |
|---|---|---|
| `CODECOV_TOKEN` | Token from [codecov.io](https://codecov.io) after linking your repo | Yes |
| `PROD_API_URL` | `https://nineantra-the-bridge-backend.onrender.com/api` | Yes |
| `LHCI_GITHUB_APP_TOKEN` | Token from [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) | Optional |

### Variables (non-secret)

| Variable name | Value | Required? |
|---|---|---|
| `VERCEL_TEAM_SLUG` | Your Vercel team slug (visible in vercel.com URL: `vercel.com/<slug>`) | Yes |
| `VERCEL_PROD_URL` | e.g. `https://the-bridge.vercel.app` | Yes |

---

## Step 6 — Connect to Vercel

### 6.1 — Import project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **"Import Git Repository"**
3. Choose your GitHub org/account and select `the_bridge_frontend`
4. Click **Import**

### 6.2 — Configure build settings

| Setting | Value |
|---|---|
| **Framework Preset** | `Other` (select manually — not "Angular" which uses older builder) |
| **Build Command** | `npm run build:prod` |
| **Output Directory** | `dist/the_bridge_frontend/browser` |
| **Install Command** | `npm ci` |
| **Node.js Version** | `20.x` |

### 6.3 — Add environment variables in Vercel

Go to **Project → Settings → Environment Variables** and add:

| Variable | Value | Environment |
|---|---|---|
| `PROD_API_URL` | `https://nineantra-the-bridge-backend.onrender.com/api` | Production |
| `PROD_API_URL` | `https://nineantra-the-bridge-backend.onrender.com/api` | Preview |

### 6.4 — Get your Vercel Team Slug

After deployment, look at your Vercel dashboard URL:
```
https://vercel.com/YOUR-TEAM-SLUG/the-bridge-frontend
```

Copy `YOUR-TEAM-SLUG` and add it as a GitHub Variable `VERCEL_TEAM_SLUG`.

### 6.5 — Preview URL pattern

For PRs, the Vercel preview URL format is:
```
https://the-bridge-frontend-git-<branch-slug>-<team-slug>.vercel.app
```

Example for branch `feat/auth-login`:
```
https://the-bridge-frontend-git-feat-auth-login-myteam.vercel.app
```

The CI workflow automatically constructs this URL from the branch name.

---

## Step 7 — Codecov Integration

1. Go to [codecov.io](https://codecov.io) and sign in with GitHub
2. Add your repository
3. Copy the **Repository Token**
4. Add it as `CODECOV_TOKEN` in GitHub Secrets (Step 5)
5. Update the README badge with your actual org/username:
   ```
   https://codecov.io/gh/YOUR_ORG/the_bridge_frontend
   ```

---

## Step 8 — Lighthouse CI (Optional but recommended)

1. Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. Grant it access to your frontend repository
3. Copy the token it provides
4. Add it as `LHCI_GITHUB_APP_TOKEN` in GitHub Secrets
5. This enables Lighthouse results to appear as PR status checks

---

## Step 9 — Update README badges

In [`README.md`](./README.md), replace:
```
YOUR_ORG → your actual GitHub username or organization
YOUR_CODECOV_TOKEN → your Codecov repository token
```

---

## Step 10 — Environment Variables: Angular vs Vercel

### Current approach (hardcoded `environment.prod.ts`)

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: "https://nineantra-the-bridge-backend.onrender.com/api"
};
```

**Pros**: Simple, always works  
**Cons**: URL is committed to source code

### Optional: Dynamic approach (Vercel env vars at build time)

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: process.env['PROD_API_URL'] || 'https://nineantra-the-bridge-backend.onrender.com/api'
};
```

Then set `PROD_API_URL` in Vercel dashboard → the build will pick it up.  
This is already what `environment.ts` (dev) does with `DEV_API_URL`.

---

## Troubleshooting

### `ng lint` fails with "Builder not found"

Run:
```bash
npm install @angular-eslint/builder --save-dev
```

### ChromeHeadless not found in CI

The workflow sets `CHROME_BIN: /usr/bin/google-chrome-stable` — this is pre-installed
on `ubuntu-latest` GitHub runners. The `karma.conf.js` uses `ChromeHeadlessCI` (with
`--no-sandbox` flag) when `process.env.CI` is set.

### Playwright cannot reach Vercel preview URL

- Ensure `VERCEL_TEAM_SLUG` GitHub Variable is set correctly
- The workflow waits up to 3 minutes for the URL to return HTTP 200
- Check Vercel dashboard that the deployment succeeded before re-running

### Husky hooks not running on Windows

Run in project root:
```bash
npm run prepare
```

If still not working, try:
```bash
npx husky
```
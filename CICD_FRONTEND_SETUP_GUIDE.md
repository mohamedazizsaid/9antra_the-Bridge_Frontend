# Frontend CI/CD — Setup Guide & Configuration Steps

This document details the complete setup for orchestrating Vercel deployments **exclusively via GitHub Actions** after all quality, E2E, and Lighthouse checks pass.

---

## 1. Disable Automatic Vercel Git Deployments

To ensure Vercel **only** deploys when GitHub Actions pipeline passes:

1. [`vercel.json`](./vercel.json) already includes:
   ```json
   {
     "git": {
       "deploymentEnabled": false
     }
   }
   ```
2. **In Vercel Dashboard**:
   - Go to **Project Settings → Git**.
   - Under **Connected Repository**, ensure **Automatically deploy** is turned OFF.

---

## 2. Obtain Vercel Credentials for GitHub Actions

### Step A: Generate `VERCEL_TOKEN`
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Click **Create Token**.
3. Name: `GitHub Actions CI`.
4. Copy the generated token string.

### Step B: Obtain `VERCEL_ORG_ID` & `VERCEL_PROJECT_ID`
1. Run in your terminal at the root of `the_bridge_frontend`:
   ```bash
   npx vercel link
   ```
2. Confirm your scope and project selection.
3. Open `.vercel/project.json` created in your root directory:
   ```json
   {
     "orgId": "team_xxxxxxxxxxxxxxxxxxxx",
     "projectId": "prj_xxxxxxxxxxxxxxxxxxxx"
   }
   ```
4. Note down:
   - `orgId` → `VERCEL_ORG_ID`
   - `projectId` → `VERCEL_PROJECT_ID`

---

## 3. Save Secrets in GitHub Repository

Go to: **GitHub → Your Repository → Settings → Secrets and variables → Actions**

Add the following **Repository Secrets**:

| Secret Name | Value | Description |
|---|---|---|
| `VERCEL_TOKEN` | Token from Step A | Vercel CLI Authentication |
| `VERCEL_ORG_ID` | `orgId` from Step B | Vercel Team / Org Identifier |
| `VERCEL_PROJECT_ID` | `projectId` from Step B | Vercel Project Identifier |
| `PROD_API_URL` | `https://nineantra-the-bridge-backend.onrender.com/api` | Backend API URL |
| `CODECOV_TOKEN` | Codecov Repository Token | Coverage upload |

---

## 4. Pipeline Execution Flow

```
Pull Request:
  quality (Lint + Tests + Coverage)
     └─► deploy-preview (Deploys Vercel Preview URL)
            ├─► e2e (Playwright tests against preview URL)
            └─► lighthouse (Audit perf/a11y on preview URL)

Push to Main:
  quality (Lint + Tests + Coverage)
  e2e (Playwright smoke tests)
  lighthouse (Lighthouse CI audit)
     └─► deploy-prod (Deploys Vercel Production ONLY if quality + e2e + lighthouse ALL pass)
```

---

## 5. Local Verification Commands

```bash
# Format check
npm run format:check

# Lint check
npm run lint

# Headless unit tests
npm run test:ci

# Build production
npm run build:prod
```
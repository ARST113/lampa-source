# GitHub Pages Test Stand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, browser-test, and publish Lampa at `/lampa-source/test/` while preserving the existing `gh-pages/plugins/` content.

**Architecture:** Keep the existing branch-backed GitHub Pages deployment. Playwright manages the legacy `npm start` process, verifies the generated `build/web` application in Chromium, and GitHub Actions copies only that successful build into `gh-pages/test/`. A post-deploy SHA marker verifies the real Pages publication.

**Tech Stack:** Node.js 20, existing Gulp/Vitest stack, Playwright Test 1.63.0, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-08-pages-test-stand-design.md`

## Global Constraints

- Do not modify or delete existing `gh-pages/plugins/` paths.
- Do not publish secrets, authentication tokens, user history, or private server configuration.
- Do not deploy a source revision unless Vitest and Playwright succeed.
- Do not run the workflow recursively for `gh-pages` pushes.
- Keep application source behavior unchanged; the first implementation is test/deployment infrastructure only.

---

### Task 1: Browser smoke-test harness

**Files:**
- Modify: `package.json`
- Create: `playwright.config.js`
- Create: `e2e/smoke.spec.js`

**Interfaces:**
- Consumes: existing `npm start` command, BrowserSync at port 3000, generated `build/web/` files.
- Produces: `npm run test:e2e`, `playwright-report/`, and `test-results/`.

- [ ] **Step 1: Add a smoke test that describes the required browser behavior**

```js
const { test, expect } = require('@playwright/test');

test('serves the Lampa shell and core assets', async ({ page, request }) => {
  const response = await page.goto('/');
  expect(response && response.ok()).toBeTruthy();
  await expect(page).toHaveTitle('Lampa');
  await expect(page.locator('#app')).toHaveCount(1);

  const app = await request.get('/app.js');
  expect(app.ok()).toBeTruthy();
  expect((await app.body()).length).toBeGreaterThan(1000);

  const css = await request.get('/css/app.css');
  expect(css.ok()).toBeTruthy();
  expect((await css.body()).length).toBeGreaterThan(1000);
});
```

- [ ] **Step 2: Configure Playwright to start the existing dev build and wait for `app.js`**

```js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:3000/app.js',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

- [ ] **Step 3: Add Playwright 1.63.0 and the E2E script**

```json
"scripts": {
  "start": "gulp",
  "debug": "gulp debug",
  "test": "vitest",
  "test:e2e": "playwright test",
  "doc": "gulp doc"
},
"devDependencies": {
  "@playwright/test": "1.63.0"
}
```

Keep all existing dependencies unchanged.

- [ ] **Step 4: Verify in CI**

Run:

```bash
npm install
npm test -- --run
npx playwright install --with-deps chromium
npm run test:e2e
```

Expected: existing Vitest suite passes and the Playwright smoke test passes in Chromium.

---

### Task 2: Build/test/publish GitHub Actions workflow

**Files:**
- Create: `.github/workflows/lampa-test-stand.yml`

**Interfaces:**
- Consumes: `npm test -- --run`, `npm run test:e2e`, generated `build/web/`, existing remote `gh-pages` branch.
- Produces: updated `gh-pages/test/`, Actions diagnostics artifacts, and the live Pages SHA verification.

- [ ] **Step 1: Create a workflow that tests source branches without reacting to `gh-pages`**

```yaml
on:
  push:
    branches:
      - main
      - 'feat/**'
      - 'fix/**'
      - 'test/**'
  pull_request:
    branches: [main]
  workflow_dispatch:
```

Use Node 20, `npm install`, `npm test -- --run`, `npx playwright install --with-deps chromium`, and `npm run test:e2e`.

- [ ] **Step 2: Upload browser diagnostics even on failures**

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report-${{ github.run_id }}
    path: |
      playwright-report/
      test-results/
    if-no-files-found: ignore
```

- [ ] **Step 3: Publish only successful push/manual builds**

Fetch `gh-pages`, create a worktree for it, remove only `/test`, copy `build/web/` into `/test`, convert the test-only YouTube iframe API URL to HTTPS, write a non-secret `build.json`, commit, and push `gh-pages`.

Core shell logic:

```bash
git fetch origin gh-pages:gh-pages
rm -rf /tmp/lampa-pages
git worktree add /tmp/lampa-pages gh-pages
rm -rf /tmp/lampa-pages/test
mkdir -p /tmp/lampa-pages/test
cp -a build/web/. /tmp/lampa-pages/test/
sed -i 's#http://www.youtube.com/iframe_api#https://www.youtube.com/iframe_api#g' /tmp/lampa-pages/test/index.html
```

The commit must stage only `test/` plus `.nojekyll`, so `plugins/` remains unchanged.

- [ ] **Step 4: Verify the real Pages deployment by source SHA**

Poll:

```text
https://arst113.github.io/lampa-source/test/build.json
```

with a cache-busting query string until its `sha` equals `${GITHUB_SHA}`. Fail after a bounded timeout if Pages continues to serve a stale revision.

- [ ] **Step 5: Verify workflow behavior**

Expected on the feature branch: unit tests pass, Playwright passes, `gh-pages/test/` is updated, `gh-pages/plugins/` remains unchanged, and the post-deploy check sees the new SHA.

---

### Task 3: Review and integration

**Files:**
- Review all changes from `main...feat/pages-test-stand`.

**Interfaces:**
- Consumes: successful Actions run and deployed `/test/build.json`.
- Produces: a pull request into `main` with test evidence.

- [ ] **Step 1: Compare feature branch to `main` and confirm scope**

Expected changed files are limited to the design/plan documentation, `package.json`, Playwright configuration/tests, and the new workflow.

- [ ] **Step 2: Confirm the live test URL**

Open or fetch:

```text
https://arst113.github.io/lampa-source/test/
```

Expected: HTTP 200 and `build.json` points to the tested feature-branch SHA.

- [ ] **Step 3: Open a PR into `main`**

The PR description must include the feature-branch Actions result, live test URL, preservation rule for `plugins/`, and the fact that no application runtime source was changed.

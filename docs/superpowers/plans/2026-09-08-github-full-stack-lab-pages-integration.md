# GitHub Full Stack Lab Pages Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the existing GitHub Pages Lampa test client switch from local stock plugins to a real temporary Lampac Codespace backend and verify Online, parser/JacRed, TMDB proxy, and TorrServer integration in Chromium.

**Architecture:** `test-stand/profile.js` gains two modes. Static mode keeps the current local full profile; backend mode is selected by `?lampac=<absolute-url>`, loads only non-conflicting local UI plugins, then loads Lampac's generated `lampainit.js`, which becomes authoritative for Online, TMDB proxy, parser, and TorrServer configuration. A deterministic local mock backend proves the frontend behavior in normal CI, while a conditional live test exercises a real Codespace when `LAMPA_TEST_LAMPAC_URL` is supplied.

**Tech Stack:** Lampa browser runtime, Playwright 1.63.0, Node.js HTTP test server, GitHub Pages, Lampac generated plugins.

**Spec:** `docs/superpowers/specs/2026-09-08-github-full-stack-lab-design.md`

## Global Constraints

- Static mode must remain compatible with the current full experimental Pages test stand.
- Backend mode accepts only absolute `http:` or `https:` Lampac URLs.
- Backend mode must not auto-load local `./plugins/online.js`, local `./plugins/tmdb_proxy.js`, or local `./plugins/etor.js`.
- Lampac `lampainit.js` is authoritative for Online, TMDB proxy, parser settings, and TorrServer plugin in backend mode.
- Stable `gh-pages/plugins/` remains untouched.
- Live provider failures are categorized separately from backend startup/integration failures.

---

### Task 1: Backend-mode profile contract

**Files:**
- Modify: `test-stand/profile.js`
- Create: `spec/test_profile_backend.spec.js`

**Interfaces:**
- Produces `window.__LAMPA_TEST_PROFILE__` with fields: `enabled`, `version`, `mode`, `backend`, `plugins`, `features`, `lampacInit`.
- Backend mode query parameter: `lampac`.
- Static mode value: `mode: 'static'`; backend mode value: `mode: 'lampac'`.

- [ ] **Step 1: Write failing profile-source tests**

Create `spec/test_profile_backend.spec.js` that loads `test-stand/profile.js` as source and, using a small VM/browser-like harness or extracted pure helper module, verifies:

```text
no lampac parameter -> static mode includes ./plugins/online.js and ./plugins/tmdb_proxy.js
valid https lampac -> backend mode excludes online/tmdb_proxy/etor local plugins
invalid schemes javascript:, data:, file: -> ignored/fallback static
backend trailing slash is normalized away
```

Prefer extracting pure URL/profile construction into `test-stand/profile-config.js` if VM testing would make `profile.js` difficult to understand.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- --run spec/test_profile_backend.spec.js
```

Expected: FAIL because backend mode is absent.

- [ ] **Step 3: Implement pure profile selection**

If extracted, create `test-stand/profile-config.js` exporting CommonJS-compatible helpers for tests while exposing the same helper on `window` in browser build, or keep helpers in `profile.js` if cleanly testable.

Static plugin list remains the current list.

Backend local extras are limited to UI/non-server-owned modules, for example:

```js
const backendPlugins = [
  './plugins/tracks.js',
  './plugins/collections.js',
  './plugins/dlna.js',
  './plugins/view_plugin.js',
  './plugins/twolines.js',
  './plugins/radio.js',
  './plugins/record.js',
  './plugins/nova_skin.js',
];
```

If Lampac itself is configured to provide `tracks` or `dlna`, remove those from the local backend list to prevent duplication; the final list must be based on `.devcontainer/lab.init.conf`.

- [ ] **Step 4: Implement Lampac init loading**

After setting the local plugin storage, load:

```text
<backend>/lampainit.js
```

The loader may append a script element once DOM is available; Lampac's init script already waits until `Lampa` exists and handles both pre-ready and post-ready startup.

Update `window.__LAMPA_TEST_PROFILE__.lampacInit` through states:

```text
pending
loaded
error
```

Do not fail static mode when no backend exists.

- [ ] **Step 5: Preserve and restore managed localStorage**

Extend the existing restore mechanism to all keys the profile itself changes. Do not restore values written later by Lampac while the test page is still active; restoration happens on `pagehide` only.

- [ ] **Step 6: Run GREEN**

Run:

```bash
npm test -- --run spec/test_profile_backend.spec.js
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add test-stand/profile.js test-stand/profile-config.js spec/test_profile_backend.spec.js
git commit -m "feat: add Lampac backend mode to test profile"
```

Omit `profile-config.js` from the commit command if it was not needed.

---

### Task 2: Deterministic mock Lampac browser test

**Files:**
- Create: `e2e/backend-profile.e2e.js`
- Modify: `playwright.config.js` only if timeout/test matching needs adjustment.

**Interfaces:**
- Local mock backend: `http://127.0.0.1:9120`.
- Mock routes: `/lampainit.js`, `/online.js`, `/tmdbproxy.js`, `/ts.js`, `/reqinfo`, parser endpoint.

- [ ] **Step 1: Write the failing Playwright test before frontend implementation is considered complete**

Start an HTTP server in `test.beforeAll`. `/lampainit.js` returns JavaScript that waits for `window.Lampa`, then:

```js
Lampa.Storage.set('parser_use', 'true');
Lampa.Storage.set('jackett_url', '127.0.0.1:9120');
Lampa.Storage.set('parser_torrent_type', 'jackett');
Lampa.Plugins.add({ url: 'http://127.0.0.1:9120/online.js', status: 1 });
Lampa.Plugins.add({ url: 'http://127.0.0.1:9120/tmdbproxy.js', status: 1 });
Lampa.Plugins.add({ url: 'http://127.0.0.1:9120/ts.js', status: 1 });
window.__MOCK_LAMPAC_INIT__ = true;
```

Each generated plugin route sets a unique marker; `ts.js` sets `torrserver_url` to `127.0.0.1:9120/ts`.

- [ ] **Step 2: Open Lampa in backend mode**

Use:

```js
await page.goto('/?lampac=' + encodeURIComponent('http://127.0.0.1:9120'));
```

Load `test-stand/profile.js` with `addInitScript` in local E2E exactly as the Pages publish path does.

- [ ] **Step 3: Assert backend ownership**

After `window.appready` and Lampac markers:

```text
profile.mode == lampac
profile.backend == http://127.0.0.1:9120
profile.plugins does not contain ./plugins/online.js
profile.plugins does not contain ./plugins/tmdb_proxy.js
profile.plugins does not contain ./plugins/etor.js
mock Lampac init marker == true
mock backend Online marker == true
parser_use == true
jackett_url contains 127.0.0.1:9120
torrserver_url contains 127.0.0.1:9120/ts
pageerror == []
```

- [ ] **Step 4: Verify RED against pre-backend profile if not already done**

Run:

```bash
npx playwright test e2e/backend-profile.e2e.js
```

Expected before Task 1 implementation: FAIL because stock Online remains loaded/backend init is not executed.

- [ ] **Step 5: Make any minimal Task 1 adjustments needed and rerun GREEN**

Run the same command. Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add e2e/backend-profile.e2e.js test-stand/profile.js playwright.config.js
git commit -m "test: cover Lampac-backed Lampa profile"
```

---

### Task 3: Live Lampac backend E2E suite

**Files:**
- Create: `e2e/backend-live.e2e.js`
- Modify: `package.json`

**Interfaces:**
- Environment: `LAMPA_TEST_LAMPAC_URL`.
- NPM script: `test:e2e:backend`.

- [ ] **Step 1: Add a conditional live test**

At module load:

```js
const backend = process.env.LAMPA_TEST_LAMPAC_URL;
test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is not configured');
```

- [ ] **Step 2: Validate real server endpoints before opening the browser**

Using Playwright request context, require successful JavaScript responses from:

```text
/lampainit.js
/online.js
/ts.js
```

POST `{"action":"get"}` to `/ts/settings` and require HTTP success plus parseable TorrServer settings.

Query the JacRed-compatible parser endpoint with a deterministic title; HTTP/JSON health is mandatory, nonempty search results are not mandatory.

- [ ] **Step 3: Validate the browser integration**

Open:

```text
/?lampac=<encoded backend>
```

Wait for `appready`, `profile.lampacInit == 'loaded'`, and for Lampac's plugin list to contain URLs owned by the backend.

Assert:

```text
stock local Online absent from active profile
stock local TMDB proxy absent from active profile
Lampac Online URL present in Lampa.Plugins.get()
parser_use == true
jackett_url points to backend host
Lampa.Torserver.url() points through backend /ts
Lampa.TMDB.api('movie/550') uses backend proxy when tmdbProxy is enabled
pageerror == [] during startup
```

- [ ] **Step 4: Add package script**

Add:

```json
"test:e2e:backend": "playwright test e2e/backend-live.e2e.js"
```

- [ ] **Step 5: Verify skipped behavior without backend**

Run:

```bash
npm run test:e2e:backend
```

Expected: test is SKIPPED, command exits successfully.

- [ ] **Step 6: Commit Task 3**

```bash
git add e2e/backend-live.e2e.js package.json
git commit -m "test: add live Lampac backend integration suite"
```

---

### Task 4: Connect live backend tests to Codespace control

**Files:**
- Modify: `.devcontainer/smoke-lab.sh`
- Create: `.devcontainer/full-lab.sh`
- Modify: `scripts/lab/codespace_control.py`
- Modify: `.github/workflows/lab-control.yml`

**Interfaces:**
- `smoke` -> direct Lampac/TorrServer/parser endpoint checks.
- `full` -> server smoke plus browser backend test.

- [ ] **Step 1: Add `full-lab.sh`**

The Codespace script derives its external backend URL from `CODESPACE_NAME` when available or accepts `LAMPA_TEST_LAMPAC_URL` explicitly.

It runs:

```bash
.devcontainer/smoke-lab.sh
LAMPA_TEST_LAMPAC_URL="$backend" scripts/lab/run-with-heartbeat.sh npm run test:e2e:backend
```

If running inside the Codespace cannot access its own public URL reliably, use the local Lampac URL for direct server smoke and execute browser live E2E from the Actions runner after `codespace_control.py` has made port 9118 public. The implementation must choose one path and document it; do not keep two flaky paths.

- [ ] **Step 2: Make controller `full` run the live E2E in the reliable location**

Recommended first implementation: Actions runner runs `npm install`, Playwright Chromium, then `LAMPA_TEST_LAMPAC_URL=<public URL> npm run test:e2e:backend`; Codespace remote execution is used for server-side smoke/log collection. This tests the exact same public HTTPS route used by Pages.

- [ ] **Step 3: Upload backend Playwright diagnostics on failure**

In `lab-control.yml`, for `full`, upload `playwright-report/` and `test-results/` with `actions/upload-artifact@v7` and retention 14 days.

- [ ] **Step 4: Verify no backend test runs during normal static CI unless explicitly requested**

Existing `npm run test:e2e` still includes deterministic local tests only. Real Codespace tests require the control workflow or explicit `LAMPA_TEST_LAMPAC_URL`.

- [ ] **Step 5: Commit Task 4**

```bash
git add .devcontainer/full-lab.sh .devcontainer/smoke-lab.sh scripts/lab/codespace_control.py .github/workflows/lab-control.yml
git commit -m "ci: wire Codespace backend into full browser tests"
```

---

### Task 5: Pages publication regression and documentation

**Files:**
- Modify: `.github/workflows/lampa-test-stand.yml`
- Modify: `docs/superpowers/specs/2026-09-08-github-full-stack-lab-design.md` only for implementation-confirmed details.

**Interfaces:**
- Published test URL stays `https://arst113.github.io/lampa-source/test/`.
- Backend URL shape: `https://arst113.github.io/lampa-source/test/?lampac=<encoded-url>`.

- [ ] **Step 1: Extend post-deploy verification**

After Pages publishes, verify `test-profile.js` contains the backend-mode marker/string (`mode`/`lampac`) while preserving the existing SHA check.

- [ ] **Step 2: Run complete static verification**

Run:

```bash
npm test -- --run
npm run test:e2e
```

Expected: all prior tests plus backend mock test PASS.

- [ ] **Step 3: Verify stable plugin tree preservation**

After feature-branch Pages publication, fetch `gh-pages/plugins` and confirm its tree SHA remains unchanged from the pre-lab value unless an unrelated legitimate plugin publication occurred. The workflow itself must still `git add .nojekyll test` only.

- [ ] **Step 4: Verify real backend manually after control workflow becomes operational**

Run `/lab ensure`, read the generated public backend URL, then `/lab full`. Expected: Lampac server health, embedded TorrServer proxy, parser health, and live browser backend E2E PASS.

- [ ] **Step 5: Commit final documentation correction if needed**

```bash
git add .github/workflows/lampa-test-stand.yml docs/superpowers/specs/2026-09-08-github-full-stack-lab-design.md
git commit -m "docs: finalize GitHub full-stack lab integration"
```

Skip documentation commit if nothing changed.

# GitHub Pages Test Stand Design

## Goal

Create a reproducible browser test stand for Lampa in `ARST113/lampa-source` that can be inspected and diagnosed from GitHub Actions while preserving the existing public plugin URLs served from the `gh-pages` branch.

## Current state

- Application source is developed on `main` and feature branches.
- `npm start` runs the existing Gulp watcher plus BrowserSync on port 3000.
- `build/` and `dest/` are generated and ignored by Git.
- GitHub Pages currently publishes the `gh-pages` branch.
- The current `gh-pages` branch contains the stable `plugins/` tree. Those paths must not be removed or rewritten by test-stand deployment.

## Architecture

The existing Pages publishing model remains in place: `gh-pages` stays the publication branch. A GitHub Actions workflow builds and tests a source branch, then updates only `gh-pages/test/`. Everything else already present on `gh-pages`, especially `plugins/`, is retained byte-for-byte by the deployment procedure.

The workflow uses the existing development build path rather than refactoring the legacy Gulp pipeline. Playwright starts `npm start` as its managed web server and waits until `http://127.0.0.1:3000/app.js` becomes available. This gives CI a finite lifecycle without changing the behavior of the application's production source. The generated `build/web/` directory is then copied into `gh-pages/test/`.

## Test layers

1. Existing Vitest specs run first and remain the unit/regression gate.
2. Playwright runs a browser smoke test against the generated Lampa web build. The first test verifies the HTML shell and the core JavaScript/CSS assets. More Lampa-specific scenarios can be added under `e2e/` later without changing deployment architecture.
3. After publishing, the workflow checks a generated `build.json` on the real GitHub Pages URL and confirms that its commit SHA matches the source commit. This proves that the requested build reached Pages rather than merely passing locally inside Actions.

## Published layout

```text
https://arst113.github.io/lampa-source/
├── plugins/        existing stable plugin files, preserved
└── test/           latest successfully tested Lampa build
    ├── index.html
    ├── app.js
    ├── css/
    ├── vender/
    └── build.json  branch/SHA metadata for diagnostics
```

The test `index.html` changes the YouTube iframe API URL from HTTP to HTTPS during staging so GitHub Pages does not introduce mixed-content blocking for that resource. Source `public/index.html` is not changed by this test-stand setup.

## Workflow triggers

- Pushes to `main`, `feat/**`, `fix/**`, and `test/**`: run unit tests, browser smoke tests, and publish the successful build to `/test/`.
- Pull requests targeting `main`: run tests but do not write to `gh-pages`.
- Manual `workflow_dispatch`: run the same build/test/publish path.
- Pushes to `gh-pages` are excluded, preventing a deployment loop.

A concurrency group serializes test-stand publication so two branches cannot write `gh-pages/test/` simultaneously.

## Diagnostics

Playwright uses HTML and line reporters. On every CI run the workflow uploads `playwright-report/` and `test-results/` as Actions artifacts; screenshots, traces, and videos are retained on failures. GitHub Actions job logs remain the primary machine-readable source for diagnosis from chat.

`build.json` contains only non-secret build metadata (`repository`, `ref`, `sha`, `run_id`, UTC timestamp). No credentials, user history, Lampac tokens, or private server configuration are committed or published.

## Failure behavior

- Unit test failure stops the workflow before browser testing and deployment.
- Browser/build failure stops deployment and uploads Playwright diagnostics.
- A failed `gh-pages` push fails the deployment job without deleting the previous working `/test/` version.
- A post-deploy SHA mismatch fails the workflow, making a stale or failed Pages publication visible.

## Success criteria

- Existing `gh-pages/plugins/` remains intact after deployment.
- `https://arst113.github.io/lampa-source/test/` serves the tested web build.
- The Pages `test/build.json` SHA matches the source commit of the successful workflow run.
- Existing Vitest tests pass.
- Playwright can load the test build in Chromium and receive HTTP 200 for the application shell and core assets.
- A failed test cannot publish a new `/test/` build.

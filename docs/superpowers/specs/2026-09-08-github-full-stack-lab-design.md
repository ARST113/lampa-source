# GitHub Full Stack Lab Design

## Goal

Create an experimental full-stack Lampa/Lampac test environment that runs as much of the real stack as possible on GitHub infrastructure and can be exercised from ChatGPT through GitHub Actions/Codespaces.

The target flow is:

```text
GitHub Pages Lampa test client
        |
        | HTTPS
        v
GitHub Codespace public port 9118
        |
        v
Lampac NextGen
  |-- lampainit.js
  |-- Lampac Online
  |-- TMDB Proxy
  |-- JacRed/parser endpoint
  |-- TorrServer Lampa plugin (ts.js)
  `-- /ts/* proxy
          |
          v
      embedded TorrServer process
```

The environment is explicitly a development/test lab, not production hosting.

## Key architectural decision: one public backend port

The initial idea was to run Lampac and TorrServer as separate public services. Source inspection shows that this is unnecessary for the experiment.

Lampac's TorrServer module downloads the appropriate TorrServer binary, launches it locally, protects the internal instance with generated credentials, and exposes it to Lampa through Lampac routes such as `/ts/*` and the generated `/ts.js` plugin.

Therefore:

- only Lampac port `9118` needs to be forwarded publicly from the Codespace;
- TorrServer remains internal to the Lampac runtime;
- Lampa talks to TorrServer through Lampac's generated plugin and `/ts/*` proxy;
- this avoids a second public Codespaces endpoint and reduces mixed-content/CORS complexity.

Direct public exposure of port 8090 is out of scope for the first implementation.

## Repository and branch model

The lab lives in `ARST113/lampa-source` because the existing Pages test stand is already implemented there.

Implementation branch:

```text
feat/github-full-stack-lab
```

This branch is based on:

```text
feat/pages-test-stand
```

The current stable plugin distribution on `gh-pages/plugins/` must remain untouched.

The lab must only change the test client under `gh-pages/test/` and add Codespaces/devcontainer support to the source branch.

## Codespace runtime

The Codespace is created from `ARST113/lampa-source` and uses a Dev Container with Docker-in-Docker support.

The Dev Container will contain:

- Git/GitHub CLI;
- Docker daemon and Docker Compose;
- basic CLI tools (`curl`, `jq`, `bash`);
- no locally built Lampac runtime unless needed for debugging.

The first implementation should prefer the existing published Lampac image:

```text
ghcr.io/lampac-nextgen/lampac
```

This keeps startup fast and validates the same distribution users normally run.

The Codespace forwards port `9118` and labels it `Lampac Full Stack Lab`.

GitHub Codespaces remote port forwarding terminates at a URL of the form:

```text
https://<codespace-name>-9118.app.github.dev
```

The backend process itself may continue listening as plain HTTP on port 9118 inside the Codespace; the Codespaces proxy provides the external HTTPS URL.

For the Pages client to call the backend without GitHub authentication, port 9118 must be public for the duration of the test session. The startup helper must print the exact command/instruction needed to make the port public and clearly identify the resulting backend URL.

## Lampac test configuration

Use a lab-specific `init.conf` committed in the source repository. It must not contain passwords, private API keys, personal account information, or production server addresses.

The test configuration should start from the repository's low-memory/base configuration and enable only the modules required for this experiment.

Required LampaWeb init plugins:

```text
jacred      = true
tmdbProxy   = true
online      = true
torrserver  = true
```

Useful additions that can stay enabled if they do not introduce external secrets:

```text
dlna
tracks
timecode
```

The lab configuration must keep access DB and WAF disabled unless a test specifically needs them.

Lampac's generated `lampainit.js` must be the authority for configuring the test Lampa once a backend is supplied. We must not independently duplicate Lampac's plugin list in the Pages profile in backend mode.

## Pages client backend selection

The existing static experimental profile remains usable when no Lampac backend is supplied.

Add a backend mode selected through the URL, for example:

```text
https://arst113.github.io/lampa-source/test/?lampac=https%3A%2F%2F<CODESPACE>-9118.app.github.dev
```

The test bootstrap must:

1. parse and validate the `lampac` query parameter;
2. accept only `http:` or `https:` absolute URLs;
3. normalize the trailing slash;
4. record the selected backend in `window.__LAMPA_TEST_PROFILE__`;
5. load the backend's generated `lampainit.js` before normal user interaction;
6. stop auto-loading the local `./plugins/online.js` and local `./plugins/tmdb_proxy.js` when backend mode is active;
7. allow Lampac's own init script to register its real Online, TMDB Proxy, parser settings and TorrServer plugin.

The static profile remains the fallback for offline/UI-only work.

## Real Online

In backend mode, Online must come from Lampac:

```text
<LAMPAC>/online.js
```

or from the tokenized URL generated by Lampac.

The local Lampa source plugin:

```text
./plugins/online.js
```

must not be active in backend mode.

Success means the Lampa plugin list and UI identify the Lampac Online component, and its network requests go to the selected Codespace Lampac backend.

Individual upstream video providers may still fail because of provider availability, anti-bot protection, geographic restrictions, or required credentials. These failures must be reported as provider/integration failures rather than treated as failure to start the lab itself.

## Parser / JacRed

Lampac's `lampainit.js` enables the Lampa parser and sets the Jackett-compatible parser host.

When `LampaWeb.initPlugins.jacred` is enabled, Lampac substitutes its own host as the parser endpoint. The test should therefore exercise the real JacRed-compatible API through the Codespace backend rather than `jac.red` directly.

Minimum parser acceptance test:

```text
Lampa parser enabled
        |
        v
Codespace Lampac/JacRed-compatible endpoint
        |
        v
valid HTTP response for a deterministic test query
```

A zero-result response is acceptable for a query only when the endpoint itself is healthy and the test explicitly distinguishes "no results" from transport/server failure.

## TorrServer

Lampac's TorrServer module is used as shipped.

Expected lifecycle:

1. Lampac starts.
2. TorrServer module initializes.
3. If the local TorrServer binary is absent, the module downloads the appropriate Linux binary.
4. Lampac launches TorrServer on its configured internal port.
5. Lampac exposes the client plugin through `ts.js`.
6. Lampac proxies TorrServer API through `/ts/*`.

Minimum acceptance tests:

- `GET <LAMPAC>/ts.js` returns JavaScript;
- a TorrServer settings request through `<LAMPAC>/ts/settings` succeeds using the method expected by the proxy;
- Lampa's TorServer URL after loading Lampac's generated plugin points at the Lampac/Codespace route rather than an unrelated local machine address;
- no raw internal Codespace/container IP is required in the browser.

Actual torrent peer transfer/long streaming is not a required CI test. A later opt-in test may add a small public magnet and verify add/list/files/stream URL generation.

## Startup automation

Add helper scripts under a dedicated lab directory, for example:

```text
.devcontainer/devcontainer.json
.devcontainer/lab.compose.yml
.devcontainer/start-lab.sh
.devcontainer/stop-lab.sh
.devcontainer/status-lab.sh
.devcontainer/lab.init.conf
```

The Compose file should initially contain one Lampac service using the published image. TorrServer is provided by Lampac's TorrServer module, not by a second Compose service.

`start-lab.sh` must be idempotent and should:

- start/recreate the Lampac lab container;
- wait until port 9118 answers;
- verify `/version` or another simple Lampac health endpoint;
- verify `lampainit.js`;
- verify `online.js`;
- verify `ts.js`;
- print the local Codespace URL and instructions for making port 9118 public;
- print the Pages URL with an encoded `lampac=` parameter when the public Codespace host can be derived.

`status-lab.sh` should provide a compact diagnostic snapshot suitable for copying into chat or CI logs.

## Testing layers

### Layer 1: static regression

Keep the existing suite:

```text
Vitest
Playwright smoke test
static full-profile test
```

### Layer 2: backend-aware browser test

Add a Playwright suite that can run when `LAMPA_TEST_LAMPAC_URL` is supplied.

It should verify:

- the backend is reachable;
- the Pages/bootstrap backend mode is selected;
- the local stock Online plugin is not the active Online implementation;
- Lampac `lampainit.js` has run;
- real Lampac Online has been loaded;
- TMDB requests are routed through Lampac proxy when configured;
- parser is enabled and points to the Lampac/JacRed backend;
- the TorrServer plugin/client points to the Lampac `/ts` route;
- browser `pageerror` remains empty for startup/navigation scenarios.

### Layer 3: Codespace smoke script

Run from inside Codespace and validate server endpoints directly with curl. This remains useful even when the Codespace port is private.

### Layer 4: optional provider tests

Provider-specific Online tests are opt-in and non-blocking at first. They should be categorized by provider so a single external outage does not mark the entire lab as broken.

## Diagnostics

Codespace server diagnostics should include:

- `docker ps`;
- Lampac container health/recent logs;
- HTTP status for `/version`, `/lampainit.js`, `/online.js`, `/ts.js`;
- parser health request;
- TorrServer proxy health request.

Browser diagnostics should continue using Playwright artifacts:

- HTML report;
- trace on failure;
- screenshot on failure;
- video on failure;
- console/page errors;
- failed request URLs and status codes, with credentials/query secrets redacted.

## Security and isolation

- Never commit production passwords, account emails, access DB secrets, provider tokens, proxy credentials or private server URLs.
- Codespaces secrets may be used later for opt-in provider tests.
- Public port 9118 is temporary and intended only for the running test session.
- The lab configuration should disable administrative interfaces not needed for testing.
- Do not expose the embedded TorrServer port directly in the first version.
- Do not publish Playwright traces to GitHub Pages; keep them as Actions artifacts.
- The production/stable `gh-pages/plugins/` tree must remain unchanged.

## Failure semantics

The lab should distinguish these states:

1. **Lab startup failure** — Lampac container or required core endpoint did not start.
2. **Lampac integration failure** — generated plugins/init do not configure Lampa correctly.
3. **Parser failure** — JacRed-compatible route is unhealthy or malformed.
4. **TorrServer failure** — embedded process or `/ts` proxy is unhealthy.
5. **Provider failure** — one Online provider is blocked/down/changed while the core lab remains healthy.
6. **Playback failure** — source resolved but Lampa player/browser cannot play it.

This distinction is required so external provider instability does not hide regressions in Lampac itself.

## Success criteria for the first implementation

The first full-stack lab is considered successful when all of the following are true:

- a Codespace created from the branch can start the lab with one command;
- Lampac answers on port 9118;
- `lampainit.js`, `online.js` and `ts.js` are served by the real Lampac process;
- the embedded TorrServer process is reachable through Lampac `/ts/*` proxy;
- the JacRed/parser endpoint is healthy;
- the existing Pages Lampa can be opened with `?lampac=<codespace-url>`;
- backend mode stops using the stock Lampa Online plugin and instead loads Lampac Online;
- backend-aware Playwright smoke tests can verify the integration;
- the normal static Pages test mode continues to work;
- existing `gh-pages/plugins/` content is unchanged.

## Explicit non-goals for the first implementation

- production hosting on Codespaces;
- keeping the Codespace alive continuously;
- long-duration torrent streaming;
- exposing raw TorrServer 8090 publicly;
- testing every Online provider;
- storing user accounts or production credentials;
- replacing the user's real Lampac server.

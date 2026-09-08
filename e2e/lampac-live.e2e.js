const { test, expect } = require('@playwright/test');

const backend = (process.env.LAMPA_TEST_LAMPAC_URL || '').replace(/\/+$/, '');
const pages = (process.env.LAMPA_TEST_PAGES_URL || 'https://arst113.github.io/lampa-source/test/').replace(/\/+$/, '/');

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required for the live Lampac suite');

test('real Codespace Lampac owns Online, TMDB, parser and TorrServer', async ({ page, request }) => {
  const pageErrors = [];
  const consoleErrors = [];
  const requestFailures = [];
  const failedBackendResponses = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleErrors.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    requestFailures.push(`${request.url()} :: ${(request.failure() || {}).errorText || 'failed'}`);
  });
  page.on('response', (response) => {
    if (response.url().startsWith(backend) && response.status() >= 400) {
      failedBackendResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const path of ['/version?type=hash', '/lampainit.js', '/online.js', '/tmdbproxy.js', '/ts.js']) {
    const response = await request.get(backend + path, { timeout: 30_000 });
    expect(response.ok(), `${path} returned HTTP ${response.status()}`).toBeTruthy();
    expect((await response.body()).length, `${path} should not be empty`).toBeGreaterThan(10);
  }

  const tsSettings = await request.post(backend + '/ts/settings', {
    data: { action: 'get' },
    timeout: 60_000,
  });
  expect(tsSettings.ok(), `/ts/settings returned HTTP ${tsSettings.status()}`).toBeTruthy();
  const tsJson = await tsSettings.json();
  expect(tsJson).toHaveProperty('CacheSize');

  const parser = await request.get(
    backend + '/api/v2.0/indexers/all/results?query=' + encodeURIComponent('Matrix'),
    { timeout: 60_000 },
  );
  expect(parser.ok(), `parser returned HTTP ${parser.status()}`).toBeTruthy();
  const parserText = await parser.text();
  expect(() => JSON.parse(parserText)).not.toThrow();

  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('language', 'ru');
    localStorage.setItem('tmdb_lang', 'ru');
  });

  const target = pages + '?lampac=' + encodeURIComponent(backend);
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  expect(response && response.ok(), `Pages returned ${response && response.status()}`).toBeTruthy();

  await page.waitForTimeout(5_000);
  const startupDiagnostic = await page.evaluate(() => ({
    readyState: document.readyState,
    appready: window.appready,
    preparedApp: window.prepared_app,
    firstLoad: window.fitst_load,
    appTimeLaunch: window.app_time_launch,
    hasLampa: typeof window.Lampa !== 'undefined',
    profile: window.__LAMPA_TEST_PROFILE__ ? {
      mode: window.__LAMPA_TEST_PROFILE__.mode,
      backend: window.__LAMPA_TEST_PROFILE__.backend,
      lampacInit: window.__LAMPA_TEST_PROFILE__.lampacInit,
    } : null,
    loadingStatus: document.querySelector('.lp-status') ? document.querySelector('.lp-status').textContent : null,
    loadingStep: document.querySelector('.lp-step') ? document.querySelector('.lp-step').textContent : null,
    scripts: Array.from(document.scripts).map((script) => script.src || '<inline>'),
  }));
  console.log('[live startup diagnostic]', JSON.stringify({
    startupDiagnostic,
    pageErrors,
    consoleErrors,
    requestFailures,
  }, null, 2));

  await page.waitForFunction(() => window.appready === true, null, { timeout: 60_000 });
  await page.waitForFunction(() => (
    window.__LAMPA_TEST_PROFILE__ &&
    window.__LAMPA_TEST_PROFILE__.mode === 'lampac' &&
    window.__LAMPA_TEST_PROFILE__.lampacInit === 'loaded'
  ), null, { timeout: 45_000 });

  await page.waitForFunction((backendUrl) => {
    if (!window.Lampa || !Lampa.Plugins) return false;
    const installed = Lampa.Plugins.get();
    return installed.some((plugin) => plugin.url.indexOf(backendUrl + '/online') === 0) &&
      installed.some((plugin) => plugin.url.indexOf(backendUrl + '/tmdbproxy') === 0) &&
      installed.some((plugin) => plugin.url.indexOf(backendUrl + '/ts') === 0);
  }, backend, { timeout: 45_000 });

  const state = await page.evaluate((backendUrl) => {
    Lampa.Storage.set('proxy_tmdb', 'true');
    const installed = Lampa.Plugins.get().map((plugin) => plugin.url);
    const backendHost = new URL(backendUrl).host;

    return {
      profile: window.__LAMPA_TEST_PROFILE__,
      installed,
      loaded: Lampa.Plugins.loaded(),
      parserUse: Lampa.Storage.get('parser_use'),
      parserUrl: String(Lampa.Storage.get('jackett_url') || ''),
      parserType: Lampa.Storage.get('parser_torrent_type'),
      torserverUrl: String(Lampa.Storage.get('torrserver_url') || ''),
      tmdbUrl: Lampa.TMDB.api('movie/550'),
      backendHost,
    };
  }, backend);

  expect(state.profile.backend).toBe(backend);
  expect(state.loaded).not.toContain('./plugins/online.js');
  expect(state.installed.some((url) => url.indexOf(backend + '/online') === 0)).toBeTruthy();
  expect(state.installed.some((url) => url.indexOf(backend + '/tmdbproxy') === 0)).toBeTruthy();
  expect(state.installed.some((url) => url.indexOf(backend + '/ts') === 0)).toBeTruthy();

  expect(state.parserUse).toBe(true);
  expect(state.parserType).toBe('jackett');
  expect(state.parserUrl).toContain(state.backendHost);
  expect(state.torserverUrl).toContain(state.backendHost + '/ts');
  expect(state.tmdbUrl).toContain(backend + '/tmdb/api/3/movie/550');

  expect(pageErrors, 'live backend startup should not throw uncaught JS errors').toEqual([]);
  expect(
    failedBackendResponses.filter((line) => !line.includes('/favicon')),
    'core Lampac backend requests should not fail',
  ).toEqual([]);
});

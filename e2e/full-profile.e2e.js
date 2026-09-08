const http = require('http');
const path = require('path');
const { test, expect } = require('@playwright/test');

const expectedPlugins = [
  './plugins/tmdb_proxy.js',
  './plugins/etor.js',
  './plugins/online.js',
  './plugins/tracks.js',
  './plugins/collections.js',
  './plugins/dlna.js',
  './plugins/view_plugin.js',
  './plugins/twolines.js',
  './plugins/radio.js',
  './plugins/record.js',
  './plugins/nova_skin.js',
];

let torserverStub;

test.beforeAll(async () => {
  torserverStub = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/settings') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ CacheSize: 2147483648, ReaderReadAHead: 95 }));
      return;
    }

    if (req.url === '/torrents') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('TorServer test endpoint');
  });

  await new Promise((resolve, reject) => {
    torserverStub.once('error', reject);
    torserverStub.listen(8090, '127.0.0.1', resolve);
  });
});

test.afterAll(async () => {
  if (!torserverStub) return;
  await new Promise((resolve) => torserverStub.close(resolve));
});

test('loads the full experimental plugin profile and TorServer client', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.addInitScript({ path: path.resolve('test-stand/profile.js') });
  await page.addInitScript(() => {
    localStorage.setItem('language', 'ru');
    localStorage.setItem('tmdb_lang', 'ru');
    localStorage.setItem('torrserver_url', 'http://127.0.0.1:8090');
  });

  await page.goto('/');

  await page.waitForFunction(() => window.appready === true, null, { timeout: 45_000 });

  const state = await page.evaluate(() => ({
    profile: window.__LAMPA_TEST_PROFILE__,
    plugins: window.Lampa && Lampa.Plugins ? Lampa.Plugins.loaded() : [],
    tmdbUrl: window.Lampa && Lampa.TMDB ? Lampa.TMDB.api('movie/550') : '',
    torserverUrl: window.Lampa && Lampa.Torserver ? Lampa.Torserver.url() : '',
  }));

  expect(state.profile && state.profile.enabled).toBeTruthy();
  expect(state.profile.plugins).toEqual(expectedPlugins);
  expect(state.profile.features.torrents).toBeTruthy();
  expect(state.profile.features.torserverClient).toBeTruthy();

  for (const plugin of expectedPlugins) {
    expect(state.plugins, `${plugin} should be loaded`).toContain(plugin);
  }

  expect(state.tmdbUrl).toContain('apitmdb.');
  expect(state.torserverUrl).toContain('127.0.0.1:8090');

  const torserver = await page.evaluate(() => new Promise((resolve) => {
    Lampa.Torserver.connected(
      (settings) => resolve({ ok: true, settings }),
      (error) => resolve({ ok: false, error: String(error) }),
    );
  }));

  expect(torserver.ok, torserver.error || 'TorServer client should connect').toBeTruthy();
  expect(torserver.settings.CacheSize).toBe(2147483648);
  expect(pageErrors, 'plugins should not throw uncaught runtime errors').toEqual([]);
});

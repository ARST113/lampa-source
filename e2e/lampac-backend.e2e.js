const http = require('http');
const path = require('path');
const { test, expect } = require('@playwright/test');

const port = 9120;
const backend = `http://127.0.0.1:${port}`;
let server;
let requestedPaths;

function javascript(res, body) {
  res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
  res.end(body);
}

test.beforeAll(async () => {
  requestedPaths = [];
  server = http.createServer((req, res) => {
    requestedPaths.push(req.url.split('?')[0]);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url.startsWith('/lampainit.js')) {
      javascript(res, `
        (function () {
          window.__MOCK_LAMPAC_INIT__ = true;
          window.lampa_settings = window.lampa_settings || {};
          window.lampa_settings.torrents_use = true;
          window.lampa_settings.read_only = false;

          function start() {
            Lampa.Storage.set('parser_use', 'true');
            Lampa.Storage.set('jackett_url', '127.0.0.1:${port}');
            Lampa.Storage.set('jackett_key', '1');
            Lampa.Storage.set('parser_torrent_type', 'jackett');

            var plugins = [
              { url: '${backend}/online.js', status: 1, name: 'Lampac Online', author: 'lampac' },
              { url: '${backend}/tmdbproxy.js', status: 1, name: 'TMDB Proxy', author: 'lampac' },
              { url: '${backend}/ts.js', status: 1, name: 'TorrServer', author: 'lampac' }
            ];

            var installed = Lampa.Plugins.get();
            var urls = [];
            plugins.forEach(function (plugin) {
              if (!installed.some(function (item) { return item.url === plugin.url; })) {
                Lampa.Plugins.add(plugin);
                urls.push(plugin.url);
              }
            });
            Lampa.Plugins.save();

            if (urls.length) {
              Lampa.Utils.putScript(urls, function () {}, function () {}, function () {}, true);
            }
          }

          if (window.Lampa) start();
          else {
            var timer = setInterval(function () {
              if (window.Lampa) {
                clearInterval(timer);
                start();
              }
            }, 25);
          }
        })();
      `);
      return;
    }

    if (req.url.startsWith('/online.js')) {
      javascript(res, `window.__MOCK_LAMPAC_ONLINE__ = true;`);
      return;
    }

    if (req.url.startsWith('/tmdbproxy.js')) {
      javascript(res, `
        window.__MOCK_LAMPAC_TMDB__ = true;
        Lampa.TMDB.api = function (url) { return '${backend}/tmdb/' + url; };
      `);
      return;
    }

    if (req.url.startsWith('/ts.js')) {
      javascript(res, `
        window.__MOCK_LAMPAC_TS__ = true;
        Lampa.Storage.set('torrserver_url', '127.0.0.1:${port}/ts');
      `);
      return;
    }

    if (req.url.startsWith('/api/v2.0/indexers/all/results')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ Results: [] }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
});

test.afterAll(async () => {
  if (!server) return;
  await new Promise((resolve) => server.close(resolve));
});

test('backend mode delegates Online, TMDB, parser and TorrServer to Lampac', async ({ page, request }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.setItem('language', 'ru');
    localStorage.setItem('tmdb_lang', 'ru');
  });

  await page.goto(`/?lampac=${encodeURIComponent(backend)}`);
  await page.waitForFunction(() => window.appready === true, null, { timeout: 45_000 });

  await page.addScriptTag({ path: path.resolve('test-stand/profile.js') });

  await page.waitForFunction(() => (
    window.__MOCK_LAMPAC_INIT__ === true &&
    window.__MOCK_LAMPAC_ONLINE__ === true &&
    window.__MOCK_LAMPAC_TMDB__ === true &&
    window.__MOCK_LAMPAC_TS__ === true
  ), null, { timeout: 15_000 });

  const state = await page.evaluate(() => ({
    profile: window.__LAMPA_TEST_PROFILE__,
    installed: Lampa.Plugins.get().map((plugin) => plugin.url),
    loaded: Lampa.Plugins.loaded(),
    parserUse: Lampa.Storage.get('parser_use'),
    parserUrl: Lampa.Storage.get('jackett_url'),
    parserType: Lampa.Storage.get('parser_torrent_type'),
    torserverUrl: Lampa.Storage.get('torrserver_url'),
    tmdbUrl: Lampa.TMDB.api('movie/550'),
  }));

  expect(state.profile.mode).toBe('lampac');
  expect(state.profile.backend).toBe(backend);
  expect(state.profile.lampacInit).toBe('loaded');

  expect(state.loaded).not.toContain('./plugins/online.js');
  expect(state.installed).toContain(`${backend}/online.js`);
  expect(state.installed).toContain(`${backend}/tmdbproxy.js`);
  expect(state.installed).toContain(`${backend}/ts.js`);

  expect(state.parserUse).toBe(true);
  expect(state.parserUrl).toBe(`127.0.0.1:${port}`);
  expect(state.parserType).toBe('jackett');
  expect(state.torserverUrl).toContain(`127.0.0.1:${port}/ts`);
  expect(state.tmdbUrl).toBe(`${backend}/tmdb/movie/550`);

  const parser = await request.get(`${backend}/api/v2.0/indexers/all/results?query=Matrix`);
  expect(parser.ok()).toBeTruthy();
  expect(await parser.json()).toEqual({ Results: [] });

  for (const expectedPath of ['/lampainit.js', '/online.js', '/tmdbproxy.js', '/ts.js']) {
    expect(requestedPaths, `${expectedPath} should be requested from Lampac`).toContain(expectedPath);
  }

  expect(pageErrors, 'backend bootstrap should not throw uncaught runtime errors').toEqual([]);
});

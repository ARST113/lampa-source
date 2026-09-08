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

test('loads the full experimental plugin profile and TorServer client', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'ru');
    localStorage.setItem('tmdb_lang', 'ru');
    localStorage.setItem('torrserver_url', 'http://127.0.0.1:8090');
  });

  await page.goto('/');

  await page.waitForFunction(() => window.appready === true, null, { timeout: 30_000 });

  const state = await page.evaluate(() => ({
    profile: window.__LAMPA_TEST_PROFILE__,
    plugins: window.Lampa && Lampa.Plugins ? Lampa.Plugins.loaded() : [],
    tmdbUrl: window.Lampa && Lampa.TMDB ? Lampa.TMDB.api('movie/550') : '',
    torserverUrl: window.Lampa && Lampa.Torserver ? Lampa.Torserver.url() : '',
  }));

  expect(state.profile && state.profile.enabled).toBeTruthy();

  for (const plugin of expectedPlugins) {
    expect(state.plugins, `${plugin} should be loaded`).toContain(plugin);
  }

  expect(state.tmdbUrl).toContain('apitmdb.');
  expect(state.torserverUrl).toContain('127.0.0.1:8090');
});

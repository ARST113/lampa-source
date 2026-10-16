(function () {
  'use strict';

  const plugins = [
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

  const managedKeys = ['plugins', 'proxy_tmdb'];
  const original = {};

  managedKeys.forEach((key) => {
    original[key] = localStorage.getItem(key);
  });

  function restore() {
    managedKeys.forEach((key) => {
      if (original[key] === null) localStorage.removeItem(key);
      else localStorage.setItem(key, original[key]);
    });
  }

  localStorage.setItem(
    'plugins',
    JSON.stringify(plugins.map((url) => ({ url, status: 1 }))),
  );
  localStorage.setItem('proxy_tmdb', 'true');

  window.__LAMPA_TEST_PROFILE__ = {
    enabled: true,
    version: 1,
    plugins: plugins.slice(),
    features: {
      tmdbProxy: true,
      torrents: true,
      torserverClient: true,
    },
    restore,
  };

  window.addEventListener('pagehide', restore, { once: true });
})();

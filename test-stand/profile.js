(function (root) {
  'use strict';

  const staticPlugins = [
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

  function normalizeBackend(value) {
    if (!value || typeof value !== 'string') return null;

    try {
      const url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (!url.hostname) return null;

      url.search = '';
      url.hash = '';

      return url.href.replace(/\/+$/, '');
    }
    catch (error) {
      return null;
    }
  }

  function buildProfile(search) {
    let backend = null;

    try {
      const params = new URLSearchParams(search || '');
      backend = normalizeBackend(params.get('lampac'));
    }
    catch (error) {}

    if (backend) {
      return {
        mode: 'lampac',
        backend,
        lampacInitUrl: backend + '/lampainit.js',
        plugins: backendPlugins.slice(),
        features: {
          realLampac: true,
          tmdbProxy: true,
          parser: true,
          torrents: true,
          torserverClient: true,
          torserverProxy: true,
        },
      };
    }

    return {
      mode: 'static',
      backend: null,
      lampacInitUrl: null,
      plugins: staticPlugins.slice(),
      features: {
        realLampac: false,
        tmdbProxy: true,
        parser: false,
        torrents: true,
        torserverClient: true,
        torserverProxy: false,
      },
    };
  }

  function runtimeReady(target) {
    return !!(target && target.appready === true && target.Lampa);
  }

  const api = {
    normalizeBackend,
    buildProfile,
    runtimeReady,
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    return;
  }

  if (!root || !root.localStorage) return;

  const selected = buildProfile(root.location ? root.location.search : '');
  const managedKeys = ['plugins', 'proxy_tmdb'];
  const original = {};

  managedKeys.forEach((key) => {
    original[key] = root.localStorage.getItem(key);
  });

  function restore() {
    managedKeys.forEach((key) => {
      if (original[key] === null) root.localStorage.removeItem(key);
      else root.localStorage.setItem(key, original[key]);
    });
  }

  root.localStorage.setItem(
    'plugins',
    JSON.stringify(selected.plugins.map((url) => ({ url, status: 1 }))),
  );

  if (selected.mode === 'static') root.localStorage.setItem('proxy_tmdb', 'true');
  else root.localStorage.removeItem('proxy_tmdb');

  root.__LAMPA_TEST_PROFILE__ = Object.assign({}, selected, {
    enabled: true,
    version: 3,
    lampacInit: selected.mode === 'lampac' ? 'waiting-app' : 'not-required',
    restore,
  });

  function markLampacInit(state) {
    if (root.__LAMPA_TEST_PROFILE__) root.__LAMPA_TEST_PROFILE__.lampacInit = state;
  }

  function loadLampacInit(url) {
    if (!root.document) return;

    markLampacInit('loading');

    const script = root.document.createElement('script');
    script.src = url;
    script.async = false;
    script.onload = function () { markLampacInit('loaded'); };
    script.onerror = function () { markLampacInit('error'); };
    (root.document.head || root.document.documentElement).appendChild(script);
  }

  function loadLampacInitWhenReady(url) {
    if (runtimeReady(root)) {
      loadLampacInit(url);
      return;
    }

    const timer = root.setInterval(function () {
      if (!runtimeReady(root)) return;

      root.clearInterval(timer);
      loadLampacInit(url);
    }, 100);
  }

  if (selected.mode === 'lampac') loadLampacInitWhenReady(selected.lampacInitUrl);

  root.addEventListener('pagehide', restore, { once: true });
})(typeof window !== 'undefined' ? window : null);

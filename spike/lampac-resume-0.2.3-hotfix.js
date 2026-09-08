(function () {
  'use strict';

  if (typeof window === 'undefined' || !window.Lampa || !window.LampacResumeCore) return;

  var Lampa = window.Lampa;
  var Core = window.LampacResumeCore;
  var originalCreateMedia = Core.createMedia;
  var originalBuildTorrServerStreamUrl = Core.buildTorrServerStreamUrl;

  function asInt(value) {
    var n = parseInt(value, 10);
    return isFinite(n) ? n : 0;
  }

  function normalizeBase(raw) {
    var base = String(raw || '').trim().replace(/\/+$/, '');
    if (!base) return '';
    if (/^https?:\/\//i.test(base)) return base;
    if (/^\/\//.test(base)) return 'https:' + base;
    if (/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(base)) return 'http://' + base;
    if (/^[a-z0-9.-]+(?::\d+)?(?:\/|$)/i.test(base)) return 'https://' + base;
    try { return new URL(base, window.location.href).toString().replace(/\/+$/, ''); }
    catch (_) { return base; }
  }

  Core.normalizeTorrServerBase = normalizeBase;

  Core.createMedia = function (card, play) {
    var media = originalCreateMedia(card, play) || {};
    card = card || {};
    play = play || {};
    var season = asInt(play.season);
    var episode = asInt(play.episode);
    if (season > 0 || episode > 0 || String(play.type || '').toLowerCase() === 'tv') {
      media.type = 'tv';
      media.season = season;
      media.episode = episode;
    }
    return media;
  };

  Core.buildTorrServerStreamUrl = function (baseUrl, recipe) {
    return originalBuildTorrServerStreamUrl(normalizeBase(baseUrl), recipe);
  };

  var configured = String(Lampa.Storage.get('torrserver_url', '') || '');
  var normalized = normalizeBase(configured);
  if (normalized && normalized !== configured) Lampa.Storage.set('torrserver_url', normalized);

  try {
    var db = Lampa.Storage.get('lampac_resume_v1', {});
    if (typeof db === 'string') db = JSON.parse(db || '{}');
    if (db && db.items) {
      var changed = false;
      Object.keys(db.items).forEach(function (key) {
        var record = db.items[key] || {};
        var source = record.source || {};
        var media = record.media || {};
        if (source.kind === 'torrent' && String(media.type || '').toLowerCase() !== 'tv' && /S\d{1,2}E\d{1,3}/i.test(String(source.file_name || ''))) {
          delete db.items[key];
          Object.keys(db.hash_map || {}).forEach(function (hash) {
            if (db.hash_map[hash] === key) delete db.hash_map[hash];
          });
          changed = true;
        }
      });
      if (changed) Lampa.Storage.set('lampac_resume_v1', db);
    }
  } catch (_) {}

  window.lampac_resume_hotfix_version = '0.2.3';
})();

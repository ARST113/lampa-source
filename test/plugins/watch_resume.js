(function () {
  'use strict';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  /*
   * Lampac Resume v0.2.3
   * Recipe-based resume for Lampa internal player, Just+ external player and TorrServer TrackTimecode.
   *
   * Design invariant: final playback URLs and credentials are NEVER persisted.
   */
  (function (root, factory) {
    var core = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = core;
    if (root) root.LampacResumeCore = core;
  })(typeof globalThis !== 'undefined' ? globalThis : undefined, function () {

    var FORBIDDEN_KEYS = {
      url: 1,
      urls: 1,
      link: 1,
      links: 1,
      stream: 1,
      streams: 1,
      headers: 1,
      header: 1,
      cookie: 1,
      cookies: 1,
      token: 1,
      access_token: 1,
      authorization: 1,
      quality_urls: 1,
      quality_url: 1,
      playlist_url: 1,
      hls: 1,
      hls_url: 1,
      manifest_url: 1
    };
    function isObject(value) {
      return value && _typeof(value) === 'object' && !Array.isArray(value);
    }
    function asNumber(value, fallback) {
      var n = Number(value);
      return isFinite(n) ? n : typeof fallback === 'number' ? fallback : 0;
    }
    function asInt(value, fallback) {
      var n = parseInt(value, 10);
      return isFinite(n) ? n : typeof fallback === 'number' ? fallback : 0;
    }
    function normalizeText(value) {
      return String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, ' ');
    }
    function sanitizeObject(value, depth) {
      depth = depth || 0;
      if (depth > 12) return undefined;
      if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }
      if (Array.isArray(value)) {
        return value.map(function (item) {
          return sanitizeObject(item, depth + 1);
        }).filter(function (item) {
          return typeof item !== 'undefined';
        });
      }
      if (!isObject(value)) return undefined;
      var out = {};
      Object.keys(value).forEach(function (key) {
        var lowered = String(key).toLowerCase();
        if (FORBIDDEN_KEYS[lowered]) return;
        if (/pass(word)?|secret|bearer|auth[_-]?token|session[_-]?id/i.test(lowered)) return;
        var clean = sanitizeObject(value[key], depth + 1);
        if (typeof clean !== 'undefined') out[key] = clean;
      });
      return out;
    }
    function containsForbiddenKey(value, depth) {
      depth = depth || 0;
      if (depth > 12 || value == null) return false;
      if (Array.isArray(value)) {
        return value.some(function (item) {
          return containsForbiddenKey(item, depth + 1);
        });
      }
      if (!isObject(value)) return false;
      return Object.keys(value).some(function (key) {
        var lowered = String(key).toLowerCase();
        if (FORBIDDEN_KEYS[lowered]) return true;
        if (/pass(word)?|secret|bearer|auth[_-]?token|session[_-]?id/i.test(lowered)) return true;
        return containsForbiddenKey(value[key], depth + 1);
      });
    }
    function recordHasNoTransientUrl(record) {
      return !containsForbiddenKey(record);
    }
    function normalizeInfoHash(input) {
      var raw = String(input || '').trim();
      if (/^[a-fA-F0-9]{40}$/.test(raw) || /^[a-fA-F0-9]{64}$/.test(raw)) return raw.toLowerCase();
      if (/^[A-Z2-7]{32}$/i.test(raw)) return raw.toUpperCase();
      return '';
    }
    function extractMagnetInfoHash(input) {
      var raw = String(input || '').trim();
      var direct = normalizeInfoHash(raw);
      if (direct) return direct;
      var match = raw.match(/(?:^|[?&])xt=urn:bt(?:ih|mh):([^&]+)/i);
      if (!match) match = raw.match(/urn:btih:([a-zA-Z0-9]+)/i);
      if (!match) return '';
      try {
        return normalizeInfoHash(decodeURIComponent(match[1]));
      } catch (_) {
        return normalizeInfoHash(match[1]);
      }
    }
    function parseUrlLoose(raw) {
      var text = String(raw || '');
      try {
        return new URL(text, 'http://lampac.invalid');
      } catch (_) {
        return null;
      }
    }
    function parseTorrServerStream(rawUrl) {
      var parsed = parseUrlLoose(rawUrl);
      if (!parsed) return null;
      var path = parsed.pathname || '';
      if (!/\/stream(?:\/|$)/i.test(path) && !/\/play\//i.test(path)) return null;
      var link = parsed.searchParams ? parsed.searchParams.get('link') || parsed.searchParams.get('hash') || '' : '';
      var infoHash = extractMagnetInfoHash(link);
      if (!infoHash) {
        var playMatch = path.match(/\/play\/([^/]+)/i);
        if (playMatch) infoHash = normalizeInfoHash(playMatch[1]);
      }
      if (!infoHash) return null;
      var idx = parsed.searchParams ? parsed.searchParams.get('index') || parsed.searchParams.get('id') || parsed.searchParams.get('fileID') : null;
      if (idx == null) {
        var idMatch = path.match(/\/play\/[^/]+\/(\d+)/i);
        if (idMatch) idx = idMatch[1];
      }
      var fileIndex = asInt(idx, 0);
      var fileName = '';
      var streamMatch = path.match(/\/stream\/([^/?#]*)/i);
      if (streamMatch && streamMatch[1]) {
        try {
          fileName = decodeURIComponent(streamMatch[1]);
        } catch (_) {
          fileName = streamMatch[1];
        }
      }
      if (!fileName) fileName = 'video';
      return {
        kind: 'torrent',
        info_hash: infoHash,
        file_index: fileIndex,
        file_name: fileName
      };
    }
    function buildTorrServerStreamUrl(baseUrl, recipe) {
      if (!recipe) return '';
      var hash = normalizeInfoHash(recipe.info_hash);
      if (!hash) return '';
      var base = String(baseUrl || '').replace(/\/+$/, '');
      if (!base) return '';
      var fileName = String(recipe.file_name || 'video');
      var index = asInt(recipe.file_index, 0);
      return base + '/stream/' + encodeURIComponent(fileName) + '?link=' + encodeURIComponent(hash) + '&index=' + index + '&play';
    }
    function episodeIdentity(play) {
      play = play || {};
      var season = parseInt(play.season, 10) || 0;
      var episode = parseInt(play.episode, 10) || 0;
      if (season > 0 || episode > 0) return {
        season: season,
        episode: episode
      };
      var haystack = [play.title, play.name, play.filename, play.file_name, play.path, play.path_human, play.url].filter(function (value) {
        return value != null && value !== '';
      }).join(' ');
      var match = haystack.match(/(?:^|[^a-z0-9])s(\d{1,2})[ ._-]*e(\d{1,3})(?:[^a-z0-9]|$)/i);
      if (!match) return {
        season: 0,
        episode: 0
      };
      return {
        season: asInt(match[1], 0),
        episode: asInt(match[2], 0)
      };
    }
    function mediaType(card, play) {
      var episode = episodeIdentity(play);
      if (episode.season > 0 || episode.episode > 0) return 'tv';
      var playType = play && play.type ? String(play.type).toLowerCase() : '';
      if (playType === 'tv') return 'tv';
      var type = card && card.type ? String(card.type).toLowerCase() : '';
      if (type === 'tv') return 'tv';
      if (card && (card.name || card.original_name || card.first_air_date) || play && play.episode != null && (parseInt(play.episode, 10) || 0) > 0) return 'tv';
      return 'movie';
    }
    function subsetCard(card) {
      card = card || {};
      var allowed = ['id', 'tmdb_id', 'imdb_id', 'kinopoisk_id', 'kp_id', 'source', 'type', 'title', 'name', 'original_title', 'original_name', 'release_date', 'first_air_date', 'original_language', 'poster_path', 'backdrop_path', 'number_of_seasons'];
      var out = {};
      allowed.forEach(function (key) {
        if (card[key] !== undefined && card[key] !== null && card[key] !== '') out[key] = card[key];
      });
      return sanitizeObject(out) || {};
    }
    function createMedia(card, play) {
      card = card || {};
      play = play || {};
      var type = mediaType(card, play);
      var episodic = episodeIdentity(play);
      var date = card.release_date || card.first_air_date || '';
      var title = card.title || card.name || play.title || '';
      var source = card.source || 'tmdb';
      var id = card.id != null ? card.id : card.tmdb_id != null ? card.tmdb_id : '';
      return {
        type: type,
        source: source,
        id: id,
        tmdb_id: card.tmdb_id != null ? card.tmdb_id : source === 'tmdb' ? id : '',
        imdb_id: card.imdb_id || '',
        kinopoisk_id: card.kinopoisk_id || card.kp_id || '',
        title: title,
        year: String(date || '').slice(0, 4),
        season: type === 'tv' ? parseInt(play.season, 10) || 0 || episodic.season : 0,
        episode: type === 'tv' ? parseInt(play.episode, 10) || 0 || episodic.episode : 0
      };
    }
    function buildMediaKey(media) {
      media = media || {};
      var type = String(media.type || 'movie').toLowerCase() === 'tv' ? 'tv' : 'movie';
      var source = String(media.source || '').toLowerCase();
      var identity = '';
      if (media.id !== undefined && media.id !== null && String(media.id) !== '') {
        identity = (source || 'id') + ':' + String(media.id);
      } else if (media.tmdb_id) {
        identity = 'tmdb:' + String(media.tmdb_id);
      } else if (media.imdb_id) {
        identity = 'imdb:' + String(media.imdb_id).toLowerCase();
      } else if (media.kinopoisk_id) {
        identity = 'kp:' + String(media.kinopoisk_id);
      } else {
        identity = 'title:' + normalizeText(media.title).replace(/[^a-zа-яё0-9]+/gi, '-') + ':' + String(media.year || '');
      }
      var key = identity.split(':')[0] + ':' + type + ':' + identity.split(':').slice(1).join(':');
      if (type === 'tv') {
        key += ':s' + asInt(media.season, 0) + ':e' + asInt(media.episode, 0);
      }
      return key;
    }
    function createOnlineRecipe(input) {
      input = input || {};
      var play = input.play || {};
      return {
        kind: 'online',
        adapter: 'lampac-online',
        balancer: String(input.balancer || ''),
        card: subsetCard(input.card || {}),
        selection: {
          season: parseInt(play.season, 10) || 0,
          episode: parseInt(play.episode, 10) || 0,
          voice_name: String(play.voice_name || '')
        }
      };
    }
    function progressFromTimelineEvent(event) {
      event = event || {};
      var road = event.road || event.timeline || event;
      var timeSec = asNumber(road.time, 0);
      var durationSec = asNumber(road.duration, 0);
      var percent = road.percent != null ? asInt(road.percent, 0) : durationSec > 0 ? Math.round(timeSec * 100 / durationSec) : 0;
      percent = Math.max(0, Math.min(100, percent));
      return {
        timeline_hash: String(event.hash || road.hash || ''),
        position_ms: Math.max(0, Math.round(timeSec * 1000)),
        duration_ms: Math.max(0, Math.round(durationSec * 1000)),
        percent: percent,
        completed: percent >= 95
      };
    }
    function progressFromVideo(video) {
      if (!video) return null;
      var timeSec = asNumber(video.currentTime, 0);
      var durationSec = asNumber(video.duration, 0);
      if (!isFinite(durationSec) || durationSec < 0) durationSec = 0;
      var percent = durationSec > 0 ? Math.round(timeSec * 100 / durationSec) : 0;
      return {
        position_ms: Math.max(0, Math.round(timeSec * 1000)),
        duration_ms: Math.max(0, Math.round(durationSec * 1000)),
        percent: Math.max(0, Math.min(100, percent)),
        completed: durationSec > 0 && percent >= 95
      };
    }
    function shouldResume(progress, minPositionMs, completionPercent) {
      progress = progress || {};
      minPositionMs = typeof minPositionMs === 'number' ? minPositionMs : 15000;
      completionPercent = typeof completionPercent === 'number' ? completionPercent : 95;
      if (progress.completed) return false;
      var pos = asNumber(progress.position_ms, 0);
      var dur = asNumber(progress.duration_ms, 0);
      var pct = progress.percent != null ? asNumber(progress.percent, 0) : dur > 0 ? pos * 100 / dur : 0;
      return pos >= minPositionMs && pct < completionPercent && (dur <= 0 || pos < dur);
    }
    function applyResumeTimeline(play, record) {
      if (!play || !record || !record.progress) return play;
      var progress = record.progress;
      var old = isObject(play.timeline) ? play.timeline : {};
      var duration = Math.max(0, asNumber(progress.duration_ms, 0) / 1000);
      var time = Math.max(0, asNumber(progress.position_ms, 0) / 1000);
      var percent = progress.percent != null ? asInt(progress.percent, 0) : duration > 0 ? Math.round(time * 100 / duration) : 0;
      var timeline = {};
      Object.keys(old).forEach(function (key) {
        timeline[key] = old[key];
      });
      timeline.hash = old.hash || record.timeline_hash || buildMediaKey(record.media || {});
      timeline.time = time;
      timeline.duration = duration;
      timeline.percent = percent;
      play.timeline = timeline;
      return play;
    }
    function chooseProgress(localProgress, torrTimecodeSeconds) {
      var local = localProgress || null;
      var tsMs = Math.max(0, Math.round(asNumber(torrTimecodeSeconds, 0) * 1000));
      if (!local) return tsMs > 0 ? {
        position_ms: tsMs,
        duration_ms: 0,
        percent: 0,
        completed: false
      } : null;
      if (local.completed) return local;
      if (tsMs > asNumber(local.position_ms, 0)) {
        var out = {};
        Object.keys(local).forEach(function (key) {
          out[key] = local[key];
        });
        out.position_ms = tsMs;
        if (out.duration_ms > 0) out.percent = Math.round(tsMs * 100 / out.duration_ms);
        return out;
      }
      return local;
    }
    function recordMatchesCard(record, card) {
      if (!record || !record.media || !card) return false;
      var media = record.media || {};
      var cardSource = String(card.source || '').toLowerCase();
      var mediaSource = String(media.source || '').toLowerCase();
      var cardId = card.id != null && String(card.id) !== '' ? String(card.id) : '';
      var mediaId = media.id != null && String(media.id) !== '' ? String(media.id) : '';
      if (cardId && mediaId && cardSource && mediaSource) {
        if (cardSource === mediaSource) return cardId === mediaId;
      }
      var cardTmdb = card.tmdb_id != null && String(card.tmdb_id) !== '' ? String(card.tmdb_id) : cardSource === 'tmdb' ? cardId : '';
      var mediaTmdb = media.tmdb_id != null && String(media.tmdb_id) !== '' ? String(media.tmdb_id) : mediaSource === 'tmdb' ? mediaId : '';
      if (cardTmdb && mediaTmdb) return cardTmdb === mediaTmdb;
      var cardImdb = String(card.imdb_id || '').toLowerCase();
      var mediaImdb = String(media.imdb_id || '').toLowerCase();
      if (cardImdb && mediaImdb) return cardImdb === mediaImdb;
      var cardKp = String(card.kinopoisk_id || card.kp_id || '');
      var mediaKp = String(media.kinopoisk_id || '');
      if (cardKp && mediaKp) return cardKp === mediaKp;
      var cardTitle = normalizeText(card.title || card.name || '');
      var mediaTitle = normalizeText(media.title || '');
      if (!cardTitle || !mediaTitle || cardTitle !== mediaTitle) return false;
      var cardDate = card.release_date || card.first_air_date || '';
      var cardYear = String(cardDate).slice(0, 4);
      var mediaYear = String(media.year || '');
      return !cardYear || !mediaYear || cardYear === mediaYear;
    }
    function formatPositionMs(value) {
      var total = Math.max(0, Math.floor(asNumber(value, 0) / 1000));
      var hours = Math.floor(total / 3600);
      var minutes = Math.floor(total % 3600 / 60);
      var seconds = total % 60;
      function pad(n) {
        return n < 10 ? '0' + n : String(n);
      }
      return hours > 0 ? hours + ':' + pad(minutes) + ':' + pad(seconds) : pad(minutes) + ':' + pad(seconds);
    }
    function resumeButtonLabel(record) {
      record = record || {};
      var media = record.media || {};
      var progress = record.progress || {};
      var time = formatPositionMs(progress.position_ms || 0);
      if (String(media.type || '').toLowerCase() === 'tv' && asInt(media.episode, 0) > 0) {
        var season = asInt(media.season, 0);
        var episode = asInt(media.episode, 0);
        var code = 'S' + (season < 10 ? '0' : '') + season + 'E' + (episode < 10 ? '0' : '') + episode;
        return 'Продолжить — ' + code + ' · ' + time;
      }
      return 'Продолжить · ' + time;
    }
    function findLatestResumeForCard(records, card, profile, minPositionMs, completionPercent) {
      records = Array.isArray(records) ? records : [];
      var filtered = records.filter(function (record) {
        if (!record) return false;
        if (profile != null && record.profile_id != null && String(record.profile_id) !== String(profile)) return false;
        if (!recordMatchesCard(record, card)) return false;
        return shouldResume(record.progress, minPositionMs, completionPercent);
      });
      filtered.sort(function (a, b) {
        return asNumber(b.updated_at, 0) - asNumber(a.updated_at, 0);
      });
      return filtered[0] || null;
    }
    return {
      sanitizeObject: sanitizeObject,
      recordHasNoTransientUrl: recordHasNoTransientUrl,
      normalizeInfoHash: normalizeInfoHash,
      extractMagnetInfoHash: extractMagnetInfoHash,
      parseTorrServerStream: parseTorrServerStream,
      buildTorrServerStreamUrl: buildTorrServerStreamUrl,
      subsetCard: subsetCard,
      createMedia: createMedia,
      episodeIdentity: episodeIdentity,
      buildMediaKey: buildMediaKey,
      createOnlineRecipe: createOnlineRecipe,
      progressFromTimelineEvent: progressFromTimelineEvent,
      progressFromVideo: progressFromVideo,
      shouldResume: shouldResume,
      applyResumeTimeline: applyResumeTimeline,
      chooseProgress: chooseProgress,
      recordMatchesCard: recordMatchesCard,
      formatPositionMs: formatPositionMs,
      resumeButtonLabel: resumeButtonLabel,
      findLatestResumeForCard: findLatestResumeForCard
    };
  });
  (function () {

    if (typeof window === 'undefined' || !window.Lampa || !window.LampacResumeCore) return;
    var Lampa = window.Lampa;
    var Core = window.LampacResumeCore;
    var VERSION = '0.2.3';
    if (window.lampac_resume_plugin_version === VERSION) return;
    var STORE_KEY = 'lampac_resume_v1';
    var MAX_RECORDS = 300;
    var POLL_MS = 5000;
    var TS_PUSH_MS = 15000;
    var MIN_RESUME_MS = 15000;
    var COMPLETION_PERCENT = 95;
    var currentSession = null;
    var pollTimer = null;
    var lastTsPush = {};
    var originalPlay = null;
    var originalPlaylist = null;
    var adapters = {};
    var pendingRecipe = null;
    var pendingResumeRecord = null;
    var lastFullContext = null;
    var lastKnownCard = null;
    var lastProgressLogAt = 0;
    function log() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[LampacResume ' + VERSION + ']');
      try {
        console.log.apply(console, args);
      } catch (_) {}
    }
    function safeUrlForLog(raw) {
      try {
        var u = new URL(String(raw || ''), window.location && window.location.origin || undefined);
        var keep = ['id', 'tmdb_id', 'imdb_id', 'kinopoisk_id', 'serial', 'source', 'rjson', 's', 'e', 't', 'life', 'memkey', 'stage'];
        var parts = [];
        keep.forEach(function (key) {
          if (u.searchParams && u.searchParams.has(key)) parts.push(key + '=' + encodeURIComponent(u.searchParams.get(key)));
        });
        return u.origin + u.pathname + (parts.length ? '?' + parts.join('&') : '');
      } catch (_) {
        return String(raw || '').split('?')[0];
      }
    }
    function summarizeOnlineResponse(value) {
      if (value == null) return {
        kind: 'null'
      };
      if (typeof value === 'string') return {
        kind: 'string',
        length: value.length
      };
      if (Array.isArray(value)) return {
        kind: 'array',
        length: value.length
      };
      if (_typeof(value) !== 'object') return {
        kind: _typeof(value)
      };
      return {
        kind: 'object',
        type: value.type || '',
        keys: Object.keys(value).slice(0, 16),
        data: Array.isArray(value.data) ? value.data.length : undefined,
        voice: Array.isArray(value.voice) ? value.voice.length : undefined,
        online: Array.isArray(value.online) ? value.online.length : undefined,
        rch: !!value.rch,
        life: !!value.life,
        ready: !!value.ready,
        accsdb: !!value.accsdb,
        has_url: typeof value.url === 'string' && !!value.url
      };
    }
    function notify(text) {
      try {
        if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(text);else console.log('[LampacResume]', text);
      } catch (_) {}
    }
    function parseMaybeObject(value, fallback) {
      if (value && _typeof(value) === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (_) {}
      }
      return fallback || {};
    }
    function legacyTorrentEpisodeRecord(record) {
      record = record || {};
      var source = record.source || {};
      var media = record.media || {};
      if (source.kind !== 'torrent' || String(media.type || '').toLowerCase() === 'tv') return false;
      var text = [source.file_name, source.play_title, media.title].join(' ');
      return /(?:^|[^a-z0-9])s\d{1,2}[ ._-]*e\d{1,3}(?:[^a-z0-9]|$)/i.test(text);
    }
    function migrateDb(db) {
      var changed = Number(db.version || 0) < 2;
      Object.keys(db.items || {}).forEach(function (key) {
        var record = db.items[key];
        if (!legacyTorrentEpisodeRecord(record)) return;

        // v0.2.2 stored all episodes of a torrent series under one movie key.
        // A later playlist item could overwrite the recipe while the progress still belonged to
        // the earlier episode. Such a record is ambiguous and must not be auto-resumed.
        delete db.items[key];
        Object.keys(db.hash_map || {}).forEach(function (hash) {
          if (db.hash_map[hash] === key) delete db.hash_map[hash];
        });
        changed = true;
        log('migration dropped ambiguous v0.2.2 torrent episode', key);
      });
      db.version = 2;
      return changed;
    }
    function loadDb() {
      var raw = Lampa.Storage.get(STORE_KEY, '{}');
      var db = parseMaybeObject(raw, {});
      if (!db || _typeof(db) !== 'object') db = {};
      if (!db.items || _typeof(db.items) !== 'object') db.items = {};
      if (!db.hash_map || _typeof(db.hash_map) !== 'object') db.hash_map = {};
      if (migrateDb(db)) Lampa.Storage.set(STORE_KEY, db);
      return db;
    }
    function saveDb(db) {
      pruneDb(db);
      Lampa.Storage.set(STORE_KEY, db);
    }
    function pruneDb(db) {
      var keys = Object.keys(db.items || {});
      if (keys.length <= MAX_RECORDS) return;
      keys.sort(function (a, b) {
        return Number(db.items[b] && db.items[b].updated_at || 0) - Number(db.items[a] && db.items[a].updated_at || 0);
      });
      keys.slice(MAX_RECORDS).forEach(function (key) {
        delete db.items[key];
        Object.keys(db.hash_map || {}).forEach(function (hash) {
          if (db.hash_map[hash] === key) delete db.hash_map[hash];
        });
      });
    }
    function profileId() {
      var direct = String(Lampa.Storage.get('lampac_profile_id', '') || '');
      if (direct) return direct;
      var account = parseMaybeObject(Lampa.Storage.get('account', '{}'), {});
      if (account.profile && account.profile.id != null) return String(account.profile.id);
      return 'default';
    }
    function scopedMediaKey(media) {
      return 'p:' + profileId() + '|' + Core.buildMediaKey(media);
    }
    function activityObject() {
      return parseMaybeObject(Lampa.Storage.get('activity', '{}'), {});
    }
    function cardFromActiveActivity() {
      try {
        if (!Lampa.Activity || typeof Lampa.Activity.active !== 'function') return null;
        var active = Lampa.Activity.active();
        if (!active) return null;
        var candidates = [active.movie, active.card, active.object && active.object.movie, active.object && active.object.card, active.activity && active.activity.movie, active.activity && active.activity.card, active.activity && active.activity.object && active.activity.object.movie, active.activity && active.activity.object && active.activity.object.card];
        for (var i = 0; i < candidates.length; i++) {
          var card = candidates[i];
          if (card && _typeof(card) === 'object' && (card.id != null || card.tmdb_id || card.imdb_id || card.kinopoisk_id || card.title || card.name)) return card;
        }
      } catch (e) {
        log('active card probe failed', e && e.message || e);
      }
      return null;
    }
    function currentCard() {
      var activeCard = cardFromActiveActivity();
      if (activeCard) return activeCard;
      if (lastKnownCard) return lastKnownCard;
      var activity = activityObject();
      return activity.movie || activity.card || {};
    }
    function privateHost(host) {
      host = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
      if (host === 'localhost' || host === '::1' || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) return true;
      var match = host.match(/^172\.(\d{1,2})\./);
      return !!(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
    }
    function normalizeTorrServerBase(raw) {
      var base = String(raw || '').trim().replace(/\/+$/, '');
      if (!base) return '';
      if (/^https?:\/\//i.test(base)) return base;
      if (/^\/\//.test(base)) {
        var protocol = window.location && /^https?:$/.test(window.location.protocol) ? window.location.protocol : 'https:';
        return protocol + base;
      }
      if (/^\//.test(base)) {
        try {
          return new URL(base, window.location.origin).toString().replace(/\/+$/, '');
        } catch (_) {
          return base;
        }
      }
      var hostPart = base.split('/')[0].split(':')[0];
      var protocol = privateHost(hostPart) ? 'http:' : window.location && window.location.protocol === 'http:' ? 'http:' : 'https:';
      return protocol + '//' + base;
    }
    function torrServerBaseFromStream(raw) {
      var text = String(raw || '').trim();
      if (!text) return '';
      var absolute = normalizeTorrServerBase(text);
      var parsed;
      try {
        parsed = new URL(absolute);
      } catch (_) {
        return '';
      }
      var path = parsed.pathname || '';
      var markers = ['/stream/', '/play/'];
      var cut = -1;
      markers.forEach(function (marker) {
        var idx = path.toLowerCase().indexOf(marker);
        if (idx >= 0 && (cut < 0 || idx < cut)) cut = idx;
      });
      if (cut < 0) return '';
      var prefix = path.slice(0, cut).replace(/\/+$/, '');
      return parsed.origin + prefix;
    }
    function torrServerBase() {
      var raw = String(Lampa.Storage.get('torrserver_url', '') || '');
      var normalized = normalizeTorrServerBase(raw);
      if (normalized && raw && normalized !== raw) {
        try {
          Lampa.Storage.set('torrserver_url', normalized);
        } catch (_) {}
        log('normalized TorrServer URL', safeUrlForLog(normalized));
      }
      return normalized;
    }
    function createTorrentRecipe(play) {
      play = play || {};
      var parsed = Core.parseTorrServerStream(play.url || '');
      var hash = Core.normalizeInfoHash(play.torrent_hash || play.hash || parsed && parsed.info_hash || '');
      if (!hash) return null;
      var episodic = Core.episodeIdentity(play);
      return {
        kind: 'torrent',
        adapter: 'torrserver',
        info_hash: hash,
        file_index: parsed ? parsed.file_index : parseInt(play.file_index != null ? play.file_index : play.index != null ? play.index : 0, 10) || 0,
        file_name: parsed ? parsed.file_name : String(play.filename || play.file_name || play.title || 'video'),
        play_title: String(play.title || play.name || ''),
        season: parseInt(play.season, 10) || 0 || episodic.season,
        episode: parseInt(play.episode, 10) || 0 || episodic.episode,
        torrserver_base: torrServerBaseFromStream(play.url || '') || torrServerBase()
      };
    }
    function originFromUrl(raw) {
      try {
        var parsed = new URL(String(raw || ''), window.location && window.location.origin || undefined);
        return parsed.origin && parsed.origin !== 'null' ? parsed.origin : '';
      } catch (_) {
        return '';
      }
    }
    function onlineServerOriginFromPlay(play) {
      play = play || {};
      var origin = originFromUrl(play.url || '');
      if (origin) return origin;
      try {
        if (window.location && window.location.origin) return String(window.location.origin).replace(/\/+$/, '');
      } catch (_) {}
      return '';
    }
    function createSourceRecipe(play, card) {
      if (pendingRecipe) {
        var attached = Core.sanitizeObject(pendingRecipe);
        pendingRecipe = null;
        if (attached) return attached;
      }
      var torrent = createTorrentRecipe(play);
      if (torrent) return torrent;
      var activeBalancer = String(Lampa.Storage.get('active_balanser', '') || Lampa.Storage.get('online_balanser', '') || '');
      if (play && (play.isonline || play.voice_name)) {
        var choices = activeBalancer ? parseMaybeObject(Lampa.Storage.get('online_choice_' + activeBalancer, '{}'), {}) : {};
        var choice = card && card.id != null ? choices[card.id] || {} : {};
        var recipe = Core.createOnlineRecipe({
          card: card,
          play: play,
          balancer: activeBalancer
        });
        recipe.server_origin = onlineServerOriginFromPlay(play);
        recipe.selection.season_index = Number(choice.season || 0);
        recipe.selection.voice_index = Number(choice.voice || 0);
        if (!recipe.selection.voice_name && choice.voice_name) recipe.selection.voice_name = String(choice.voice_name);
        return recipe;
      }
      return {
        kind: 'generic',
        adapter: 'lampa',
        selection: {
          season: parseInt(play && play.season || 0, 10) || 0,
          episode: parseInt(play && play.episode || 0, 10) || 0
        }
      };
    }
    function upsertSession(play) {
      play = play || {};
      var resumeSeed = pendingResumeRecord;
      pendingResumeRecord = null;
      var card = resumeSeed && resumeSeed.source && resumeSeed.source.card ? resumeSeed.source.card : currentCard();
      var media = resumeSeed && resumeSeed.media ? resumeSeed.media : Core.createMedia(card, play);
      var key = scopedMediaKey(media);
      var db = loadDb();
      var old = db.items[key] || resumeSeed || null;
      var source = resumeSeed && resumeSeed.source ? resumeSeed.source : createSourceRecipe(play, card);
      if (old && Core.shouldResume(old.progress, MIN_RESUME_MS, COMPLETION_PERCENT)) {
        Core.applyResumeTimeline(play, old);
        log('resume injected', key, old.progress && old.progress.position_ms);
      }
      var timelineHash = play.timeline && play.timeline.hash ? String(play.timeline.hash) : old && old.timeline_hash ? old.timeline_hash : '';
      var record = {
        key: key,
        profile_id: profileId(),
        media: Core.sanitizeObject(media),
        source: Core.sanitizeObject(source),
        progress: old && old.progress ? old.progress : {
          position_ms: 0,
          duration_ms: 0,
          percent: 0,
          completed: false
        },
        timeline_hash: timelineHash,
        updated_at: Date.now()
      };
      if (!Core.recordHasNoTransientUrl(record)) {
        log('refused unsafe record', record);
        record.source = {
          kind: source && source.kind || 'generic',
          adapter: source && source.adapter || 'lampa'
        };
      }
      db.items[key] = record;
      if (timelineHash) db.hash_map[timelineHash] = key;
      saveDb(db);
      currentSession = {
        key: key,
        timeline_hash: timelineHash,
        source_kind: record.source && record.source.kind,
        started_at: Date.now()
      };
      log('session upsert', {
        key: key,
        card_id: media && media.id,
        source: record.source && record.source.kind,
        balancer: record.source && record.source.balancer,
        season: media && media.season,
        episode: media && media.episode,
        timeline: timelineHash
      });
      return record;
    }
    function updateProgress(key, progress, timelineHash) {
      if (!key || !progress) return null;
      var db = loadDb();
      var record = db.items[key];
      if (!record) return null;
      var pos = Math.max(0, Number(progress.position_ms || 0));
      var dur = Math.max(0, Number(progress.duration_ms || 0));
      var pct = progress.percent != null ? Number(progress.percent) : dur > 0 ? Math.round(pos * 100 / dur) : 0;
      var completed = !!progress.completed || pct >= COMPLETION_PERCENT;
      record.progress = {
        position_ms: completed ? 0 : Math.round(pos),
        duration_ms: Math.round(dur),
        percent: completed ? 100 : Math.max(0, Math.min(100, Math.round(pct))),
        completed: completed
      };
      if (timelineHash) {
        record.timeline_hash = String(timelineHash);
        db.hash_map[String(timelineHash)] = key;
      }
      record.updated_at = Date.now();
      db.items[key] = record;
      saveDb(db);
      if (record.source && record.source.kind === 'torrent') pushTorrServerViewed(record);
      if (lastKnownCard && Core.recordMatchesCard(record, lastKnownCard) && Core.shouldResume(record.progress, MIN_RESUME_MS, COMPLETION_PERCENT)) {
        setTimeout(function () {
          refreshCurrentCardButton('progress');
        }, 0);
      }
      return record;
    }
    function keyForTimeline(hash) {
      var db = loadDb();
      if (hash && db.hash_map[String(hash)]) return db.hash_map[String(hash)];
      return currentSession && currentSession.key;
    }
    function onTimelineUpdate(event) {
      var data = event && event.data ? event.data : event;
      if (!data) return;
      var progress = Core.progressFromTimelineEvent(data);
      var key = keyForTimeline(progress.timeline_hash);
      if (!key) return;
      updateProgress(key, progress, progress.timeline_hash);
      var now = Date.now();
      if (now - lastProgressLogAt >= 5000 || progress.completed) {
        lastProgressLogAt = now;
        log('timeline update', key, {
          hash: progress.timeline_hash,
          position_ms: progress.position_ms,
          duration_ms: progress.duration_ms,
          percent: progress.percent,
          completed: progress.completed
        });
      }
    }
    function getVideoElement() {
      try {
        if (Lampa.PlayerVideo && Lampa.PlayerVideo.video) {
          var video = Lampa.PlayerVideo.video();
          if (video) return video;
        }
      } catch (_) {}
      return document.querySelector('.player-video__display video') || document.querySelector('.player video') || document.querySelector('video');
    }
    function pollVideo() {
      if (!currentSession || !currentSession.key) return;
      var video = getVideoElement();
      if (!video) return;
      var progress = Core.progressFromVideo(video);
      if (!progress || progress.position_ms <= 0) return;
      updateProgress(currentSession.key, progress, currentSession.timeline_hash);
    }
    function onPlayerCreate(event) {
      var data = event && event.data ? event.data : null;
      if (data && (!currentSession || !currentSession.key)) upsertSession(data);
      stopPolling();
      pollTimer = setInterval(pollVideo, POLL_MS);
    }
    function onPlayerDestroy() {
      pollVideo();
      stopPolling();
      currentSession = null;
      setTimeout(function () {
        refreshCurrentCardButton('player-destroy');
      }, 50);
    }
    function stopPolling() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    }
    function torrServerHeaders() {
      var headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      var auth = String(Lampa.Storage.get('torrserver_auth', '') || '');
      var login = String(Lampa.Storage.get('torrserver_login', '') || '');
      var password = String(Lampa.Storage.get('torrserver_password', '') || '');
      if ((auth === 'true' || auth === '1' || auth === 'yes') && login) {
        try {
          var raw = login + ':' + password;
          var encoded;
          if (typeof btoa === 'function') encoded = btoa(unescape(encodeURIComponent(raw)));
          if (encoded) headers.Authorization = 'Basic ' + encoded;
        } catch (_) {}
      }
      return headers;
    }
    function requestJson(url, payload, success, error) {
      if (!url) return error && error(new Error('empty url'));
      var headers = torrServerHeaders();
      var body = JSON.stringify(payload || {});
      var finished = false;
      function ok(result) {
        if (finished) return;
        finished = true;
        if (success) success(result);
      }
      function fail(err) {
        if (finished) return;
        // Native request is useful on Android when a LAN TorrServer has no browser CORS headers.
        try {
          var network = new Lampa.Reguest();
          network.timeout(6000);
          network["native"](url, function (result) {
            if (typeof result === 'string' && result) {
              try {
                result = JSON.parse(result);
              } catch (_) {}
            }
            ok(result);
          }, function (nativeErr) {
            finished = true;
            if (error) error(nativeErr || err);
          }, body, {
            dataType: 'text',
            method: 'POST',
            headers: headers,
            contentType: 'application/json'
          });
        } catch (nativeException) {
          finished = true;
          if (error) error(nativeException || err);
        }
      }
      if (typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: body,
          cache: 'no-store'
        }).then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          if (response.status === 204 || response.status === 200 && payload && payload.action === 'set') return null;
          return response.text().then(function (text) {
            if (!text) return null;
            try {
              return JSON.parse(text);
            } catch (_) {
              return text;
            }
          });
        }).then(ok)["catch"](fail);
      } else {
        fail(new Error('fetch unavailable'));
      }
    }
    function tsEndpoint(record) {
      var source = record && record.source || {};
      var sourceBase = normalizeTorrServerBase(source.torrserver_base || '');
      var base = sourceBase || torrServerBase();
      return base ? base.replace(/\/+$/, '') + '/viewed' : '';
    }
    function torserverApiAvailable() {
      return !!(Lampa.Torserver && typeof Lampa.Torserver.viewedSet === 'function' && typeof Lampa.Torserver.viewed === 'function');
    }
    function pushTorrServerViewed(record, force) {
      if (!record || !record.source || record.source.kind !== 'torrent') return;
      var source = record.source;
      var hash = Core.normalizeInfoHash(source.info_hash);
      if (!hash) return;
      var fileIndex = parseInt(source.file_index, 10);
      if (!isFinite(fileIndex) || fileIndex < 0) return;
      var id = hash + ':' + fileIndex;
      var now = Date.now();
      if (!force && lastTsPush[id] && now - lastTsPush[id] < TS_PUSH_MS) return;
      lastTsPush[id] = now;
      var seconds = record.progress && !record.progress.completed ? Number(record.progress.position_ms || 0) / 1000 : 0;
      var success = function success() {
        log('TorrServer viewed saved', hash, fileIndex, seconds);
      };
      var failure = function failure(err) {
        log('TorrServer viewed save failed', err && (err.message || err.status) || err);
      };
      if (torserverApiAvailable()) {
        try {
          Lampa.Torserver.viewedSet(hash, fileIndex, seconds, success, failure);
          return;
        } catch (e) {
          log('Lampa.Torserver.viewedSet failed; using HTTP fallback', e && e.message || e);
        }
      }
      requestJson(tsEndpoint(record), {
        action: 'set',
        hash: hash,
        file_index: fileIndex,
        timecode: seconds
      }, success, failure);
    }
    function pullTorrServerViewed(record, callback) {
      if (!record || !record.source || record.source.kind !== 'torrent') return callback && callback(null);
      var source = record.source;
      var hash = Core.normalizeInfoHash(source.info_hash);
      var fileIndex = parseInt(source.file_index, 10);
      if (!hash || !isFinite(fileIndex) || fileIndex < 0) return callback && callback(null);
      function consume(result) {
        var rows = Array.isArray(result) ? result : [];
        var row = rows.filter(function (item) {
          return Number(item && item.file_index) === fileIndex;
        })[0];
        callback && callback(row && Number(row.timecode) > 0 ? Number(row.timecode) : 0);
      }
      function fallback() {
        requestJson(tsEndpoint(record), {
          action: 'list',
          hash: hash,
          file_index: fileIndex,
          timecode: 0
        }, consume, function () {
          callback && callback(null);
        });
      }
      if (torserverApiAvailable()) {
        try {
          Lampa.Torserver.viewed(hash, consume, function (err) {
            log('Lampa.Torserver.viewed failed; using HTTP fallback', err && (err.message || err.status) || err);
            fallback();
          });
          return;
        } catch (e) {
          log('Lampa.Torserver.viewed failed; using HTTP fallback', e && e.message || e);
        }
      }
      fallback();
    }
    function indexPlaylist(playlist) {
      if (!Array.isArray(playlist) || !playlist.length) return;
      var card = currentCard();
      var db = loadDb();
      var activeRecord = currentSession && db.items[currentSession.key] ? db.items[currentSession.key] : null;
      var activeSource = activeRecord && activeRecord.source ? activeRecord.source : null;
      playlist.forEach(function (item) {
        if (!item || _typeof(item) !== 'object') return;
        var media = Core.createMedia(card, item);
        var key = scopedMediaKey(media);
        var old = db.items[key] || null;
        if (old && Core.shouldResume(old.progress, MIN_RESUME_MS, COMPLETION_PERCENT)) {
          Core.applyResumeTimeline(item, old);
        }
        var source;
        var torrent = createTorrentRecipe(item);
        if (torrent) {
          source = torrent;
        } else if (activeSource && activeSource.kind === 'online') {
          source = Core.createOnlineRecipe({
            card: activeSource.card || card,
            play: item,
            balancer: activeSource.balancer || ''
          });
          source.server_origin = activeSource.server_origin || onlineServerOriginFromPlay(item);
          source.selection.season_index = activeSource.selection && activeSource.selection.season_index != null ? Number(activeSource.selection.season_index) : Number(item.season || 0);
          source.selection.voice_index = activeSource.selection && activeSource.selection.voice_index != null ? Number(activeSource.selection.voice_index) : 0;
          if (!source.selection.voice_name && activeSource.selection && activeSource.selection.voice_name) {
            source.selection.voice_name = String(activeSource.selection.voice_name);
          }
        } else {
          source = createSourceRecipe(item, card);
        }
        var timelineHash = item.timeline && item.timeline.hash ? String(item.timeline.hash) : old && old.timeline_hash ? old.timeline_hash : '';
        var record = {
          key: key,
          profile_id: profileId(),
          media: Core.sanitizeObject(media),
          source: Core.sanitizeObject(source),
          progress: old && old.progress ? old.progress : {
            position_ms: 0,
            duration_ms: 0,
            percent: 0,
            completed: false
          },
          timeline_hash: timelineHash,
          updated_at: old && old.updated_at ? old.updated_at : Date.now()
        };
        if (!Core.recordHasNoTransientUrl(record)) {
          record.source = {
            kind: source && source.kind || 'generic',
            adapter: source && source.adapter || 'lampa'
          };
        }
        db.items[key] = record;
        if (timelineHash) db.hash_map[timelineHash] = key;
      });
      saveDb(db);
    }
    function installPlayerPatch() {
      if (!Lampa.Player || typeof Lampa.Player.play !== 'function' || Lampa.Player.__lampacResumePatched === VERSION) return;
      originalPlay = Lampa.Player.play;
      originalPlaylist = typeof Lampa.Player.playlist === 'function' ? Lampa.Player.playlist : null;
      Lampa.Player.play = function (playData) {
        try {
          log('Player.play intercepted', {
            title: playData && playData.title,
            season: playData && playData.season,
            episode: playData && playData.episode,
            isonline: !!(playData && playData.isonline),
            player: onlinePlayerMode()
          });
          upsertSession(playData || {});
        } catch (e) {
          log('before play error', e && e.stack || e);
        }
        return originalPlay.apply(this, arguments);
      };
      if (originalPlaylist) {
        Lampa.Player.playlist = function (playlist) {
          try {
            indexPlaylist(playlist);
          } catch (e) {
            log('playlist index error', e);
          }
          return originalPlaylist.apply(this, arguments);
        };
      }
      Lampa.Player.__lampacResumePatched = VERSION;
    }
    function restoreOnlineChoice(record) {
      var source = record.source || {};
      var recipeCard = source.card || {};
      var balancer = source.balancer || '';
      var selection = source.selection || {};
      if (balancer) {
        Lampa.Storage.set('online_balanser', balancer);
        Lampa.Storage.set('active_balanser', balancer);
        var last = parseMaybeObject(Lampa.Storage.get('online_last_balanser', '{}'), {});
        if (recipeCard.id != null) {
          last[recipeCard.id] = balancer;
          Lampa.Storage.set('online_last_balanser', last);
        }
        if (recipeCard.id != null) {
          var key = 'online_choice_' + balancer;
          var choices = parseMaybeObject(Lampa.Storage.get(key, '{}'), {});
          var choice = choices[recipeCard.id] || {};
          choice.season = Number(selection.season_index != null ? selection.season_index : selection.season || 0);
          choice.voice = Number(selection.voice_index || 0);
          if (selection.voice_name) choice.voice_name = String(selection.voice_name);
          if (Number(selection.season || 0) > 0 && Number(selection.episode || 0) > 0) {
            if (!choice.episodes_view || _typeof(choice.episodes_view) !== 'object') choice.episodes_view = {};
            choice.episodes_view[Number(selection.season)] = Number(selection.episode);
          }
          // voice_url is intentionally not restored: Lampac can locate the voice by its stable name.
          delete choice.voice_url;
          choices[recipeCard.id] = choice;
          Lampa.Storage.set(key, choices);
        }
      }
    }
    function onlinePlayerMode() {
      try {
        if (Lampa.Storage.field) return String(Lampa.Storage.field('player') || 'inner');
      } catch (_) {}
      return String(Lampa.Storage.get('player', 'inner') || 'inner');
    }
    function onlineHeaders() {
      var key = String(Lampa.Storage.get('aesgcmkey', '') || '');
      return key ? {
        'X-Kit-AesGcm': key
      } : {};
    }
    function addUrlPart(url, part) {
      if (!part) return url;
      try {
        if (Lampa.Utils && Lampa.Utils.addUrlComponent) return Lampa.Utils.addUrlComponent(url, part);
      } catch (_) {}
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + part;
    }
    function hasQueryParam(url, name) {
      return new RegExp('(?:[?&])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=').test(String(url || ''));
    }
    function onlineAccountUrl(url) {
      url = String(url || '');
      var account = parseMaybeObject(Lampa.Storage.get('account', '{}'), {});
      var email = String(Lampa.Storage.get('account_email', '') || account.email || '');
      var uid = String(Lampa.Storage.get('lampac_unic_id', '') || '');
      var nwsId = String(Lampa.Storage.get('lampac_nws_id', '') || '');
      if (email && !hasQueryParam(url, 'account_email')) url = addUrlPart(url, 'account_email=' + encodeURIComponent(email));
      if (uid && !hasQueryParam(url, 'uid')) url = addUrlPart(url, 'uid=' + encodeURIComponent(uid));
      if (nwsId && !hasQueryParam(url, 'nws_id')) url = addUrlPart(url, 'nws_id=' + encodeURIComponent(nwsId));
      return url;
    }
    function forceRjson(url) {
      url = String(url || '');
      if (!url) return url;
      if (/[?&]rjson=(?:true|false|0|1)/i.test(url)) {
        return url.replace(/([?&]rjson=)(?:true|false|0|1)/ig, '$1true');
      }
      return addUrlPart(url, 'rjson=true');
    }
    function absoluteOnlineUrl(origin, url) {
      url = String(url || '');
      if (!url) return '';
      try {
        return new URL(url, String(origin || '').replace(/\/+$/, '') + '/').toString();
      } catch (_) {
        return url;
      }
    }
    function onlineRequestParams(url, card) {
      card = card || {};
      var mediaIsTv = String(card.type || '').toLowerCase() === 'tv' || !!card.name || !!card.first_air_date;
      var sourceName = card.source || 'tmdb';
      var title = card.title || card.name || '';
      var originalTitle = card.original_title || card.original_name || '';
      var date = card.release_date || card.first_air_date || '';
      var args = [];
      if (card.id != null && String(card.id) !== '') args.push('id=' + encodeURIComponent(card.id));
      if (card.imdb_id) args.push('imdb_id=' + encodeURIComponent(card.imdb_id));
      if (card.kinopoisk_id || card.kp_id) args.push('kinopoisk_id=' + encodeURIComponent(card.kinopoisk_id || card.kp_id));
      if (card.tmdb_id) args.push('tmdb_id=' + encodeURIComponent(card.tmdb_id));
      args.push('title=' + encodeURIComponent(title));
      args.push('original_title=' + encodeURIComponent(originalTitle));
      args.push('serial=' + (mediaIsTv ? 1 : 0));
      args.push('original_language=' + encodeURIComponent(card.original_language || ''));
      args.push('year=' + encodeURIComponent(String(date || '0000').slice(0, 4)));
      args.push('source=' + encodeURIComponent(sourceName));
      args.push('clarification=0');
      args.push('similar=false');
      try {
        var accountEmail = String(Lampa.Storage.get('account_email', '') || '');
        if (accountEmail) args.push('cub_id=' + encodeURIComponent(Lampa.Utils.hash ? Lampa.Utils.hash(accountEmail) : accountEmail));
      } catch (_) {}
      args.forEach(function (part) {
        url = addUrlPart(url, part);
      });
      return url;
    }
    function decodeOnlineJson(value) {
      if (value && _typeof(value) === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (_) {}
      }
      return null;
    }
    function onlineGet(url, success, error, jsonMode) {
      var network = new Lampa.Reguest();
      try {
        network.timeout(12000);
      } catch (_) {}
      var finalUrl = onlineAccountUrl(url);
      var logUrl = safeUrlForLog(finalUrl);
      log('online request', jsonMode ? 'json' : 'text', logUrl);
      network["native"](finalUrl, function (result) {
        var decoded = decodeOnlineJson(result);
        var value = decoded != null ? decoded : result;
        log('online response', logUrl, summarizeOnlineResponse(value));
        if (jsonMode && decoded == null) {
          if (error) error(new Error('Lampac returned non-JSON response'));
          return;
        }
        if (success) success(value);
      }, function (err) {
        log('online request failed', logUrl, err && (err.stack || err.message) || err);
        if (error) error(err || new Error('Lampac request failed'));
      }, false, {
        dataType: jsonMode ? 'json' : 'text',
        headers: onlineHeaders()
      });
    }
    function onlineBalancerName(item) {
      item = item || {};
      var name = String(item.balanser || item.name || '').trim();
      if (!item.balanser) name = name.split(' ')[0];
      return name.toLowerCase();
    }
    function chooseOnlineBalancer(events, wanted) {
      var list = Array.isArray(events) ? events : events && Array.isArray(events.online) ? events.online : [];
      var target = String(wanted || '').toLowerCase();
      var visible = list.filter(function (item) {
        return item && item.show !== false;
      });
      return visible.filter(function (item) {
        return onlineBalancerName(item) === target;
      })[0] || visible[0] || null;
    }
    function rchHostKey(origin) {
      return String(origin || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
    function runOnlineRch(origin, json, success, error) {
      var key = rchHostKey(origin);
      function invoke() {
        try {
          window.nwsClient = window.nwsClient || {};
          var registry = window.rch_nws && window.rch_nws[key];
          if (!registry || typeof registry.Registry !== 'function') throw new Error('RCH registry unavailable');
          var client = window.nwsClient[key];
          if (client && client.connectionId != null) return success();
          if (client && typeof client.reconnect === 'function') return client.reconnect(success);
          if (typeof NativeWsClient === 'undefined') throw new Error('NativeWsClient unavailable');
          client = window.nwsClient[key] = new NativeWsClient(json.nws, {
            autoReconnect: true
          });
          client.on('Connected', function () {
            registry.Registry(client, success);
          });
          client.connect();
        } catch (e) {
          if (error) error(e);
        }
      }
      if (typeof NativeWsClient === 'undefined') {
        try {
          Lampa.Utils.putScript([String(origin).replace(/\/+$/, '') + '/js/nws-client-es5.js?v21042026'], function () {}, false, invoke, true);
        } catch (e) {
          if (error) error(e);
        }
      } else invoke();
    }
    function normalizeOnlineItem(item) {
      item = item || {};
      var out = {};
      Object.keys(item).forEach(function (key) {
        out[key] = item[key];
      });
      if (out.season == null && out.s != null) out.season = Number(out.s) || 0;
      if (out.episode == null && out.e != null) out.episode = Number(out.e) || 0;
      if (!out.title) out.title = out.name || out.translate || '';
      if (!out.voice_name && out.translate) out.voice_name = out.translate;
      return out;
    }
    function chooseSeason(data, selection) {
      data = Array.isArray(data) ? data : [];
      selection = selection || {};
      var wantedSeason = Number(selection.season || 0);
      var exact = wantedSeason > 0 ? data.filter(function (item) {
        return Number(item && (item.id != null ? item.id : item.s)) === wantedSeason;
      })[0] : null;
      if (exact) return exact;
      var idx = Number(selection.season_index || 0);
      return data[idx] || data[0] || null;
    }
    function chooseVoice(voices, selection) {
      voices = Array.isArray(voices) ? voices : [];
      selection = selection || {};
      var wanted = String(selection.voice_name || '').trim().toLowerCase();
      var byName = wanted ? voices.filter(function (voice) {
        return String(voice && (voice.name || voice.title || '')).trim().toLowerCase() === wanted;
      })[0] : null;
      if (byName) return byName;
      var idx = Number(selection.voice_index || 0);
      return voices[idx] || voices.filter(function (voice) {
        return voice && voice.active;
      })[0] || voices[0] || null;
    }
    function choosePlayableItem(data, record) {
      data = Array.isArray(data) ? data.map(normalizeOnlineItem) : [];
      var selection = record && record.source && record.source.selection || {};
      var media = record && record.media || {};
      var isTv = String(media.type || '').toLowerCase() === 'tv';
      if (isTv) {
        var season = Number(selection.season || media.season || 0);
        var episode = Number(selection.episode || media.episode || 0);
        var exact = data.filter(function (item) {
          var seasonOk = !season || !Number(item.season || 0) || Number(item.season || 0) === season;
          return seasonOk && Number(item.episode || 0) === episode;
        })[0];
        if (exact) return {
          item: exact,
          items: data
        };
        if (episode > 0 && data[episode - 1]) return {
          item: data[episode - 1],
          items: data
        };
      } else {
        var wantedVoice = String(selection.voice_name || '').trim().toLowerCase();
        if (wantedVoice) {
          var voiceMatch = data.filter(function (item) {
            return [item.voice_name, item.translate, item.details, item.title].some(function (value) {
              return String(value || '').toLowerCase().indexOf(wantedVoice) >= 0;
            });
          })[0];
          if (voiceMatch) return {
            item: voiceMatch,
            items: data
          };
        }
      }
      return {
        item: data[0] || null,
        items: data
      };
    }
    function resolveOnlineListing(url, origin, record, depth, success, error) {
      depth = depth || 0;
      if (depth > 8) return error && error(new Error('Lampac resolver chain is too deep'));
      var listingUrl = forceRjson(absoluteOnlineUrl(origin, url));
      log('listing step', {
        depth: depth,
        url: safeUrlForLog(listingUrl)
      });
      onlineGet(listingUrl, function (response) {
        log('listing step response', {
          depth: depth,
          response: summarizeOnlineResponse(response)
        });
        if (!response || response.accsdb) return error && error(new Error('Lampac resolver unavailable'));
        if (response.rch) {
          return runOnlineRch(origin, response, function () {
            resolveOnlineListing(url, origin, record, depth + 1, success, error);
          }, error);
        }
        var type = String(response.type || '').toLowerCase();
        var selection = record.source && record.source.selection || {};
        if (type === 'season') {
          var season = chooseSeason(response.data, selection);
          if (!season || !season.url) return error && error(new Error('Saved season was not found'));
          return resolveOnlineListing(season.url, origin, record, depth + 1, success, error);
        }
        var voice = chooseVoice(response.voice, selection);
        if (voice && voice.url && voice.active === false) {
          return resolveOnlineListing(voice.url, origin, record, depth + 1, success, error);
        }
        var chosen = choosePlayableItem(response.data, record);
        if (!chosen.item) return error && error(new Error('Saved episode/movie was not found'));
        success({
          response: response,
          item: chosen.item,
          items: chosen.items
        });
      }, error, true);
    }
    function orUrlReserve(data) {
      if (data && typeof data.url === 'string' && data.url.indexOf(' or ') !== -1) {
        var urls = data.url.split(' or ');
        data.url = urls[0];
        data.url_reserve = urls[1];
      }
      return data;
    }
    function setOnlineDefaultQuality(data) {
      if (!data || !data.quality || _typeof(data.quality) !== 'object') return data;
      var wanted = 0;
      try {
        wanted = parseInt(Lampa.Storage.field('video_quality_default'), 10) || 0;
      } catch (_) {}
      Object.keys(data.quality).forEach(function (label) {
        var value = data.quality[label];
        if (typeof value === 'string' && value.indexOf(' or ') !== -1) data.quality[label] = value.split(' or ')[0];
        if (wanted && parseInt(label, 10) === wanted) data.url = data.quality[label];
      });
      return orUrlReserve(data);
    }
    function onlineTimelineForItem(file, record, selected) {
      file = normalizeOnlineItem(file);
      if (selected && record && record.timeline_hash) {
        try {
          if (Lampa.Timeline && Lampa.Timeline.view) return Lampa.Timeline.view(String(record.timeline_hash));
        } catch (_) {}
        return {
          hash: String(record.timeline_hash),
          time: 0,
          duration: 0,
          percent: 0
        };
      }
      if (file.timeline && _typeof(file.timeline) === 'object') return file.timeline;
      var card = record && record.source && record.source.card || {};
      var originalTitle = card.original_title || card.original_name || card.title || card.name || record && record.media && record.media.title || '';
      var season = Number(file.season || 0);
      var episode = Number(file.episode || 0);
      var raw = season ? [season, season > 10 ? ':' : '', episode, originalTitle].join('') : originalTitle;
      var hash = raw;
      try {
        if (Lampa.Utils && Lampa.Utils.hash) hash = Lampa.Utils.hash(raw);
      } catch (_) {}
      try {
        if (Lampa.Timeline && Lampa.Timeline.view) return Lampa.Timeline.view(hash);
      } catch (_) {}
      return {
        hash: String(hash),
        time: 0,
        duration: 0,
        percent: 0
      };
    }
    function toOnlinePlayElement(file, record, selected) {
      file = normalizeOnlineItem(file);
      return {
        title: file.title || file.name || '',
        url: file.url,
        quality: file.quality,
        timeline: onlineTimelineForItem(file, record, !!selected),
        subtitles: file.subtitles,
        segments: file.segments,
        season: Number(file.season || 0),
        episode: Number(file.episode || 0),
        voice_name: file.voice_name || '',
        thumbnail: file.thumbnail,
        hls_manifest_timeout: file.hls_manifest_timeout
      };
    }
    function resolveOnlineFile(file, origin, success, error, rchRetried) {
      file = normalizeOnlineItem(file);
      var mode = onlinePlayerMode();
      try {
        if (mode !== 'inner' && file.stream && Lampa.Platform && Lampa.Platform.is && Lampa.Platform.is('apple')) {
          var appleFile = normalizeOnlineItem(file);
          appleFile.method = 'play';
          appleFile.url = file.stream;
          return success(appleFile, {});
        }
      } catch (_) {}
      if (file.method === 'play' || !file.method) return success(file, {});
      if (!file.url) return error && error(new Error('Episode resolver URL is empty'));
      var resolverUrl = absoluteOnlineUrl(origin, file.url);
      log('file resolver', {
        method: file.method,
        season: file.season,
        episode: file.episode,
        url: safeUrlForLog(resolverUrl)
      });
      onlineGet(resolverUrl, function (json) {
        if (typeof json === 'string' && /^https?:\/\//i.test(json.trim())) json = {
          url: json.trim()
        };
        log('file resolver response', summarizeOnlineResponse(json));
        if (!json) return error && error(new Error('Episode resolver returned empty response'));
        if (json.rch) {
          if (rchRetried) return error && error(new Error('RCH resolver did not become ready'));
          return runOnlineRch(origin, json, function () {
            resolveOnlineFile(file, origin, success, error, true);
          }, error);
        }
        success(json, json);
      }, error, true);
    }
    function loadOnlineSubtitles(url, origin) {
      if (!url) return;
      onlineGet(absoluteOnlineUrl(origin, url), function (subs) {
        try {
          if (Lampa.Player.subtitles) Lampa.Player.subtitles(subs);
        } catch (_) {}
      }, function () {}, true);
    }
    function launchResolvedOnline(record, origin, resolved) {
      var selected = resolved.item;
      var items = resolved.items || [selected];
      resolveOnlineFile(selected, origin, function (stream, streamMeta) {
        if (!stream || !stream.url) {
          log('resolved stream has no url', {
            stream: summarizeOnlineResponse(stream),
            selected: {
              method: selected && selected.method,
              season: selected && selected.season,
              episode: selected && selected.episode,
              has_url: !!(selected && selected.url),
              has_stream: !!(selected && selected.stream)
            }
          });
          notify('Lampac Resume: источник не вернул ссылку на видео');
          return;
        }
        var first = toOnlinePlayElement(selected, record, true);
        first.url = stream.url;
        first.headers = streamMeta.headers || stream.headers || selected.headers;
        first.quality = streamMeta.quality || stream.quality || selected.quality;
        first.segments = streamMeta.segments || stream.segments || selected.segments;
        first.hls_manifest_timeout = streamMeta.hls_manifest_timeout || stream.hls_manifest_timeout || selected.hls_manifest_timeout;
        first.subtitles = stream.subtitles || selected.subtitles;
        first.subtitles_call = streamMeta.subtitles_call || stream.subtitles_call || selected.subtitles_call;
        if (stream.vast) first.vast = stream.vast;
        setOnlineDefaultQuality(first);
        Core.applyResumeTimeline(first, record);
        var playlist = [];
        var mode = onlinePlayerMode();
        items.forEach(function (raw) {
          var elem = normalizeOnlineItem(raw);
          var same = Number(elem.season || 0) === Number(first.season || 0) && Number(elem.episode || 0) === Number(first.episode || 0);
          if (!first.episode && !elem.episode && raw === selected) same = true;
          if (same) {
            playlist.push(first);
            return;
          }
          var cell = toOnlinePlayElement(elem, record, false);
          if (elem.method === 'call') {
            if (mode !== 'inner') {
              cell.url = elem.stream || '';
              delete cell.quality;
            } else {
              cell.url = function (call) {
                resolveOnlineFile(elem, origin, function (fresh, freshMeta) {
                  if (fresh && fresh.url) {
                    cell.url = fresh.url;
                    cell.quality = freshMeta.quality || fresh.quality || elem.quality;
                    cell.segments = freshMeta.segments || fresh.segments || elem.segments;
                    cell.subtitles = fresh.subtitles || elem.subtitles;
                    setOnlineDefaultQuality(cell);
                  } else cell.url = '';
                  call();
                }, function () {
                  cell.url = '';
                  call();
                });
              };
            }
          } else {
            cell.url = elem.url;
          }
          setOnlineDefaultQuality(cell);
          playlist.push(cell);
        });
        if (!playlist.length) playlist.push(first);
        if (playlist.length > 1) first.playlist = playlist;
        first.isonline = true;
        pendingResumeRecord = record;
        Lampa.Player.play(first);
        if (Lampa.Player.playlist) Lampa.Player.playlist(playlist);
        if (first.subtitles_call) loadOnlineSubtitles(first.subtitles_call, origin);
        log('online resume launched', record.key, mode, first.season, first.episode);
      }, function (err) {
        log('online file resolve failed', err);
        notify('Lampac Resume: не удалось получить свежую ссылку для серии');
      });
    }
    function persistOnlineRecipe(record) {
      if (!record || !record.key) return;
      var db = loadDb();
      if (!db.items[record.key]) return;
      db.items[record.key] = record;
      saveDb(db);
    }
    function ensureOnlineExternalIds(record, origin, callback) {
      var source = record && record.source || {};
      var card = source.card || {};
      var hasImdb = !!card.imdb_id;
      var hasKp = !!(card.kinopoisk_id || card.kp_id);
      if (hasImdb && hasKp) {
        log('externalids already present', {
          imdb_id: card.imdb_id,
          kinopoisk_id: card.kinopoisk_id || card.kp_id
        });
        callback(card);
        return;
      }
      if (card.id == null || String(card.id) === '') {
        log('externalids skipped: card id is missing');
        callback(card);
        return;
      }
      var isTv = String(card.type || '').toLowerCase() === 'tv' || !!card.name || !!card.first_air_date;
      var query = ['id=' + encodeURIComponent(card.id), 'serial=' + (isTv ? 1 : 0)];
      if (card.imdb_id) query.push('imdb_id=' + encodeURIComponent(card.imdb_id));
      if (card.kinopoisk_id || card.kp_id) query.push('kinopoisk_id=' + encodeURIComponent(card.kinopoisk_id || card.kp_id));
      var url = String(origin || '').replace(/\/+$/, '') + '/externalids?' + query.join('&');
      log('externalids refresh', {
        card_id: card.id,
        need_imdb: !hasImdb,
        need_kp: !hasKp
      });
      onlineGet(url, function (ids) {
        if (ids && _typeof(ids) === 'object') {
          Object.keys(ids).forEach(function (key) {
            if (ids[key] !== undefined && ids[key] !== null && ids[key] !== '') card[key] = ids[key];
          });
          source.card = Core.sanitizeObject(card);
          record.source = source;
          if (record.media) {
            if (!record.media.imdb_id && card.imdb_id) record.media.imdb_id = card.imdb_id;
            if (!record.media.kinopoisk_id && (card.kinopoisk_id || card.kp_id)) {
              record.media.kinopoisk_id = card.kinopoisk_id || card.kp_id;
            }
          }
          persistOnlineRecipe(record);
        }
        log('externalids result', {
          imdb_id: card.imdb_id || '',
          kinopoisk_id: card.kinopoisk_id || card.kp_id || ''
        });
        callback(card);
      }, function (err) {
        log('externalids refresh failed; continuing with saved ids', err && (err.stack || err.message) || err);
        callback(card);
      }, true);
    }
    function beginOnlineResolver(record) {
      var source = record.source || {};
      var card = source.card || {};
      var origin = String(source.server_origin || '').replace(/\/+$/, '');
      if (!origin) {
        try {
          origin = String(window.location && window.location.origin || '').replace(/\/+$/, '');
        } catch (_) {}
      }
      if (!origin) return false;
      if (!source.server_origin) {
        source.server_origin = origin;
        record.source = Core.sanitizeObject(source);
        var originDb = loadDb();
        if (record.key && originDb.items[record.key]) {
          originDb.items[record.key] = record;
          saveDb(originDb);
        }
      }
      log('online resume begin', {
        key: record.key,
        origin: origin,
        balancer: source.balancer || '',
        card_id: card.id,
        tmdb_id: card.tmdb_id || '',
        imdb_id: card.imdb_id || '',
        kinopoisk_id: card.kinopoisk_id || card.kp_id || '',
        selection: source.selection || {},
        player: onlinePlayerMode()
      });
      ensureOnlineExternalIds(record, origin, function (freshCard) {
        card = freshCard || card;
        source.card = Core.sanitizeObject(card);
        record.source = source;
        persistOnlineRecipe(record);
        var eventsUrl = onlineRequestParams(origin + '/lite/events?life=true', card);
        function useEvents(events, attempts) {
          var chosen = chooseOnlineBalancer(events, source.balancer);
          log('events evaluated', {
            attempts: attempts,
            wanted: source.balancer || '',
            chosen: chosen ? onlineBalancerName(chosen) : '',
            response: summarizeOnlineResponse(events)
          });
          if (chosen && chosen.url) {
            Lampa.Storage.set('online_balanser', onlineBalancerName(chosen));
            Lampa.Storage.set('active_balanser', onlineBalancerName(chosen));
            var providerUrl = onlineRequestParams(absoluteOnlineUrl(origin, chosen.url), card);
            log('provider selected', onlineBalancerName(chosen), safeUrlForLog(providerUrl));
            resolveOnlineListing(providerUrl, origin, record, 0, function (resolved) {
              log('listing resolved', {
                item: resolved && resolved.item ? {
                  method: resolved.item.method,
                  season: resolved.item.season,
                  episode: resolved.item.episode,
                  has_url: !!resolved.item.url,
                  has_stream: !!resolved.item.stream
                } : null,
                playlist: resolved && resolved.items ? resolved.items.length : 0
              });
              launchResolvedOnline(record, origin, resolved);
            }, function (err) {
              log('online listing resolve failed', err && (err.stack || err.message) || err);
              notify('Lampac Resume: не удалось восстановить серию у источника');
            });
            return;
          }
          if (events && events.life && events.memkey && attempts < 15) {
            setTimeout(function () {
              var lifeUrl = onlineRequestParams(origin + '/lifeevents?memkey=' + encodeURIComponent(events.memkey), card);
              onlineGet(lifeUrl, function (next) {
                useEvents(next, attempts + 1);
              }, function (err) {
                log('lifeevents failed', err && (err.stack || err.message) || err);
                notify('Lampac Resume: балансер не ответил');
              }, true);
            }, 1000);
            return;
          }
          log('saved balancer unavailable', source.balancer || '');
          notify('Lampac Resume: сохранённый балансер недоступен');
        }
        onlineGet(eventsUrl, function (events) {
          useEvents(events, 0);
        }, function (err) {
          log('events request failed', err && (err.stack || err.message) || err);
          notify('Lampac Resume: сервер источников недоступен');
        }, true);
      });
      return true;
    }
    function resumeOnline(record) {
      var source = record.source || {};
      var card = source.card || {};
      if (!card || !card.id) {
        notify('Lampac Resume: в записи нет идентификатора карточки');
        return false;
      }
      restoreOnlineChoice(record);
      return beginOnlineResolver(record);
    }
    function resumeTorrent(record) {
      var source = record.source || {};
      var base = normalizeTorrServerBase(source.torrserver_base || '') || torrServerBase();
      var fresh = Core.buildTorrServerStreamUrl(base, source);
      if (!fresh) {
        notify('Lampac Resume: не удалось построить TorrServer URL из hash/index');
        return false;
      }
      function launch(timecodeSeconds) {
        var merged = Core.chooseProgress(record.progress, timecodeSeconds);
        if (merged) record.progress = merged;
        var play = {
          url: fresh,
          title: source.play_title || record.media && record.media.title || source.file_name || 'Torrent',
          season: record.media && record.media.season || source.season || 0,
          episode: record.media && record.media.episode || source.episode || 0,
          torrent_hash: source.info_hash,
          file_index: source.file_index,
          timeline: {
            hash: record.timeline_hash || record.key,
            time: Number(record.progress && record.progress.position_ms || 0) / 1000,
            duration: Number(record.progress && record.progress.duration_ms || 0) / 1000,
            percent: Number(record.progress && record.progress.percent || 0)
          }
        };
        pendingResumeRecord = record;
        Lampa.Player.play(play);
        if (Lampa.Player.playlist) Lampa.Player.playlist([play]);
        log('torrent resume launched', {
          key: record.key,
          hash: source.info_hash,
          file_index: source.file_index,
          season: play.season,
          episode: play.episode,
          time: play.timeline.time,
          base: safeUrlForLog(base)
        });
      }
      pullTorrServerViewed(record, function (seconds) {
        launch(seconds || 0);
      });
      return true;
    }
    function latestRecord() {
      var db = loadDb();
      var rows = Object.keys(db.items).map(function (key) {
        return db.items[key];
      }).filter(function (record) {
        return !record.profile_id || String(record.profile_id) === profileId();
      });
      rows.sort(function (a, b) {
        return Number(b.updated_at || 0) - Number(a.updated_at || 0);
      });
      return rows[0] || null;
    }
    function findRecord(recordOrKey) {
      if (recordOrKey && _typeof(recordOrKey) === 'object' && recordOrKey.key) return recordOrKey;
      var db = loadDb();
      if (typeof recordOrKey === 'string') return db.items[recordOrKey] || null;
      return latestRecord();
    }
    function resume(recordOrKey) {
      var record = findRecord(recordOrKey);
      if (!record) {
        notify('Lampac Resume: сохранённого просмотра нет');
        return false;
      }
      var adapterName = record.source && record.source.adapter;
      if (adapterName && adapters[adapterName] && typeof adapters[adapterName].resume === 'function') {
        return adapters[adapterName].resume(record);
      }
      if (record.source && record.source.kind === 'torrent') return resumeTorrent(record);
      if (record.source && record.source.kind === 'online') return resumeOnline(record);
      notify('Lampac Resume: для этого источника нет адаптера восстановления');
      return false;
    }
    function getRecord(media) {
      var db = loadDb();
      if (!media) return currentSession ? db.items[currentSession.key] || null : latestRecord();
      var key = typeof media === 'string' ? media : scopedMediaKey(media);
      if (typeof media === 'string' && !db.items[key]) key = 'p:' + profileId() + '|' + media;
      return db.items[key] || null;
    }
    function listRecords() {
      var db = loadDb();
      return Object.keys(db.items).map(function (key) {
        return db.items[key];
      }).filter(function (record) {
        return !record.profile_id || String(record.profile_id) === profileId();
      }).sort(function (a, b) {
        return Number(b.updated_at || 0) - Number(a.updated_at || 0);
      });
    }
    function resumeRecordForCard(card) {
      return Core.findLatestResumeForCard(listRecords(), card || {}, profileId(), MIN_RESUME_MS, COMPLETION_PERCENT);
    }
    function makeResumeButton(record) {
      var btn = $('<div class="full-start__button selector lampac-resume--button" data-subtitle="Lampac Resume">' + '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' + '<path fill="currentColor" d="M8 5v14l11-7z"></path></svg><span></span></div>');
      btn.find('span').text(Core.resumeButtonLabel(record));
      btn.on('hover:enter', function () {
        log('button clicked', {
          key: record.key,
          source: record.source && record.source.kind
        });
        resume(record.key);
      });
      return btn;
    }
    function renderResumeButton(event) {
      if (!event) return;
      var card = event.data && event.data.movie ? event.data.movie : currentCard();
      if (card && _typeof(card) === 'object' && (card.id != null || card.tmdb_id || card.imdb_id || card.kinopoisk_id || card.title || card.name)) {
        lastKnownCard = card;
      }
      if (event.type !== 'complite') {
        log('full event', event.type || 'unknown', {
          card_id: card && card.id
        });
        return;
      }
      if (!card || !card.id && !card.tmdb_id && !card.imdb_id && !card.kinopoisk_id && !card.title && !card.name) {
        log('button skip: full card identity missing');
        return;
      }
      var root = null;
      try {
        root = event.object && event.object.activity && event.object.activity.render ? event.object.activity.render() : null;
      } catch (e) {
        log('button root error', e && e.message || e);
      }
      if (!root || !root.find) {
        log('button skip: full-card root unavailable', {
          card_id: card.id
        });
        return;
      }
      lastFullContext = {
        event: event,
        card: card,
        root: root
      };
      var oldButton = root.find('.lampac-resume--button');
      if (oldButton && oldButton.length && oldButton.remove) oldButton.remove();
      var record = resumeRecordForCard(card);
      if (!record) {
        log('button skip: no resumable record', {
          card_id: card.id,
          records: listRecords().length
        });
        return;
      }
      var anchor = root.find('.view--online');
      var anchorName = '.view--online';
      if (!anchor || !anchor.length) {
        anchor = root.find('.view--torrent');
        anchorName = '.view--torrent';
      }
      if (!anchor || !anchor.length) {
        anchor = root.find('.full-start__button');
        anchorName = '.full-start__button';
      }
      if (!anchor || !anchor.length) {
        log('button skip: anchor not found', {
          card_id: card.id
        });
        return;
      }
      if (anchor.first) anchor = anchor.first();
      var btn = makeResumeButton(record);
      if (anchor.after) anchor.after(btn);
      log('button rendered', {
        card_id: card.id,
        key: record.key,
        anchor: anchorName,
        label: Core.resumeButtonLabel(record)
      });
    }
    function refreshCurrentCardButton(reason) {
      if (!lastFullContext || !lastFullContext.event) {
        log('button refresh skipped: no full context', reason || '');
        return;
      }
      log('button refresh', reason || 'manual', {
        card_id: lastFullContext.card && lastFullContext.card.id
      });
      try {
        renderResumeButton(lastFullContext.event);
      } catch (e) {
        log('button refresh failed', e && e.stack || e);
      }
    }
    function refreshFromActiveActivity(reason) {
      var active = null;
      try {
        if (!Lampa.Activity || typeof Lampa.Activity.active !== 'function') return false;
        active = Lampa.Activity.active();
      } catch (e) {
        log('active full probe failed', e && (e.stack || e.message) || e);
        return false;
      }
      if (!active) return false;
      var card = cardFromActiveActivity();
      if (!card) {
        log('active full probe: card unavailable', reason || '');
        return false;
      }
      var activity = null;
      var candidates = [active.activity, active.object && active.object.activity, active.component, active.object && active.object.component];
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i] && typeof candidates[i].render === 'function') {
          activity = candidates[i];
          break;
        }
      }
      if (!activity) {
        log('active full probe: renderer unavailable', {
          reason: reason || '',
          card_id: card.id
        });
        return false;
      }
      log('active full probe: rendering button', {
        reason: reason || '',
        card_id: card.id
      });
      renderResumeButton({
        type: 'complite',
        data: {
          movie: card
        },
        object: {
          activity: activity
        }
      });
      return true;
    }
    function clearRecord(media) {
      var db = loadDb();
      if (!media) {
        var pid = profileId();
        Object.keys(db.items).forEach(function (key) {
          var record = db.items[key];
          if (!record.profile_id || String(record.profile_id) === pid) delete db.items[key];
        });
        Object.keys(db.hash_map).forEach(function (hash) {
          if (!db.items[db.hash_map[hash]]) delete db.hash_map[hash];
        });
        saveDb(db);
        return true;
      }
      var key = typeof media === 'string' ? media : scopedMediaKey(media);
      if (typeof media === 'string' && !db.items[key]) key = 'p:' + profileId() + '|' + media;
      delete db.items[key];
      Object.keys(db.hash_map).forEach(function (hash) {
        if (db.hash_map[hash] === key) delete db.hash_map[hash];
      });
      saveDb(db);
      return true;
    }
    function attachRecipe(recipe) {
      pendingRecipe = Core.sanitizeObject(recipe || {});
      return !!pendingRecipe;
    }
    function registerAdapter(name, adapter) {
      if (!name || !adapter) return false;
      adapters[String(name)] = adapter;
      return true;
    }
    function debugState() {
      return {
        version: VERSION,
        currentSession: currentSession,
        db: loadDb(),
        torrserver_url: torrServerBase(),
        torrserver_api: torserverApiAvailable()
      };
    }
    function installListeners() {
      if (Lampa.Timeline && Lampa.Timeline.listener && Lampa.Timeline.listener.follow) {
        Lampa.Timeline.listener.follow('update', onTimelineUpdate);
      }
      if (Lampa.Player && Lampa.Player.listener && Lampa.Player.listener.follow) {
        Lampa.Player.listener.follow('create', onPlayerCreate);
        Lampa.Player.listener.follow('destroy', onPlayerDestroy);
      }
      if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('full', renderResumeButton);
      }
    }
    function normalizeStoredTorrServerUrl() {
      var raw = String(Lampa.Storage.get('torrserver_url', '') || '');
      if (!raw) return;
      var normalized = normalizeTorrServerBase(raw);
      if (normalized && normalized !== raw) {
        try {
          Lampa.Storage.set('torrserver_url', normalized);
        } catch (_) {}
      }
    }
    adapters['lampac-online'] = {
      resume: resumeOnline
    };
    adapters['torrserver'] = {
      resume: resumeTorrent
    };
    function start() {
      if (window.lampac_resume_plugin_version === VERSION) return;
      window.lampac_resume_plugin = true;
      window.lampac_resume_plugin_version = VERSION;
      normalizeStoredTorrServerUrl();
      installPlayerPatch();
      installListeners();
      Lampa.LampacResume = {
        version: VERSION,
        get: getRecord,
        list: listRecords,
        clear: clearRecord,
        resume: resume,
        resumeForCard: resumeRecordForCard,
        refreshCardButton: renderResumeButton,
        attachRecipe: attachRecipe,
        registerAdapter: registerAdapter,
        pullTorrServer: function pullTorrServer(recordOrKey, callback) {
          var record = findRecord(recordOrKey);
          return pullTorrServerViewed(record, callback);
        },
        pushTorrServer: function pushTorrServer(recordOrKey) {
          var record = findRecord(recordOrKey);
          pushTorrServerViewed(record, true);
        },
        debug: debugState
      };
      var activeCard = cardFromActiveActivity();
      if (activeCard) lastKnownCard = activeCard;
      log('started', {
        version: VERSION,
        profile: profileId(),
        player: onlinePlayerMode(),
        active_card_id: activeCard && activeCard.id != null ? activeCard.id : ''
      });
      refreshFromActiveActivity('startup');
    }
    if (window.appready) start();else if (Lampa.Listener && Lampa.Listener.follow) {
      Lampa.Listener.follow('app', function (e) {
        if (e && e.type === 'ready') start();
      });
    } else {
      setTimeout(start, 1000);
    }
  })();

})();

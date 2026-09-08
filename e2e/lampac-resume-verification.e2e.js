const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const backend = (process.env.LAMPA_TEST_LAMPAC_URL || '').replace(/\/+$/, '');
const pages = (process.env.LAMPA_TEST_PAGES_URL || 'https://arst113.github.io/lampa-source/test/').replace(/\/+$/, '/');

function pluginSource() {
  const parts = [1, 2, 3, 4, 5].map((n) =>
    fs.readFileSync(path.join(__dirname, '..', 'spike', `lampac-resume-fixture.part${n}`), 'utf8').trim()
  ).join('');
  return zlib.gunzipSync(Buffer.from(parts, 'base64')).toString('utf8');
}

async function openLab(page) {
  const target = pages + '?lampac=' + encodeURIComponent(backend);
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  expect(response && response.ok()).toBeTruthy();
  await page.waitForFunction(() => window.appready === true && typeof window.Lampa !== 'undefined', null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__LAMPA_TEST_PROFILE__ && window.__LAMPA_TEST_PROFILE__.lampacInit === 'loaded', null, { timeout: 45_000 });
}

async function installResume(page, card) {
  await page.evaluate(({ card }) => {
    Lampa.Storage.set('lampac_resume_v1', { version: 1, items: {}, hash_map: {} });
    Lampa.Storage.set('lampac_profile_id', 'resume-spike');
    Lampa.Storage.set('activity', { movie: card });
    window.__resumeCard = card;
    window.__resumePlayCalls = [];
    window.__resumePlaylistCalls = [];
    Lampa.Player.play = function (data) {
      window.__resumePlayCalls.push({
        title: data && data.title,
        url: data && data.url,
        season: Number(data && data.season || 0),
        episode: Number(data && data.episode || 0),
        isonline: !!(data && data.isonline),
        timeline: data && data.timeline ? {
          hash: data.timeline.hash,
          time: Number(data.timeline.time || 0),
          duration: Number(data.timeline.duration || 0),
          percent: Number(data.timeline.percent || 0)
        } : null
      });
      return data;
    };
    Lampa.Player.playlist = function (items) {
      window.__resumePlaylistCalls.push(Array.isArray(items) ? items.length : 0);
      return items;
    };
  }, { card });
  await page.addScriptTag({ content: pluginSource() });
  await page.waitForFunction(() => Lampa.LampacResume && Lampa.LampacResume.version === '0.2.2');
}

function noTransientKeys(record) {
  const forbidden = /^(url|urls|link|links|stream|streams|headers?|cookies?|token|access_token|authorization|quality_urls?|playlist_url|hls|hls_url|manifest_url)$/i;
  const secret = /pass(word)?|secret|bearer|auth[_-]?token|session[_-]?id/i;
  function walk(value, depth = 0) {
    if (depth > 12 || value == null) return true;
    if (Array.isArray(value)) return value.every((x) => walk(x, depth + 1));
    if (typeof value !== 'object') return true;
    return Object.keys(value).every((key) => !forbidden.test(key) && !secret.test(key) && walk(value[key], depth + 1));
  }
  return walk(record);
}

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required');

test('capture + persisted recipe + Continue UI works in real Lampa', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await openLab(page);
  const card = {
    id: 550, tmdb_id: 550, source: 'tmdb', type: 'movie',
    title: 'Resume Spike Fixture', original_title: 'Resume Spike Fixture',
    release_date: '1999-10-15', original_language: 'en'
  };
  await installResume(page, card);

  const captured = await page.evaluate(({ backend }) => {
    Lampa.Storage.set('active_balanser', 'fixture');
    Lampa.Storage.set('online_balanser', 'fixture');
    Lampa.Player.play({
      title: 'Resume Spike Fixture', url: backend + '/fixture-media.m3u8',
      isonline: true, voice_name: 'Fixture Voice',
      timeline: { hash: 'resume-spike-movie', time: 0, duration: 0, percent: 0 }
    });
    return Lampa.LampacResume.list()[0];
  }, { backend });

  expect(captured.source.kind).toBe('online');
  expect(captured.source.adapter).toBe('lampac-online');
  expect(captured.source.balancer).toBe('fixture');
  expect(captured.source.server_origin).toBe(backend);
  expect(noTransientKeys(captured)).toBeTruthy();

  const ui = await page.evaluate(() => {
    const record = Lampa.LampacResume.list()[0];
    const db = Lampa.LampacResume.debug().db;
    db.items[record.key].progress = { position_ms: 65000, duration_ms: 100000, percent: 65, completed: false };
    db.items[record.key].updated_at = Date.now();
    Lampa.Storage.set('lampac_resume_v1', db);
    const root = $('<div><div class="full-start__button view--online"><span>Online</span></div></div>');
    Lampa.LampacResume.refreshCardButton({
      type: 'complite', data: { movie: window.__resumeCard },
      object: { activity: { render: function () { return root; } } }
    });
    return { count: root.find('.lampac-resume--button').length, label: root.find('.lampac-resume--button span').text() };
  });
  expect(ui.count).toBe(1);
  expect(ui.label).toBe('Продолжить · 01:05');
  expect(pageErrors).toEqual([]);
});

test('saved Online recipe resolves exact season/voice/episode and fresh stream', async ({ page }) => {
  const requests = [];
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== backend) return route.continue();
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname === '/externalids') { requests.push('/externalids'); return json({ imdb_id: 'tt0903747', kinopoisk_id: '404900' }); }
    if (url.pathname === '/lite/events') { requests.push('/lite/events'); return json({ online: [{ balanser: 'fixture', show: true, url: '/fixture-provider' }] }); }
    if (url.pathname === '/fixture-provider') { requests.push('/fixture-provider'); return json({ type: 'season', data: [{ id: 2, url: '/fixture-season' }] }); }
    if (url.pathname === '/fixture-season') { requests.push('/fixture-season'); return json({ voice: [{ name: 'Fixture Dub', active: false, url: '/fixture-voice' }], data: [] }); }
    if (url.pathname === '/fixture-voice') {
      requests.push('/fixture-voice');
      return json({ data: [
        { title: 'Episode 2', season: 2, episode: 2, method: 'call', url: '/fixture-resolve-2', voice_name: 'Fixture Dub' },
        { title: 'Episode 3', season: 2, episode: 3, method: 'call', url: '/fixture-resolve-3', voice_name: 'Fixture Dub' }
      ] });
    }
    if (url.pathname === '/fixture-resolve-3') { requests.push('/fixture-resolve-3'); return json({ url: 'https://media.invalid/fresh-episode-3.m3u8', quality: { '1080p': 'https://media.invalid/fresh-episode-3.m3u8' } }); }
    if (url.pathname === '/fixture-resolve-2') { requests.push('/fixture-resolve-2'); return json({ url: 'https://media.invalid/fresh-episode-2.m3u8' }); }
    return route.continue();
  });

  await openLab(page);
  const card = {
    id: 1396, tmdb_id: 1396, source: 'tmdb', type: 'tv', name: 'Resume Spike Series',
    original_name: 'Resume Spike Series', first_air_date: '2008-01-20', original_language: 'en'
  };
  await installResume(page, card);
  const key = 'p:resume-spike|tmdb:tv:1396:s2:e3';
  await page.evaluate(({ key, card, backend }) => {
    const record = {
      key, profile_id: 'resume-spike',
      media: { type: 'tv', source: 'tmdb', id: 1396, tmdb_id: 1396, title: 'Resume Spike Series', year: '2008', season: 2, episode: 3 },
      source: { kind: 'online', adapter: 'lampac-online', balancer: 'fixture', server_origin: backend, card,
        selection: { season: 2, episode: 3, season_index: 0, voice_index: 0, voice_name: 'Fixture Dub' } },
      progress: { position_ms: 65000, duration_ms: 120000, percent: 54, completed: false },
      timeline_hash: 'resume-spike-s2e3', updated_at: Date.now()
    };
    Lampa.Storage.set('lampac_resume_v1', { version: 1, items: { [key]: record }, hash_map: { 'resume-spike-s2e3': key } });
    Lampa.LampacResume.resume(key);
  }, { key, card, backend });

  await page.waitForFunction(() => window.__resumePlayCalls.length > 0, null, { timeout: 20000 });
  const state = await page.evaluate(() => ({ play: window.__resumePlayCalls.at(-1), records: Lampa.LampacResume.list() }));
  expect(state.play.url).toBe('https://media.invalid/fresh-episode-3.m3u8');
  expect(state.play.season).toBe(2);
  expect(state.play.episode).toBe(3);
  expect(state.play.isonline).toBe(true);
  expect(state.play.timeline.time).toBe(65);
  expect(state.records.every(noTransientKeys)).toBeTruthy();
  expect(requests).toEqual(expect.arrayContaining(['/externalids', '/lite/events', '/fixture-provider', '/fixture-season', '/fixture-voice', '/fixture-resolve-3']));
  expect(requests).not.toContain('/fixture-resolve-2');
});

test('TorrServer resume keeps local progress when server TrackTimecode is unavailable', async ({ page, request }) => {
  const settingsResponse = await request.post(backend + '/ts/settings', { data: { action: 'get' }, timeout: 30000 });
  expect(settingsResponse.ok()).toBeTruthy();
  const original = await settingsResponse.json();
  const hasTrackTimecode = Object.prototype.hasOwnProperty.call(original, 'TrackTimecode');
  console.log('[resume verification] TorrServer settings keys =', Object.keys(original).sort());
  console.log('[resume verification] TrackTimecode supported =', hasTrackTimecode, 'value =', original.TrackTimecode);

  let settingsChanged = false;
  try {
    if (hasTrackTimecode && original.TrackTimecode !== true) {
      const enabled = JSON.parse(JSON.stringify(original));
      enabled.TrackTimecode = true;
      const setResponse = await request.post(backend + '/ts/settings', { data: { action: 'set', sets: enabled }, timeout: 30000 });
      expect(setResponse.ok()).toBeTruthy();
      const checkResponse = await request.post(backend + '/ts/settings', { data: { action: 'get' }, timeout: 30000 });
      const check = await checkResponse.json();
      expect(check.TrackTimecode).toBe(true);
      settingsChanged = true;
    }

    await openLab(page);
    const card = { id: 999001, source: 'tmdb', type: 'movie', title: 'Torrent Resume Fixture', release_date: '2026-01-01' };
    await installResume(page, card);
    const hash = '0123456789abcdef0123456789abcdef01234567';
    const key = 'p:resume-spike|tmdb:movie:999001';
    await page.evaluate(({ key, hash, backend }) => {
      Lampa.Storage.set('torrserver_url', backend + '/ts');
      const record = {
        key, profile_id: 'resume-spike',
        media: { type: 'movie', source: 'tmdb', id: 999001, tmdb_id: 999001, title: 'Torrent Resume Fixture', year: '2026', season: 0, episode: 0 },
        source: { kind: 'torrent', adapter: 'torrserver', info_hash: hash, file_index: 1, file_name: 'fixture.mkv', torrserver_base: backend + '/ts' },
        progress: { position_ms: 65000, duration_ms: 120000, percent: 54, completed: false },
        timeline_hash: 'torrent-resume-fixture', updated_at: Date.now()
      };
      Lampa.Storage.set('lampac_resume_v1', { version: 1, items: { [key]: record }, hash_map: { 'torrent-resume-fixture': key } });
      Lampa.LampacResume.pushTorrServer(key);
    }, { key, hash, backend });

    await page.waitForTimeout(1200);
    const pulled = await page.evaluate((key) => new Promise((resolve) => Lampa.LampacResume.pullTorrServer(key, resolve)), key);
    if (hasTrackTimecode) expect(Number(pulled)).toBe(65);
    else expect(Number(pulled || 0)).toBe(0);

    await page.evaluate((key) => Lampa.LampacResume.resume(key), key);
    await page.waitForFunction(() => window.__resumePlayCalls.length > 0, null, { timeout: 15000 });
    const state = await page.evaluate(() => ({ play: window.__resumePlayCalls.at(-1), record: Lampa.LampacResume.list()[0] }));
    const backendHost = new URL(backend).host;
    expect(state.play.url).toContain(backendHost + '/ts/stream/fixture.mkv');
    expect(state.play.url).toContain('link=0123456789abcdef0123456789abcdef01234567');
    expect(state.play.url).toContain('index=1');
    expect(state.play.timeline.time).toBe(65);
    expect(noTransientKeys(state.record)).toBeTruthy();
  } finally {
    if (settingsChanged) {
      const restore = await request.post(backend + '/ts/settings', { data: { action: 'set', sets: original }, timeout: 30000 });
      expect(restore.ok()).toBeTruthy();
      const restoredResponse = await request.post(backend + '/ts/settings', { data: { action: 'get' }, timeout: 30000 });
      const restored = await restoredResponse.json();
      expect(restored.TrackTimecode).toBe(original.TrackTimecode);
      console.log('[resume verification] restored TrackTimecode =', restored.TrackTimecode);
    }
  }
});

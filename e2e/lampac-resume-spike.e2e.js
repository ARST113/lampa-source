const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const backend = (process.env.LAMPA_TEST_LAMPAC_URL || '').replace(/\/+$/, '');
const pages = (process.env.LAMPA_TEST_PAGES_URL || 'https://arst113.github.io/lampa-source/test/').replace(/\/+$/, '/');
const results = {};

function pluginSource() {
  const parts = [1, 2, 3, 4, 5].map((n) =>
    fs.readFileSync(path.join(__dirname, '..', 'spike', `lampac-resume-fixture.part${n}`), 'utf8').trim()
  ).join('');
  return zlib.gunzipSync(Buffer.from(parts, 'base64')).toString('utf8');
}

async function openLab(page) {
  const target = pages + '?lampac=' + encodeURIComponent(backend);
  const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  expect(response && response.ok(), `Pages returned ${response && response.status()}`).toBeTruthy();
  await page.waitForFunction(() => window.appready === true && typeof window.Lampa !== 'undefined', null, { timeout: 60_000 });
  await page.waitForFunction(() => (
    window.__LAMPA_TEST_PROFILE__ &&
    window.__LAMPA_TEST_PROFILE__.mode === 'lampac' &&
    window.__LAMPA_TEST_PROFILE__.lampacInit === 'loaded'
  ), null, { timeout: 45_000 });
}

async function preparePlugin(page, card) {
  await page.evaluate(({ card }) => {
    Lampa.Storage.set('lampac_resume_v1', { version: 1, items: {}, hash_map: {} });
    Lampa.Storage.set('lampac_profile_id', 'resume-spike');
    Lampa.Storage.set('activity', { movie: card });
    window.__resumeCard = card;
    window.__resumePlayCalls = [];
    window.__resumePlaylistCalls = [];
    Lampa.Player.play = function (data) {
      window.__resumePlayCalls.push(JSON.parse(JSON.stringify(data || {})));
      return data;
    };
    Lampa.Player.playlist = function (items) {
      window.__resumePlaylistCalls.push(JSON.parse(JSON.stringify(items || [])));
      return items;
    };
  }, { card });
  await page.addScriptTag({ content: pluginSource() });
  await page.waitForFunction(() => window.Lampa && Lampa.LampacResume && Lampa.LampacResume.version === '0.2.2');
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

test('plugin installs in real Lampa, records a recipe, and renders Continue', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await openLab(page);

  const card = {
    id: 550,
    tmdb_id: 550,
    source: 'tmdb',
    type: 'movie',
    title: 'Resume Spike Fixture',
    original_title: 'Resume Spike Fixture',
    release_date: '1999-10-15',
    original_language: 'en'
  };
  await preparePlugin(page, card);

  const captured = await page.evaluate(({ backend }) => {
    Lampa.Storage.set('active_balanser', 'fixture');
    Lampa.Storage.set('online_balanser', 'fixture');
    Lampa.Player.play({
      title: 'Resume Spike Fixture',
      url: backend + '/fixture-media.m3u8',
      isonline: true,
      voice_name: 'Fixture Voice',
      timeline: { hash: 'resume-spike-movie', time: 0, duration: 0, percent: 0 }
    });
    const list = Lampa.LampacResume.list();
    return { version: Lampa.LampacResume.version, record: list[0], calls: window.__resumePlayCalls };
  }, { backend });

  expect(captured.version).toBe('0.2.2');
  expect(captured.record).toBeTruthy();
  expect(captured.record.source.kind).toBe('online');
  expect(captured.record.source.adapter).toBe('lampac-online');
  expect(captured.record.source.balanser).toBe('fixture');
  expect(captured.record.source.server_origin).toBe(backend);
  expect(noTransientKeys(captured.record)).toBeTruthy();

  const ui = await page.evaluate(() => {
    const record = Lampa.LampacResume.list()[0];
    const db = Lampa.LampacResume.debug().db;
    db.items[record.key].progress = {
      position_ms: 65_000,
      duration_ms: 100_000,
      percent: 65,
      completed: false
    };
    db.items[record.key].updated_at = Date.now();
    Lampa.Storage.set('lampac_resume_v1', db);

    const root = $('<div class="resume-spike-root"><div class="full-start__button view--online"><span>Online</span></div></div>');
    Lampa.LampacResume.refreshCardButton({
      type: 'complite',
      data: { movie: window.__resumeCard },
      object: { activity: { render: function () { return root; } } }
    });
    return {
      count: root.find('.lampac-resume--button').length,
      label: root.find('.lampac-resume--button span').text(),
      record: Lampa.LampacResume.list()[0]
    };
  });

  expect(ui.count).toBe(1);
  expect(ui.label).toBe('Продолжить · 01:05');
  expect(ui.record.progress.position_ms).toBe(65_000);
  expect(pageErrors).toEqual([]);
  results.install = { ok: true, label: ui.label, source: ui.record.source };
});

test('online resume resolves saved season, voice and episode to a fresh stream', async ({ page }) => {
  const requests = [];
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== backend) return route.continue();

    if (url.pathname === '/externalids') {
      requests.push('/externalids');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ imdb_id: 'tt0903747', kinopoisk_id: '404900' }) });
    }
    if (url.pathname === '/lite/events') {
      requests.push('/lite/events');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ online: [{ balanser: 'fixture', show: true, url: '/fixture-provider' }] })
      });
    }
    if (url.pathname === '/fixture-provider') {
      requests.push('/fixture-provider');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ type: 'season', data: [{ id: 2, url: '/fixture-season' }] })
      });
    }
    if (url.pathname === '/fixture-season') {
      requests.push('/fixture-season');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ voice: [{ name: 'Fixture Dub', active: false, url: '/fixture-voice' }], data: [] })
      });
    }
    if (url.pathname === '/fixture-voice') {
      requests.push('/fixture-voice');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { title: 'Episode 2', season: 2, episode: 2, method: 'call', url: '/fixture-resolve-2', voice_name: 'Fixture Dub' },
            { title: 'Episode 3', season: 2, episode: 3, method: 'call', url: '/fixture-resolve-3', voice_name: 'Fixture Dub' }
          ]
        })
      });
    }
    if (url.pathname === '/fixture-resolve-3') {
      requests.push('/fixture-resolve-3');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://media.invalid/fresh-episode-3.m3u8',
          quality: { '1080p': 'https://media.invalid/fresh-episode-3.m3u8' }
        })
      });
    }
    if (url.pathname === '/fixture-resolve-2') {
      requests.push('/fixture-resolve-2');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: 'https://media.invalid/fresh-episode-2.m3u8' }) });
    }
    return route.continue();
  });

  await openLab(page);
  const card = {
    id: 1396,
    tmdb_id: 1396,
    source: 'tmdb',
    type: 'tv',
    name: 'Resume Spike Series',
    original_name: 'Resume Spike Series',
    first_air_date: '2008-01-20',
    original_language: 'en'
  };
  await preparePlugin(page, card);

  const key = 'p:resume-spike|tmdb:tv:1396:s2:e3';
  await page.evaluate(({ key, card, backend }) => {
    const record = {
      key,
      profile_id: 'resume-spike',
      media: {
        type: 'tv', source: 'tmdb', id: 1396, tmdb_id: 1396,
        title: 'Resume Spike Series', year: '2008', season: 2, episode: 3
      },
      source: {
        kind: 'online', adapter: 'lampac-online', balancer: 'fixture', server_origin: backend,
        card,
        selection: { season: 2, episode: 3, season_index: 0, voice_index: 0, voice_name: 'Fixture Dub' }
      },
      progress: { position_ms: 65_000, duration_ms: 120_000, percent: 54, completed: false },
      timeline_hash: 'resume-spike-s2e3',
      updated_at: Date.now()
    };
    Lampa.Storage.set('lampac_resume_v1', {
      version: 1,
      items: { [key]: record },
      hash_map: { 'resume-spike-s2e3': key }
    });
    Lampa.LampacResume.resume(key);
  }, { key, card, backend });

  await page.waitForFunction(() => window.__resumePlayCalls && window.__resumePlayCalls.length > 0, null, { timeout: 20_000 });
  const state = await page.evaluate(() => ({
    play: window.__resumePlayCalls[window.__resumePlayCalls.length - 1],
    records: Lampa.LampacResume.list()
  }));

  expect(state.play.url).toBe('https://media.invalid/fresh-episode-3.m3u8');
  expect(state.play.season).toBe(2);
  expect(state.play.episode).toBe(3);
  expect(state.play.isonline).toBe(true);
  expect(state.play.timeline.time).toBe(65);
  expect(state.records.length).toBeGreaterThan(0);
  expect(state.records.every(noTransientKeys)).toBeTruthy();
  expect(requests).toEqual(expect.arrayContaining([
    '/externalids', '/lite/events', '/fixture-provider', '/fixture-season', '/fixture-voice', '/fixture-resolve-3'
  ]));
  expect(requests).not.toContain('/fixture-resolve-2');

  results.online = { ok: true, requests, play: state.play };
});

test('real TorrServer /viewed roundtrip works through the plugin', async ({ page, request }) => {
  const hash = '0123456789abcdef0123456789abcdef01234567';
  const direct = await request.post(backend + '/ts/viewed', {
    data: { action: 'set', hash, file_index: 1, timecode: 12 }, timeout: 30_000
  });
  expect(direct.ok(), `/ts/viewed set returned ${direct.status()}`).toBeTruthy();

  await openLab(page);
  const card = {
    id: 999001, source: 'tmdb', type: 'movie', title: 'Torrent Resume Fixture', release_date: '2026-01-01'
  };
  await preparePlugin(page, card);
  const key = 'p:resume-spike|tmdb:movie:999001';

  await page.evaluate(({ key, hash, backend }) => {
    Lampa.Storage.set('torrserver_url', backend + '/ts');
    const record = {
      key,
      profile_id: 'resume-spike',
      media: { type: 'movie', source: 'tmdb', id: 999001, tmdb_id: 999001, title: 'Torrent Resume Fixture', year: '2026', season: 0, episode: 0 },
      source: { kind: 'torrent', adapter: 'torrserver', info_hash: hash, file_index: 1, file_name: 'fixture.mkv', torrserver_base: backend + '/ts' },
      progress: { position_ms: 65_000, duration_ms: 120_000, percent: 54, completed: false },
      timeline_hash: 'torrent-resume-fixture',
      updated_at: Date.now()
    };
    Lampa.Storage.set('lampac_resume_v1', { version: 1, items: { [key]: record }, hash_map: { 'torrent-resume-fixture': key } });
    Lampa.LampacResume.pushTorrServer(key);
  }, { key, hash, backend });

  await page.waitForTimeout(1500);
  const pulled = await page.evaluate((key) => new Promise((resolve) => {
    Lampa.LampacResume.pullTorrServer(key, (seconds) => resolve(seconds));
  }), key);
  expect(Number(pulled)).toBe(65);

  await page.evaluate((key) => Lampa.LampacResume.resume(key), key);
  await page.waitForFunction(() => window.__resumePlayCalls && window.__resumePlayCalls.length > 0, null, { timeout: 15_000 });
  const state = await page.evaluate(() => ({
    play: window.__resumePlayCalls[window.__resumePlayCalls.length - 1],
    record: Lampa.LampacResume.list()[0]
  }));
  expect(state.play.url).toContain(backend + '/ts/stream/fixture.mkv');
  expect(state.play.url).toContain('index=1');
  expect(state.play.url).toContain(encodeURIComponent(hash));
  expect(state.play.timeline.time).toBe(65);
  expect(noTransientKeys(state.record)).toBeTruthy();

  results.torrserver = { ok: true, pulled, play: state.play };
});

test('capture-origin probe records the origin of the final online play URL', async ({ page }) => {
  await openLab(page);
  const card = { id: 551, source: 'tmdb', type: 'movie', title: 'Origin Probe', release_date: '2000-01-01' };
  await preparePlugin(page, card);
  const probe = await page.evaluate(() => {
    Lampa.Storage.set('active_balanser', 'fixture');
    Lampa.Player.play({
      title: 'Origin Probe',
      url: 'https://cdn.example.invalid/video/final.m3u8?token=do-not-store',
      isonline: true,
      voice_name: 'Fixture Voice',
      timeline: { hash: 'origin-probe' }
    });
    const record = Lampa.LampacResume.list()[0];
    return { record, safe: LampacResumeCore.recordHasNoTransientUrl(record) };
  });
  expect(probe.safe).toBeTruthy();
  expect(probe.record.source.server_origin).toBe('https://cdn.example.invalid');
  results.originProbe = {
    ok: true,
    observed_server_origin: probe.record.source.server_origin,
    note: 'Automatic online capture derives server_origin from play.url origin.'
  };
});

test.afterAll(() => {
  fs.mkdirSync(path.join(__dirname, '..', 'spike'), { recursive: true });
  fs.writeFileSync(
    path.join(__dirname, '..', 'spike', 'lampac-resume-result.json'),
    JSON.stringify(results, null, 2) + '\n',
    'utf8'
  );
});

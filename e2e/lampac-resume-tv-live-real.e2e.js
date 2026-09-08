const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const backend = (process.env.LAMPA_TEST_LAMPAC_URL || '').replace(/\/+$/, '');
const pages = (process.env.LAMPA_TEST_PAGES_URL || 'https://arst113.github.io/lampa-source/test/').replace(/\/+$/, '/');

function pluginSource() {
  return fs.readFileSync(path.join(__dirname, '..', 'plugins', 'watch_resume', 'watch_resume.js'), 'utf8');
}

function params(card) {
  const q = new URLSearchParams();
  q.set('id', String(card.id));
  q.set('tmdb_id', String(card.tmdb_id || card.id));
  if (card.imdb_id) q.set('imdb_id', card.imdb_id);
  if (card.kinopoisk_id) q.set('kinopoisk_id', card.kinopoisk_id);
  q.set('title', card.title || card.name || '');
  q.set('original_title', card.original_title || card.original_name || '');
  q.set('serial', '1');
  q.set('original_language', card.original_language || 'en');
  q.set('year', String(card.first_air_date || '').slice(0, 4));
  q.set('source', 'tmdb');
  q.set('clarification', '0');
  q.set('similar', 'false');
  return q;
}

async function openLab(page) {
  const response = await page.goto(pages + '?lampac=' + encodeURIComponent(backend), {
    waitUntil: 'domcontentloaded', timeout: 60_000,
  });
  expect(response && response.ok()).toBeTruthy();
  await page.waitForFunction(() => window.appready === true && window.Lampa, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__LAMPA_TEST_PROFILE__ && window.__LAMPA_TEST_PROFILE__.lampacInit === 'loaded', null, { timeout: 45_000 });
}

async function installPlugin(page, card) {
  await page.evaluate(({ card }) => {
    Lampa.Storage.set('lampac_resume_v1', { version: 2, items: {}, hash_map: {} });
    Lampa.Storage.set('lampac_profile_id', 'resume-tv-live-real');
    Lampa.Storage.set('activity', { movie: card });
    Lampa.Storage.set('player', 'inner');
    window.lampac_resume_plugin_version = '';
    if (Lampa.Player) delete Lampa.Player.__lampacResumePatched;
    window.__resumeTvPlayCalls = [];
    window.__resumeTvNoty = [];
    Lampa.Player.play = function (data) {
      window.__resumeTvPlayCalls.push({
        title: data && data.title,
        url: data && data.url ? String(data.url) : '',
        season: Number(data && data.season || 0),
        episode: Number(data && data.episode || 0),
        voice_name: data && data.voice_name || '',
        isonline: !!(data && data.isonline),
        timeline: data && data.timeline ? {
          hash: data.timeline.hash,
          time: Number(data.timeline.time || 0),
          duration: Number(data.timeline.duration || 0),
          percent: Number(data.timeline.percent || 0),
        } : null,
      });
      return data;
    };
    Lampa.Player.playlist = function (items) { return items; };
    if (Lampa.Noty) Lampa.Noty.show = function (text) { window.__resumeTvNoty.push(String(text)); };
  }, { card });
  await page.addScriptTag({ content: pluginSource() });
  await page.waitForFunction(() => Lampa.LampacResume && Lampa.LampacResume.version === '0.2.3');
}

async function discoverProviders(request, card) {
  const q = params(card);
  let response = await request.get(backend + '/lite/events?life=true&' + q.toString(), { timeout: 60_000 });
  if (!response.ok()) return { providers: [], diagnostic: `events HTTP ${response.status()}` };
  let body;
  try { body = await response.json(); } catch (_) { return { providers: [], diagnostic: 'events non-json' }; }
  for (let i = 0; i < 30 && body && body.life && body.memkey && !(Array.isArray(body.online) && body.online.length); i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    response = await request.get(backend + '/lifeevents?memkey=' + encodeURIComponent(body.memkey) + '&' + q.toString(), { timeout: 60_000 });
    if (!response.ok()) break;
    try { body = await response.json(); } catch (_) { break; }
  }
  const online = Array.isArray(body) ? body : (body && Array.isArray(body.online) ? body.online : []);
  return {
    providers: online.filter((x) => x && x.show !== false && x.url).map((x) => ({
      name: String(x.balanser || x.name || '').trim().split(' ')[0].toLowerCase(),
      url: String(x.url),
    })),
    diagnostic: body,
  };
}

function seedTvRecord(card, provider) {
  return {
    key: `p:resume-tv-live-real|tmdb:tv:${card.id}:s1:e1`,
    profile_id: 'resume-tv-live-real',
    media: {
      type: 'tv', source: 'tmdb', id: card.id, tmdb_id: card.id,
      title: card.name, year: String(card.first_air_date).slice(0, 4),
      season: 1, episode: 1,
    },
    source: {
      kind: 'online', adapter: 'lampac-online', balancer: provider,
      server_origin: backend, card,
      selection: {
        season: 1,
        episode: 1,
        voice_name: '',
        season_index: 0,
        voice_index: 0,
      },
    },
    progress: { position_ms: 65_000, duration_ms: 3_600_000, percent: 2, completed: false },
    timeline_hash: `resume-tv-real-${card.id}-s1e1`,
    updated_at: Date.now(),
  };
}

async function tryProvider(page, card, provider) {
  const record = seedTvRecord(card, provider.name);
  await page.evaluate(({ record }) => {
    window.__resumeTvPlayCalls = [];
    window.__resumeTvNoty = [];
    Lampa.Storage.set('lampac_resume_v1', {
      version: 2,
      items: { [record.key]: record },
      hash_map: { [record.timeline_hash]: record.key },
    });
    Lampa.LampacResume.resume(record.key);
  }, { record });

  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({ calls: window.__resumeTvPlayCalls, noty: window.__resumeTvNoty }));
    if (state.calls.length) return { ok: true, play: state.calls[state.calls.length - 1], noty: state.noty };
    if (state.noty.some((x) => /не удалось|недоступ|не вернул|не ответил|не найден/i.test(x))) return { ok: false, noty: state.noty };
    await page.waitForTimeout(500);
  }
  return { ok: false, noty: await page.evaluate(() => window.__resumeTvNoty) };
}

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required');

test('LIVE v0.2.3 TV: real provider resolves Breaking Bad S01E01 and restores 65s', async ({ page, request }) => {
  test.setTimeout(240_000);
  const card = {
    id: 1396,
    tmdb_id: 1396,
    source: 'tmdb',
    type: 'tv',
    name: 'Breaking Bad',
    original_name: 'Breaking Bad',
    first_air_date: '2008-01-20',
    original_language: 'en',
  };

  const backendTraffic = [];
  const consoleLines = [];
  page.on('request', (req) => {
    if (req.url().startsWith(backend)) backendTraffic.push(req.url());
  });
  page.on('console', (msg) => {
    if (msg.text().includes('[LampacResume')) consoleLines.push(msg.text());
  });

  await openLab(page);
  await installPlugin(page, card);

  const discovery = await discoverProviders(request, card);
  console.log('[REAL v0.2.3 TV providers]', discovery.providers.map((x) => x.name));
  expect(discovery.providers.length, `No real TV providers: ${JSON.stringify(discovery.diagnostic).slice(0, 5000)}`).toBeGreaterThan(0);

  const attempts = [];
  let success = null;
  for (const provider of discovery.providers.slice(0, 10)) {
    const result = await tryProvider(page, card, provider);
    attempts.push({ provider: provider.name, ok: result.ok, noty: result.noty || [], play: result.play || null });
    console.log('[REAL v0.2.3 TV provider attempt]', provider.name, result.ok, result.noty || [], result.play || '');
    if (
      result.ok && result.play && /^https?:\/\//i.test(result.play.url || '') &&
      Number(result.play.season) === 1 && Number(result.play.episode) === 1
    ) {
      success = { provider, result };
      break;
    }
  }

  console.log('[REAL Lampac Resume v0.2.3 TV result]', JSON.stringify({
    success: success && { provider: success.provider.name, play: success.result.play },
    attempts,
    backendTraffic: backendTraffic.slice(-120),
    consoleLines: consoleLines.slice(-120),
  }, null, 2));

  expect(success, `No real provider restored exact S01E01. Attempts: ${JSON.stringify(attempts).slice(0, 10000)}`).toBeTruthy();
  expect(success.result.play.isonline).toBe(true);
  expect(success.result.play.season).toBe(1);
  expect(success.result.play.episode).toBe(1);
  expect(success.result.play.timeline && Number(success.result.play.timeline.time)).toBe(65);
  expect(backendTraffic.some((url) => url.includes('/externalids?') || url.includes('/lite/events') || url.includes('/lifeevents'))).toBeTruthy();
});

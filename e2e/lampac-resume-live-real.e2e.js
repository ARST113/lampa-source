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

function params(card) {
  const q = new URLSearchParams();
  q.set('id', String(card.id));
  if (card.imdb_id) q.set('imdb_id', card.imdb_id);
  if (card.kinopoisk_id) q.set('kinopoisk_id', card.kinopoisk_id);
  q.set('tmdb_id', String(card.id));
  q.set('title', card.title || card.name || '');
  q.set('original_title', card.original_title || card.original_name || '');
  q.set('serial', card.type === 'tv' ? '1' : '0');
  q.set('original_language', card.original_language || 'en');
  q.set('year', String(card.release_date || card.first_air_date || '').slice(0, 4));
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
    Lampa.Storage.set('lampac_resume_v1', { version: 1, items: {}, hash_map: {} });
    Lampa.Storage.set('lampac_profile_id', 'resume-live-real');
    Lampa.Storage.set('activity', { movie: card });
    Lampa.Storage.set('player', 'inner');
    window.__resumeRealPlayCalls = [];
    window.__resumeRealNoty = [];
    Lampa.Player.play = function (data) {
      const safe = Object.assign({}, data || {});
      if (safe.url) safe.url = String(safe.url);
      window.__resumeRealPlayCalls.push(safe);
      return data;
    };
    Lampa.Player.playlist = function (items) { return items; };
    if (Lampa.Noty) Lampa.Noty.show = function (text) { window.__resumeRealNoty.push(String(text)); };
  }, { card });
  await page.addScriptTag({ content: pluginSource() });
  await page.waitForFunction(() => Lampa.LampacResume && Lampa.LampacResume.version === '0.2.2');
}

async function discoverProviders(request, card) {
  const q = params(card);
  let response = await request.get(backend + '/lite/events?life=true&' + q.toString(), { timeout: 60_000 });
  if (!response.ok()) return { providers: [], diagnostic: `events HTTP ${response.status()}` };
  let body;
  try { body = await response.json(); } catch (_) { return { providers: [], diagnostic: 'events non-json' }; }
  for (let i = 0; i < 20 && body && body.life && body.memkey && !(Array.isArray(body.online) && body.online.length); i++) {
    await new Promise((r) => setTimeout(r, 1000));
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

function seedRecord(card, provider) {
  return {
    key: `p:resume-live-real|tmdb:movie:${card.id}`,
    profile_id: 'resume-live-real',
    media: {
      type: 'movie', source: 'tmdb', id: card.id, tmdb_id: card.id,
      imdb_id: card.imdb_id || '', kinopoisk_id: card.kinopoisk_id || '',
      title: card.title, year: String(card.release_date).slice(0, 4), season: 0, episode: 0,
    },
    source: {
      kind: 'online', adapter: 'lampac-online', balancer: provider,
      server_origin: backend, card,
      selection: { season: 0, episode: 0, voice_name: '', season_index: 0, voice_index: 0 },
    },
    progress: { position_ms: 65_000, duration_ms: 120_000, percent: 54, completed: false },
    timeline_hash: `resume-real-${card.id}`,
    updated_at: Date.now(),
  };
}

async function tryProvider(page, card, provider) {
  const record = seedRecord(card, provider.name);
  await page.evaluate(({ record }) => {
    window.__resumeRealPlayCalls = [];
    window.__resumeRealNoty = [];
    Lampa.Storage.set('lampac_resume_v1', {
      version: 1,
      items: { [record.key]: record },
      hash_map: { [record.timeline_hash]: record.key },
    });
    Lampa.LampacResume.resume(record.key);
  }, { record });

  const deadline = Date.now() + 22_000;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({ calls: window.__resumeRealPlayCalls, noty: window.__resumeRealNoty }));
    if (state.calls.length) return { ok: true, play: state.calls[state.calls.length - 1], noty: state.noty };
    if (state.noty.some((x) => /не удалось|недоступ|не вернул|не ответил/i.test(x))) return { ok: false, noty: state.noty };
    await page.waitForTimeout(500);
  }
  return { ok: false, noty: await page.evaluate(() => window.__resumeRealNoty) };
}

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required');

test('LIVE: Lampac Resume reaches a real Online provider and resolves a fresh stream', async ({ page, request }) => {
  test.setTimeout(180_000);
  const backendTraffic = [];
  const consoleLines = [];
  page.on('request', (req) => {
    if (req.url().startsWith(backend)) backendTraffic.push(req.url());
  });
  page.on('console', (msg) => {
    if (msg.text().includes('[LampacResume')) consoleLines.push(msg.text());
  });

  const cards = [
    { id: 550, tmdb_id: 550, imdb_id: 'tt0137523', kinopoisk_id: '361', source: 'tmdb', type: 'movie', title: 'Fight Club', original_title: 'Fight Club', release_date: '1999-10-15', original_language: 'en' },
    { id: 603, tmdb_id: 603, imdb_id: 'tt0133093', kinopoisk_id: '301', source: 'tmdb', type: 'movie', title: 'The Matrix', original_title: 'The Matrix', release_date: '1999-03-30', original_language: 'en' },
  ];

  await openLab(page);
  await installPlugin(page, cards[0]);

  const attempts = [];
  let success = null;
  for (const card of cards) {
    const discovery = await discoverProviders(request, card);
    console.log('[REAL providers]', card.title, discovery.providers.map((x) => x.name));
    expect(discovery.providers.length, `No real Online providers discovered for ${card.title}: ${JSON.stringify(discovery.diagnostic).slice(0, 1000)}`).toBeGreaterThan(0);

    for (const provider of discovery.providers.slice(0, 8)) {
      const result = await tryProvider(page, card, provider);
      attempts.push({ card: card.title, provider: provider.name, result });
      console.log('[REAL provider attempt]', card.title, provider.name, result.ok, result.noty || []);
      if (result.ok && result.play && /^https?:\/\//i.test(String(result.play.url || ''))) {
        success = { card, provider, result };
        break;
      }
    }
    if (success) break;
  }

  console.log('[REAL Lampac Resume result]', JSON.stringify({
    success: success && { card: success.card.title, provider: success.provider.name, play: success.result.play },
    attempts,
    backendTraffic: backendTraffic.slice(-80),
    consoleLines: consoleLines.slice(-80),
  }, null, 2));

  expect(success, `No provider produced a fresh stream. Attempts: ${JSON.stringify(attempts).slice(0, 5000)}`).toBeTruthy();
  expect(success.result.play.timeline && Number(success.result.play.timeline.time)).toBe(65);
  expect(success.result.play.url).not.toContain('media.invalid');
  expect(backendTraffic.some((u) => u.includes('/lite/events') || u.includes('/lifeevents'))).toBeTruthy();
  expect(backendTraffic.some((u) => u !== backend + '/lampainit.js' && !u.includes('/version'))).toBeTruthy();
});

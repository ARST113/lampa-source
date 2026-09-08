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

function hotfixSource() {
  return fs.readFileSync(path.join(__dirname, '..', 'spike', 'lampac-resume-0.2.3-hotfix.js'), 'utf8');
}

async function openLab(page) {
  const response = await page.goto(pages + '?lampac=' + encodeURIComponent(backend), {
    waitUntil: 'domcontentloaded', timeout: 60_000
  });
  expect(response && response.ok()).toBeTruthy();
  await page.waitForFunction(() => window.appready === true && window.Lampa, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__LAMPA_TEST_PROFILE__ && window.__LAMPA_TEST_PROFILE__.lampacInit === 'loaded', null, { timeout: 45_000 });
}

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required');

test('LIVE regression: Silo E01 is not overwritten by E10 and TorrServer resumes index=1 at 65s', async ({ page }) => {
  await openLab(page);

  const card = {
    id: 125988,
    source: 'cub',
    type: 'movie', // reproduces the real stale/misleading card.type from the user log
    title: 'Укрытие',
    original_title: 'Silo'
  };

  const hash = '5980c336abd6e498afa5b5461b5af4be52039e63';
  const e01 = `${backend}/ts/stream/Silo.S03E01.2160p.ATVP.WEB-DL.H.265.RGzsRutracker.mkv?link=${hash}&index=1&play`;
  const e10 = `${backend}/ts/stream/Silo.S03E10.2160p.ATVP.WEB-DL.H.265.RGzsRutracker.mkv?link=${hash}&index=10&play`;
  const hostWithoutScheme = backend.replace(/^https?:\/\//, '');

  await page.evaluate(({ card, hostWithoutScheme }) => {
    Lampa.Storage.set('lampac_resume_v1', { version: 1, items: {}, hash_map: {} });
    Lampa.Storage.set('lampac_profile_id', 'default');
    Lampa.Storage.set('activity', { movie: card });
    Lampa.Storage.set('torrserver_url', hostWithoutScheme + '/ts');
    window.__resumePlayCalls = [];
    window.__resumePlaylistCalls = [];
    Lampa.Player.play = function (data) {
      window.__resumePlayCalls.push({
        title: data && data.title,
        url: data && data.url,
        season: Number(data && data.season || 0),
        episode: Number(data && data.episode || 0),
        torrent_hash: data && data.torrent_hash,
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
  }, { card, hostWithoutScheme });

  await page.addScriptTag({ content: pluginSource() });
  await page.waitForFunction(() => Lampa.LampacResume && Lampa.LampacResume.version === '0.2.2');
  await page.addScriptTag({ content: hotfixSource() });
  await page.waitForFunction(() => window.lampac_resume_hotfix_version === '0.2.3');

  const captured = await page.evaluate(({ e01, e10, hash }) => {
    const p1 = {
      title: 'Кто ты?', url: e01, season: 3, episode: 1,
      torrent_hash: hash,
      timeline: { hash: 'silo-s03e01-live', time: 0, duration: 3108, percent: 0 }
    };
    const p10 = {
      title: 'За пределами', url: e10, season: 3, episode: 10,
      torrent_hash: hash,
      timeline: { hash: 'silo-s03e10-live', time: 0, duration: 3108, percent: 0 }
    };
    Lampa.Player.play(p1);
    Lampa.Player.playlist([p1, p10]);
    return {
      records: Lampa.LampacResume.list(),
      torrserverUrl: Lampa.Storage.get('torrserver_url', '')
    };
  }, { e01, e10, hash });

  expect(captured.torrserverUrl).toBe(backend + '/ts');
  expect(captured.records.length).toBeGreaterThanOrEqual(2);

  const e01Record = captured.records.find((r) => r.media && r.media.season === 3 && r.media.episode === 1);
  const e10Record = captured.records.find((r) => r.media && r.media.season === 3 && r.media.episode === 10);
  expect(e01Record).toBeTruthy();
  expect(e10Record).toBeTruthy();
  expect(e01Record.media.type).toBe('tv');
  expect(e10Record.media.type).toBe('tv');
  expect(e01Record.key).toContain(':tv:');
  expect(e01Record.key).toContain(':s3:e1');
  expect(e10Record.key).toContain(':s3:e10');
  expect(Number(e01Record.source.file_index)).toBe(1);
  expect(Number(e10Record.source.file_index)).toBe(10);

  const key = e01Record.key;
  await page.evaluate((key) => {
    const db = Lampa.LampacResume.debug().db;
    db.items[key].progress = { position_ms: 65000, duration_ms: 3108000, percent: 2, completed: false };
    db.items[key].updated_at = Date.now();
    Lampa.Storage.set('lampac_resume_v1', db);
    Lampa.LampacResume.pushTorrServer(key);
  }, key);

  await page.waitForTimeout(1500);
  const pulled = await page.evaluate((key) => new Promise((resolve) => {
    Lampa.LampacResume.pullTorrServer(key, (seconds) => resolve(Number(seconds || 0)));
  }), key);
  expect(pulled).toBe(65);

  await page.evaluate(() => { window.__resumePlayCalls = []; });
  await page.evaluate((key) => Lampa.LampacResume.resume(key), key);
  await page.waitForFunction(() => window.__resumePlayCalls && window.__resumePlayCalls.length > 0, null, { timeout: 10_000 });

  const resumed = await page.evaluate(() => window.__resumePlayCalls[window.__resumePlayCalls.length - 1]);
  expect(resumed.url).toMatch(/^https:\/\//);
  expect(resumed.url).toContain('/ts/stream/Silo.S03E01.2160p.ATVP.WEB-DL.H.265.RGzsRutracker.mkv');
  expect(resumed.url).toContain('index=1');
  expect(resumed.url).not.toContain('index=10');
  expect(resumed.url).not.toContain('/lampa-main/');
  expect(resumed.season).toBe(3);
  expect(resumed.episode).toBe(1);
  expect(resumed.timeline.time).toBe(65);
});

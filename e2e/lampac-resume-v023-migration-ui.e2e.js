const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const backend = (process.env.LAMPA_TEST_LAMPAC_URL || '').replace(/\/+$/, '');
const pages = (process.env.LAMPA_TEST_PAGES_URL || 'https://arst113.github.io/lampa-source/test/').replace(/\/+$/, '/');

function pluginSource() {
  return fs.readFileSync(path.join(__dirname, '..', 'plugins', 'watch_resume', 'watch_resume.js'), 'utf8');
}

async function openLab(page) {
  const response = await page.goto(pages + '?lampac=' + encodeURIComponent(backend), {
    waitUntil: 'domcontentloaded', timeout: 60_000
  });
  expect(response && response.ok()).toBeTruthy();
  await page.waitForFunction(() => window.appready === true && window.Lampa, null, { timeout: 60_000 });
  await page.waitForFunction(() => window.__LAMPA_TEST_PROFILE__ && window.__LAMPA_TEST_PROFILE__.lampacInit === 'loaded', null, { timeout: 45_000 });
}

async function installCleanResume(page, initialDb, card) {
  await page.evaluate(({ initialDb, card }) => {
    Lampa.Storage.set('lampac_profile_id', 'default');
    Lampa.Storage.set('activity', { movie: card });
    Lampa.Storage.set('lampac_resume_v1', initialDb);
    // The public lab may already contain another Resume build. Force this test to execute the
    // standalone file under test and to wrap our isolated Player functions.
    window.lampac_resume_plugin_version = '';
    if (Lampa.Player) delete Lampa.Player.__lampacResumePatched;
    window.__resumePlayCalls = [];
    Lampa.Player.play = function (data) {
      window.__resumePlayCalls.push(data);
      return data;
    };
    Lampa.Player.playlist = function (items) { return items; };
  }, { initialDb, card });
  await page.addScriptTag({ content: pluginSource() });
  await page.waitForFunction(() => Lampa.LampacResume && Lampa.LampacResume.version === '0.2.3');
}

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required');

test('v0.2.3 drops ambiguous v0.2.2 torrent-series record but preserves safe records', async ({ page }) => {
  await openLab(page);
  const card = { id: 125988, source: 'cub', type: 'movie', title: 'Укрытие', original_title: 'Silo' };
  const hash = '5980c336abd6e498afa5b5461b5af4be52039e63';
  const badKey = 'p:default|cub:movie:125988';
  const goodMovieKey = 'p:default|tmdb:movie:550';
  const goodTvKey = 'p:default|cub:tv:125988:s3:e1';
  const initialDb = {
    version: 1,
    items: {
      [badKey]: {
        key: badKey, profile_id: 'default',
        media: { type: 'movie', source: 'cub', id: 125988, title: 'Укрытие', season: 0, episode: 0 },
        source: { kind: 'torrent', adapter: 'torrserver', info_hash: hash, file_index: 10, file_name: 'Silo.S03E10.mkv', play_title: 'За пределами' },
        progress: { position_ms: 280000, duration_ms: 3108000, percent: 9, completed: false },
        timeline_hash: 'legacy-silo', updated_at: Date.now()
      },
      [goodMovieKey]: {
        key: goodMovieKey, profile_id: 'default',
        media: { type: 'movie', source: 'tmdb', id: 550, title: 'Fight Club', season: 0, episode: 0 },
        source: { kind: 'online', adapter: 'lampac-online', balancer: 'vidlink' },
        progress: { position_ms: 65000, duration_ms: 120000, percent: 54, completed: false },
        updated_at: Date.now() - 1
      },
      [goodTvKey]: {
        key: goodTvKey, profile_id: 'default',
        media: { type: 'tv', source: 'cub', id: 125988, title: 'Укрытие', season: 3, episode: 1 },
        source: { kind: 'torrent', adapter: 'torrserver', info_hash: hash, file_index: 1, file_name: 'Silo.S03E01.mkv', play_title: 'Кто ты?' },
        progress: { position_ms: 65000, duration_ms: 3108000, percent: 2, completed: false },
        timeline_hash: 'safe-silo-e1', updated_at: Date.now() - 2
      }
    },
    hash_map: { 'legacy-silo': badKey, 'safe-silo-e1': goodTvKey }
  };

  await installCleanResume(page, initialDb, card);
  const state = await page.evaluate(() => Lampa.LampacResume.debug().db);
  expect(state.version).toBe(2);
  expect(state.items[badKey]).toBeUndefined();
  expect(state.items[goodMovieKey]).toBeTruthy();
  expect(state.items[goodTvKey]).toBeTruthy();
  expect(state.hash_map['legacy-silo']).toBeUndefined();
  expect(state.hash_map['safe-silo-e1']).toBe(goodTvKey);
});

test('Continue button identifies the exact S03E01 record and shows episode code', async ({ page }) => {
  await openLab(page);
  const card = { id: 125988, source: 'cub', type: 'movie', title: 'Укрытие', original_title: 'Silo' };
  const key = 'p:default|cub:tv:125988:s3:e1';
  const db = {
    version: 2,
    items: {
      [key]: {
        key, profile_id: 'default',
        media: { type: 'tv', source: 'cub', id: 125988, title: 'Укрытие', season: 3, episode: 1 },
        source: { kind: 'torrent', adapter: 'torrserver', info_hash: '5980c336abd6e498afa5b5461b5af4be52039e63', file_index: 1, file_name: 'Silo.S03E01.mkv', play_title: 'Кто ты?', torrserver_base: backend + '/ts' },
        progress: { position_ms: 280000, duration_ms: 3108000, percent: 9, completed: false },
        timeline_hash: 'silo-button-e1', updated_at: Date.now()
      }
    },
    hash_map: { 'silo-button-e1': key }
  };

  await installCleanResume(page, db, card);
  const ui = await page.evaluate((card) => {
    const root = $('<div><div class="full-start__button view--online"><span>Online</span></div></div>');
    Lampa.LampacResume.refreshCardButton({
      type: 'complite', data: { movie: card },
      object: { activity: { render: function () { return root; } } }
    });
    return {
      count: root.find('.lampac-resume--button').length,
      label: root.find('.lampac-resume--button span').text()
    };
  }, card);
  expect(ui.count).toBe(1);
  expect(ui.label).toBe('Продолжить — S03E01 · 04:40');
});

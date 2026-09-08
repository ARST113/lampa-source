const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');
const assert = require('assert');

function source() {
  const parts = [1, 2, 3, 4, 5].map((n) =>
    fs.readFileSync(path.join(__dirname, `lampac-resume-fixture.part${n}`), 'utf8').trim()
  ).join('');
  return zlib.gunzipSync(Buffer.from(parts, 'base64')).toString('utf8');
}

function loadCore() {
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    globalThis: {},
    URL,
    isFinite,
    console,
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(source(), sandbox, { filename: 'lampac-resume-v0.2.2.js' });
  return module.exports;
}

const Core = loadCore();
let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`OK ${name}`);
}

check('fixture decodes as Lampac Resume v0.2.2', () => {
  assert(source().includes("var VERSION = '0.2.2'"));
});
check('sanitize strips transient URLs/headers/tokens recursively', () => {
  const out = Core.sanitizeObject({
    url: 'https://x', nested: { token: 'secret', safe: 1, headers: { A: 'B' } }, arr: [{ link: 'x', keep: 'y' }]
  });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(out)), { nested: { safe: 1 }, arr: [{ keep: 'y' }] });
  assert.strictEqual(Core.recordHasNoTransientUrl(out), true);
});
check('unsafe record is rejected', () => {
  assert.strictEqual(Core.recordHasNoTransientUrl({ source: { stream: 'x' } }), false);
  assert.strictEqual(Core.recordHasNoTransientUrl({ source: { selection: { voice_name: 'x' } } }), true);
});
check('v1 torrent hashes normalize', () => {
  assert.strictEqual(Core.normalizeInfoHash('A'.repeat(40)), 'a'.repeat(40));
  assert.strictEqual(Core.normalizeInfoHash('A'.repeat(32)), 'A'.repeat(32));
  assert.strictEqual(Core.normalizeInfoHash('xyz'), '');
});
check('magnet hash extracts', () => {
  const h = '0123456789abcdef0123456789abcdef01234567';
  assert.strictEqual(Core.extractMagnetInfoHash(`magnet:?xt=urn:btih:${h}&dn=x`), h);
});
check('TorrServer stream parses and rebuilds', () => {
  const h = '0123456789abcdef0123456789abcdef01234567';
  const parsed = Core.parseTorrServerStream(`https://ts.test/stream/Movie%20One.mkv?link=${h}&index=3&play`);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(parsed)), { kind: 'torrent', info_hash: h, file_index: 3, file_name: 'Movie One.mkv' });
  assert.strictEqual(
    Core.buildTorrServerStreamUrl('https://ts.test/', parsed),
    `https://ts.test/stream/Movie%20One.mkv?link=${h}&index=3&play`
  );
});
check('media keys are stable', () => {
  assert.strictEqual(Core.buildMediaKey({ type: 'movie', source: 'tmdb', id: 550 }), 'tmdb:movie:550');
  assert.strictEqual(Core.buildMediaKey({ type: 'tv', source: 'tmdb', id: 1396, season: 2, episode: 3 }), 'tmdb:tv:1396:s2:e3');
});
check('online recipe stores stable selection only', () => {
  const r = Core.createOnlineRecipe({
    balancer: 'rezka', card: { id: 1396, type: 'tv', title: 'X', url: 'DROP' },
    play: { season: 2, episode: 3, voice_name: 'Dub' }
  });
  assert.strictEqual(r.balancer, 'rezka');
  assert.strictEqual(r.selection.season, 2);
  assert.strictEqual(r.selection.episode, 3);
  assert.strictEqual(r.card.url, undefined);
  assert.strictEqual(Core.recordHasNoTransientUrl(r), true);
});
check('timeline progress and completion work', () => {
  const p = Core.progressFromTimelineEvent({ hash: 'h', road: { time: 90, duration: 300 } });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(p)), {
    timeline_hash: 'h', position_ms: 90000, duration_ms: 300000, percent: 30, completed: false
  });
  assert.strictEqual(Core.progressFromTimelineEvent({ road: { time: 96, duration: 100 } }).completed, true);
  assert.strictEqual(Core.shouldResume({ position_ms: 15000, duration_ms: 100000, percent: 15, completed: false }), true);
  assert.strictEqual(Core.shouldResume({ position_ms: 95000, duration_ms: 100000, percent: 95, completed: false }), false);
});
check('resume timeline is injected', () => {
  const play = { timeline: { hash: 'orig', foo: 1 } };
  Core.applyResumeTimeline(play, {
    progress: { position_ms: 65000, duration_ms: 100000, percent: 65 }, timeline_hash: 'saved', media: {}
  });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(play.timeline)), { hash: 'orig', foo: 1, time: 65, duration: 100, percent: 65 });
});
check('newer TorrServer timecode wins', () => {
  const p = Core.chooseProgress({ position_ms: 20000, duration_ms: 100000, percent: 20, completed: false }, 45);
  assert.strictEqual(p.position_ms, 45000);
  assert.strictEqual(p.percent, 45);
});
check('card matching uses stable identity', () => {
  const rec = { media: { source: 'tmdb', id: 550, tmdb_id: 550, title: 'Fight Club', year: '1999' } };
  assert.strictEqual(Core.recordMatchesCard(rec, { source: 'tmdb', id: 550, title: 'Other' }), true);
  assert.strictEqual(Core.recordMatchesCard(rec, { source: 'tmdb', id: 551, title: 'Fight Club' }), false);
});
check('resume button labels are correct', () => {
  assert.strictEqual(Core.resumeButtonLabel({ media: { type: 'movie' }, progress: { position_ms: 65000 } }), 'Продолжить · 01:05');
  assert.strictEqual(Core.resumeButtonLabel({ media: { type: 'tv', season: 2, episode: 3 }, progress: { position_ms: 3661000 } }), 'Продолжить — S02E03 · 1:01:01');
});
check('latest resumable record is selected per profile', () => {
  const rows = [
    { profile_id: 'p', media: { source: 'tmdb', id: 550 }, progress: { position_ms: 30000, percent: 30 }, updated_at: 1 },
    { profile_id: 'p', media: { source: 'tmdb', id: 550 }, progress: { position_ms: 40000, percent: 40 }, updated_at: 2 },
    { profile_id: 'q', media: { source: 'tmdb', id: 550 }, progress: { position_ms: 50000, percent: 50 }, updated_at: 3 }
  ];
  assert.strictEqual(Core.findLatestResumeForCard(rows, { source: 'tmdb', id: 550 }, 'p').updated_at, 2);
});

console.log(`PASS ${passed} core checks`);

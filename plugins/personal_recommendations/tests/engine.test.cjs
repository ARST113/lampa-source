const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const file = path.join(__dirname, '../src/engine.js');
const engine = fs.existsSync(file) ? require(file) : {};
const now = Date.UTC(2026, 9, 3, 12);
const day = 24 * 60 * 60 * 1000;
function movie(id, extra) {
    return Object.assign({ id, title: 'Film ' + id, media_type: 'movie', genre_ids: [18], vote_average: 7, vote_count: 250, release_date: '2020-01-01' }, extra);
}
function tv(id, extra) {
    return Object.assign({ id, name: 'Series ' + id, media_type: 'tv', genre_ids: [35], vote_average: 7, vote_count: 250, first_air_date: '2020-01-01' }, extra);
}
function profile(favorites, feedback) { return engine.buildProfile(favorites || {}, feedback || {}, { now }); }
function keys(cards) { return cards.map(function(card) { return engine.key(card); }); }

test('exposes the four public engine operations', function() {
    for (const operation of ['normalizeCard', 'key', 'buildProfile', 'rank']) assert.equal(typeof engine[operation], 'function');
});

test('keeps movie and television identities separate', function() {
    assert.equal(engine.key(movie(550)), 'movie:550');
    assert.equal(engine.key(tv(550)), 'tv:550');
    assert.equal(engine.key({ id: 1, media_type: 'person', name: 'Actor' }), '');
});

test('does not mistake numeric foreign catalogue IDs for TMDB IDs', function() {
    assert.equal(engine.normalizeCard(movie(77, { source: 'kinopoisk' })), null);
    assert.equal(engine.key(tv(99, { source: 'cub' })), '');
    assert.equal(engine.key(movie(77, { source: 'kinopoisk', tmdb_id: '550' })), 'movie:550');
    assert.equal(engine.normalizeCard(movie(77, { source: 'kinopoisk', tmdb_id: '550' })).id, 550);
});

test('infers standard Lampa card types and rejects invalid identities', function() {
    assert.equal(engine.key({ id: '42', title: 'Movie' }), 'movie:42');
    assert.equal(engine.key({ id: 42, name: 'TV', first_air_date: '2023-01-01' }), 'tv:42');
    for (const id of [0, -1, 1.5, 'nope', '', null, Infinity, '9007199254740992']) assert.equal(engine.normalizeCard(movie(id)), null);
    assert.equal(engine.normalizeCard(null), null);
});

test('normalizes bounded metadata without exposing arbitrary fields or mutating inputs', function() {
    const original = movie('23', { genre_ids: [18, '35', 18, -1, 'bad'], vote_average: 99, vote_count: -20, popularity: Infinity, token: 'private', title: '  Title\u0000  ', adult: 'false' });
    const before = JSON.stringify(original);
    const normalized = engine.normalizeCard(original);
    assert.equal(normalized.id, 23);
    assert.equal(normalized.source, 'tmdb');
    assert.equal(normalized.media_type, 'movie');
    assert.equal(normalized.title, 'Title');
    assert.deepEqual(normalized.genre_ids, [18, 35]);
    assert.equal(normalized.vote_average, 10);
    assert.equal(normalized.vote_count, 0);
    assert.equal(normalized.popularity, 0);
    assert.equal(normalized.adult, false);
    assert.equal(normalized.token, undefined);
    assert.equal(JSON.stringify(original), before);
});

test('keeps safe genre names, full-card artwork and candidate provenance', function() {
    const normalized = engine.normalizeCard(tv(9, { genre_ids: undefined, genres: [{ id: 35, name: 'Comedy' }], poster_path: '/poster.jpg', backdrop_path: '/backdrop.jpg', overview: 'Story', recommendation_sources: [{ seed_key: 'movie:4', seed_title: 'Seed', kind: 'recommendations', weight: 4 }] }));
    assert.deepEqual(normalized.genre_ids, [35]);
    assert.deepEqual(normalized.genres, [{ id: 35, name: 'Comedy' }]);
    assert.equal(normalized.poster_path, '/poster.jpg');
    assert.equal(normalized.overview, 'Story');
    assert.deepEqual(normalized.recommendation_sources, [{ seed_key: 'movie:4', seed_title: 'Seed', kind: 'recommendations', weight: 4 }]);
});

test('identifies anime by Japanese original language and animation genre together', function() {
    assert.equal(typeof engine.isAnime, 'function');
    const fixtures = [
        [movie(1, {genre_ids:[16],original_language:'ja'}), true],
        [tv(2, {genre_ids:[16,10759],original_language:'ja'}), true],
        [movie(3, {genre_ids:[16],original_language:'en',origin_country:['US']}), false],
        [tv(4, {genre_ids:[18],original_language:'ja',origin_country:['JP']}), false],
        [movie(5, {genre_ids:[16],original_language:'zh'}), false],
        [movie(6, {genre_ids:[16],origin_country:['JP']}), false],
        [movie(7, {genre_ids:undefined,genres:[{id:16,name:'Animation'}],original_language:'ja'}), true],
        [movie(8, {genre_ids:[16],original_language:'ja',source:'cub'}), false]
    ];
    for (const [card, expected] of fixtures) {
        assert.equal(engine.isAnime(card), expected, 'anime classification for ' + card.id);
        const normalized = engine.normalizeCard(card);
        if (normalized) assert.equal(engine.isAnime(normalized), expected);
    }
});

test('anime filter retains both movie and TV IDs while applying ordinary exclusions', function() {
    const p = profile({viewed:[movie(1,{genre_ids:[16],original_language:'ja'})]});
    const candidates = [
        movie(1,{genre_ids:[16],original_language:'ja'}),
        movie(2,{genre_ids:[16],original_language:'ja'}),
        tv(2,{genre_ids:[16],original_language:'ja'}),
        movie(3,{genre_ids:[16],original_language:'en'}),
        tv(4,{genre_ids:[18],original_language:'ja'}),
        movie(5,{genre_ids:[16],original_language:'ja',adult:true}),
        tv(6,{genre_ids:[16],original_language:'ja',first_air_date:'2028-01-01'})
    ];
    assert.deepEqual(keys(engine.rank(candidates,p,{now,mediaType:'anime'})).sort(), ['movie:2','tv:2']);
    assert.deepEqual(keys(engine.rank(candidates,p,{now,mediaType:'tv'})).sort(), ['tv:2','tv:4']);
});

test('imports untimestamped current history as usable weak positive seeds', function() {
    const p = profile({ history: [movie(1), tv(2)] });
    assert.equal(p.stats.history, 2);
    assert.equal(p.signals.length, 2);
    assert.deepEqual(keys(p.seeds).sort(), ['movie:1', 'tv:2']);
    assert.equal(p.excluded['movie:1'], true);
    assert.ok(p.genres['18'] > 0);
});

test('explicit likes are stronger than viewed and history while books remain weak', function() {
    const p = profile({ history: [movie(1)], viewed: [movie(2)], like: [movie(3)], book: [movie(4)] });
    const weights = Object.fromEntries(p.seeds.map(function(seed) { return [seed.key, seed.weight]; }));
    assert.ok(weights['movie:3'] > weights['movie:2']);
    assert.ok(weights['movie:2'] > weights['movie:1']);
    assert.ok(weights['movie:1'] > weights['movie:4']);
});

test('equivalent second and millisecond history timestamps have equal recency', function() {
    const p = profile({ history: [movie(1, { time: (now - 10 * day) / 1000 }), movie(2, { time: now - 10 * day }), movie(3, { time: now - 365 * day })] });
    const weights = Object.fromEntries(p.seeds.map(function(seed) { return [seed.key, seed.weight]; }));
    assert.equal(weights['movie:1'], weights['movie:2']);
    assert.ok(weights['movie:2'] > weights['movie:3']);
});

test('limits seeds and preserves recent history even when many explicit likes exist', function() {
    const likes = Array.from({ length: 12 }, function(_, i) { return movie(i + 1); });
    const p = profile({ like: likes, history: [movie(100, { time: now - day }), movie(101, { time: now - 100 * day })] });
    assert.equal(p.seeds.length, 8);
    assert.ok(p.seeds.some(function(seed) { return seed.key === 'movie:100'; }));
    assert.ok(p.seeds.some(function(seed) { return seed.key === 'movie:1'; }));
    assert.equal(new Set(p.seeds.map(function(seed) { return seed.key; })).size, 8);
});

test('respects newest-first Favorite history order when activity timestamps are absent', function() {
    const p = profile({ history: [movie(900), movie(800), movie(2), movie(1)] });
    assert.deepEqual(keys(p.seeds), ['movie:900', 'movie:800', 'movie:2', 'movie:1']);
    assert.ok(p.seeds[0].weight > p.seeds[3].weight);
    assert.ok(p.signals.every(function(signal) { return signal.at === 0; }));
});

test('reserves the newest untimestamped history seed rather than its smallest TMDB ID', function() {
    const likes = Array.from({ length: 12 }, function(_, i) { return movie(i + 1); });
    const p = profile({ like: likes, history: [movie(900), movie(800)] });
    assert.ok(p.seeds.some(function(seed) { return seed.key === 'movie:900'; }));
    assert.ok(!p.seeds.some(function(seed) { return seed.key === 'movie:800'; }));
});

test('hides and thrown cards exclude themselves and create negative genre preferences', function() {
    const p = profile({ thrown: [movie(1, { genre_ids: [27] })] }, { 'movie:2': { card: movie(2, { genre_ids: [99] }), action: 'hide', at: now } });
    assert.equal(p.excluded['movie:1'], true);
    assert.equal(p.excluded['movie:2'], true);
    assert.ok(p.genres['27'] < 0);
    assert.ok(p.genres['99'] < 0);
    assert.equal(p.seeds.length, 0);
});

test('the latest explicit action replaces a prior feedback meaning', function() {
    const card = movie(1);
    const hidden = profile({}, { 'movie:1': { card, action: 'hide', at: now } });
    const liked = profile({}, { 'movie:1': { card, action: 'like', at: now } });
    const seen = profile({}, { 'movie:1': { card, action: 'seen', at: now } });
    assert.equal(hidden.excluded['movie:1'], true);
    assert.equal(liked.excluded['movie:1'], undefined);
    assert.equal(liked.seeds[0].key, 'movie:1');
    assert.equal(seen.excluded['movie:1'], true);
    assert.ok(seen.seeds[0].weight < liked.seeds[0].weight);
});

test('a new like never erases existing viewed or history exclusions', function() {
    const p = profile({ viewed: [movie(1)], history: [movie(2)] }, { 'movie:1': { card: movie(1), action: 'like', at: now }, 'movie:2': { card: movie(2), action: 'like', at: now } });
    assert.equal(p.excluded['movie:1'], true);
    assert.equal(p.excluded['movie:2'], true);
    assert.deepEqual(keys(engine.rank([movie(1), movie(2), movie(3)], p, { now })), ['movie:3']);
});

test('hidden feedback suppresses stale like seed influence for the same card', function() {
    const p = profile({ like: [movie(1, { genre_ids: [27] })] }, { 'movie:1': { card: movie(1, { genre_ids: [27] }), action: 'hide', at: now } });
    assert.equal(p.seeds.length, 0);
    assert.ok(p.genres['27'] < 0);
});

test('ignores malformed feedback and mismatched type identities', function() {
    const p = profile({}, { 'tv:1': { card: movie(1), action: 'like', at: now }, 'movie:2': { card: movie(2), action: 'unknown', at: now }, 'movie:3': null });
    assert.equal(p.signals.length, 0);
    assert.equal(p.seeds.length, 0);
});

test('handles absent and malformed category inputs with an empty profile', function() {
    const p = profile({ history: 'invalid', viewed: null, like: [null, { id: 0 }] });
    assert.deepEqual(p.signals, []);
    assert.deepEqual(p.seeds, []);
    assert.deepEqual(engine.rank(null, p, { now }), []);
});

test('filters viewed, hidden, adult and upcoming materials without suppressing other media types', function() {
    const p = profile({ viewed: [movie(1)], thrown: [movie(2)] });
    const ranked = engine.rank([movie(1), tv(1), movie(2), movie(3, { adult: true }), movie(4, { release_date: '2027-01-01' }), tv(5, { first_air_date: '2027-01-01' }), movie(6, { release_date: '2026-10-03' })], p, { now });
    assert.deepEqual(keys(ranked).sort(), ['movie:6', 'tv:1']);
});

test('deduplicates candidate cards by media type and merges their seed explanations', function() {
    const p = profile({ like: [movie(1), movie(2)] });
    const ranked = engine.rank([movie(8, { recommendation_sources: [{ seed_key: 'movie:1', seed_title: 'One', kind: 'recommendations' }] }), movie(8, { recommendation_sources: [{ seed_key: 'movie:2', seed_title: 'Two', kind: 'similar' }] }), tv(8)], p, { now });
    assert.equal(ranked.length, 2);
    assert.equal(ranked.find(function(card) { return card.media_type === 'movie'; }).recommendation_sources.length, 2);
});

test('prefers candidates linked to liked seeds and explains the actual source', function() {
    const p = profile({ like: [movie(1, { title: 'Favourite' })] });
    const ranked = engine.rank([movie(2), movie(3, { recommendation_sources: [{ seed_key: 'movie:1', seed_title: 'Favourite', kind: 'recommendations' }] })], p, { now });
    assert.equal(ranked[0].id, 3);
    assert.match(ranked[0].recommendation_reason, /Favourite/);
    assert.ok(Number.isFinite(ranked[0].recommendation_score));
});

test('shrinks extreme ratings with too few votes towards a safe prior', function() {
    const ranked = engine.rank([movie(1, { vote_average: 10, vote_count: 1 }), movie(2, { vote_average: 8, vote_count: 2000 })], profile(), { now });
    assert.equal(ranked[0].id, 2);
});

test('negative genres reduce relevance without erasing abundant positive interests', function() {
    const likes = Array.from({ length: 24 }, function(_, i) { return movie(i + 1, { genre_ids: [i + 100] }); });
    const p = profile({ like: likes, thrown: [movie(50, { genre_ids: [27] })] });
    const ranked = engine.rank([movie(1000, { genre_ids: [27] }), movie(1001, { genre_ids: [100] }), movie(1002, { genre_ids: [999] })], p, { now });
    assert.deepEqual(ranked.map(function(card) { return card.id; }), [1001, 1002, 1000]);
    assert.ok(p.genres['100'] > 0.2);
});

test('does not describe a negatively preferred genre as a favourite', function() {
    const p = profile({ like: [movie(1, { genre_ids: [18] })], thrown: [movie(2, { genre_ids: [27] })] });
    const ranked = engine.rank([movie(3, { genre_ids: [27] })], p, { now });
    assert.doesNotMatch(ranked[0].recommendation_reason, /любимым жанрам/);
});

test('uses release freshness to break otherwise equal recommendations', function() {
    const ranked = engine.rank([movie(1, { release_date: '1990-01-01' }), movie(2, { release_date: '2026-09-01' })], profile(), { now });
    assert.equal(ranked[0].id, 2);
});

test('respects an explicitly supplied zero timestamp instead of the system clock', function() {
    assert.deepEqual(engine.rank([movie(1)], profile(), { now: 0 }), []);
    assert.equal(engine.buildProfile({ history: [movie(1)] }, {}, { now: 0 }).seeds.length, 0);
});

test('supports legacy seed provenance aliases without trusting an inflated source weight', function() {
    const p = profile({ like: [movie(1, { title: 'Trusted favourite' })] });
    const ranked = engine.rank([movie(2, { recommendation_sources: [{ key: 'movie:1', title: 'Cached seed', weight: 99999 }] }), movie(3, { recommendation_sources: [{ seed_key: 'movie:999', seed_title: 'Unknown', kind: 'recommendations', weight: 99999 }] })], p, { now });
    assert.equal(ranked[0].id, 2);
    assert.match(ranked[0].recommendation_reason, /Trusted favourite/);
    assert.equal(ranked[0].recommendation_sources[0].seed_key, 'movie:1');
    assert.ok(ranked[0].recommendation_score < 10);
});

test('reduces repetition of one genre and seed while remaining deterministic', function() {
    const p = profile({ like: [movie(1)] });
    const candidates = [2, 3, 4, 5].map(function(id) { return movie(id, { genre_ids: [18], recommendation_sources: [{ seed_key: 'movie:1', seed_title: 'Film 1', kind: 'recommendations' }] }); });
    candidates.push(movie(6, { genre_ids: [35], vote_average: 8, vote_count: 1000 }));
    const ranked = engine.rank(candidates, p, { now });
    assert.ok(ranked.findIndex(function(card) { return card.id === 6; }) < 4);
    assert.deepEqual(ranked, engine.rank(candidates.slice().reverse(), p, { now }));
    for (let i = 1; i < ranked.length; i++) assert.ok(ranked[i - 1].recommendation_score >= ranked[i].recommendation_score);
});

test('labels cold start honestly and obeys a requested output limit', function() {
    const ranked = engine.rank([movie(1), movie(2), tv(3)], profile(), { now, limit: 2 });
    assert.equal(ranked.length, 2);
    assert.match(ranked[0].recommendation_reason, /начальная|популяр/i);
});

test('builds profiles and ranked cards without mutating source data', function() {
    const favorites = { history: [movie(1, { time: now - day })], like: [tv(2)] };
    const feedback = { 'movie:3': { card: movie(3), action: 'hide', at: now } };
    const candidates = [movie(4, { recommendation_sources: [{ seed_key: 'tv:2', seed_title: 'Series 2', kind: 'similar' }] })];
    const before = JSON.stringify({ favorites, feedback, candidates });
    const p = profile(favorites, feedback);
    const pBefore = JSON.stringify(p);
    engine.rank(candidates, p, { now });
    assert.equal(JSON.stringify({ favorites, feedback, candidates }), before);
    assert.equal(JSON.stringify(p), pBefore);
});

test('exports the same behavior in a browser without CommonJS', function() {
    assert.ok(fs.existsSync(file));
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(file, 'utf8'), context);
    assert.equal(typeof context.LampacRecommendationEngine.rank, 'function');
    assert.equal(context.LampacRecommendationEngine.key({ id: 12, title: 'Browser' }), 'movie:12');
});

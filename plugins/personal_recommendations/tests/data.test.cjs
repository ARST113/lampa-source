const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const modulePath = path.join(__dirname, '../src/data.js');
const data = fs.existsSync(modulePath) ? require(modulePath) : {};
const movie = (id, extra = {}) => Object.assign({id, title: 'Movie ' + id, source: 'tmdb', media_type: 'movie', genre_ids: [18], release_date: '2020-01-01', vote_average: 7, vote_count: 100}, extra);
const series = (id, extra = {}) => Object.assign({id, name: 'Series ' + id, source: 'tmdb', media_type: 'tv', genre_ids: [18], first_air_date: '2020-01-01', vote_average: 7, vote_count: 100}, extra);

function fixture(favorites = {}) {
    const values = {lampac_unic_id: 'local-device', lampac_profile_id: 'alice', account_email: 'family@example.test'};
    const calls = [];
    const lampa = {
        Storage: {
            get(key, fallback) { return key in values ? values[key] : fallback; },
            set(key, value) { values[key] = value; },
            field(key) { return values[key]; }
        },
        Favorite: {get(params) { calls.push(params); return favorites[params.type] || []; }}
    };
    return {lampa, values, calls, favorites};
}

function makeAdapter(f, options = {}) {
    assert.equal(typeof data.create, 'function', 'adapter factory exists');
    const engine = require('../src/engine.js');
    return data.create(f.lampa, engine, Object.assign({now: () => Date.UTC(2026, 9, 3)}, options));
}

function load(adapter, force = false) {
    return new Promise((resolve, reject) => adapter.load(resolve, reject, force));
}

function timers() {
    let next = 1;
    const jobs = new Map();
    return {
        setTimeout(fn, delay) { const id = next++; jobs.set(id, {fn, delay}); return id; },
        clearTimeout(id) { jobs.delete(id); },
        tick() { const pending = Array.from(jobs); jobs.clear(); pending.forEach(([, job]) => job.fn()); },
        size() { return jobs.size; }
    };
}

test('reads full cards through the active Favorite category API', () => {
    assert.equal(typeof data.readFavorites, 'function');
    const favorite = fixture({history: [movie(10)], viewed: [series(10)], like: [movie(20)], book: [series(30)], thrown: [movie(40)]});
    assert.deepEqual(data.readFavorites(favorite.lampa), favorite.favorites);
    assert.deepEqual(favorite.calls, [{type:'history'}, {type:'viewed'}, {type:'like'}, {type:'book'}, {type:'thrown'}]);
});

test('uses Favorite.all fallback and never treats raw ID arrays as full cards', () => {
    assert.equal(typeof data.readFavorites, 'function');
    const result = data.readFavorites({Favorite: {all() {return {history:[movie(9)], viewed:[123], like:[series(5)], book:null};}}});
    assert.deepEqual(result, {history:[movie(9)], viewed:[], like:[series(5)], book:[], thrown:[]});
});

test('owner hashes account and profile identity without storing credentials in keys', () => {
    assert.equal(typeof data.owner, 'function');
    const f = fixture();
    const first = data.owner(f.lampa);
    assert.equal(first, data.owner(f.lampa));
    assert.match(first, /^owner-[a-f0-9]+$/);
    f.values.lampac_profile_id = 'bob';
    assert.notEqual(data.owner(f.lampa), first);
    f.values.lampac_profile_id = 'alice';
    f.values.account_email = 'other@example.test';
    assert.notEqual(data.owner(f.lampa), first);
});

test('fallback CUB account.profile.id separates active Lampa profiles', () => {
    const f = fixture();
    delete f.values.lampac_profile_id;
    f.values.account = {email:'cub@example.test', token:'do-not-store-in-keys', profile:{id:1,name:'First'}};
    const first = data.owner(f.lampa);
    f.values.account.profile = {id:2,name:'Second'};
    assert.notEqual(data.owner(f.lampa), first);
    assert.ok(!data.owner(f.lampa).includes('do-not-store'));
});

test('LampacSync identity is stable across epochs while requests reject a changed epoch', async () => {
    const f = fixture();
    let epoch = 1;
    f.values.lampac_sync_owner_v1 = 'https://lampac.example|canonical-user|alice';
    f.lampa.LampacSync = {ready:() => true, uid:() => 'canonical-user', profile:() => 'alice', epoch:() => epoch};
    const pending = [];
    const adapter = makeAdapter(f, {request(method,done) {pending.push(done);}});
    const initialOwner = data.owner(f.lampa);
    const result = load(adapter);
    epoch++;
    assert.equal(data.owner(f.lampa), initialOwner);
    pending.forEach(done => done({results:[movie(77)]}));
    await assert.rejects(result, error => error.code === 'OWNER_CHANGED');
    adapter.dispose();
});

test('pending LampacSync never reads favorites or persists feedback for a new owner', async () => {
    const f = fixture({history:[movie(10)]});
    f.lampa.LampacSync = {ready:() => false, uid:() => 'canonical-user', profile:() => 'alice', epoch:() => 1};
    const adapter = makeAdapter(f, {request() {throw new Error('unexpected request');}});
    await assert.rejects(load(adapter), error => error.code === 'SYNC_PENDING');
    assert.equal(f.calls.length, 0);
    assert.equal(adapter.setFeedback(movie(10),'like'), false);
    assert.deepEqual(adapter.feedback(), {});
    adapter.dispose();
});

test('uses verified tmdb.get arguments and keeps movie and TV IDs separate', async () => {
    const f = fixture();
    const paths = [];
    const invocations = [];
    f.lampa.Api = {sources: {tmdb: {get(method, params, complete, fail, cache) {
        paths.push(method);
        invocations.push({method,params,failType:typeof fail,cache});
        complete({results: params.orig_lang === 'ja' ? [] : [method.includes('/tv/') ? series(77) : movie(77)]});
    }}}};
    const adapter = makeAdapter(f);
    const snapshot = await load(adapter);
    assert.deepEqual(paths.sort(), ['discover/movie','discover/tv','trending/movie/week', 'trending/tv/week']);
    assert.ok(invocations.every(call => call.failType === 'function' && call.cache === false));
    assert.ok(invocations.filter(call => call.method.startsWith('trending/')).every(call => Object.keys(call.params).length === 0));
    assert.ok(invocations.filter(call => call.method.startsWith('discover/')).every(call => call.params.orig_lang === 'ja' && call.params.genres === '16'));
    assert.deepEqual(snapshot.cards.map(card => card.media_type + ':' + card.id).sort(), ['movie:77','tv:77']);
    assert.equal(snapshot.stale, false);
    adapter.dispose();
});

test('bounds concurrency and requests seeds plus discover without mixing media types', async () => {
    const f = fixture({like: [movie(10),series(20)]});
    const pending = [];
    let active = 0;
    let maximum = 0;
    const paths = [];
    const parameters = [];
    const adapter = makeAdapter(f, {request(method, done, fail, params) {
        active++; maximum = Math.max(maximum, active); paths.push(method);
        parameters.push(params);
        pending.push(() => {active--; done({results:[]});});
    }});
    const result = load(adapter);
    assert.equal(pending.length, 2);
    while (pending.length) pending.shift()();
    const snapshot = await result;
    assert.equal(maximum, 2);
    assert.ok(paths.includes('movie/10/recommendations'));
    assert.ok(paths.includes('tv/20/recommendations'));
    assert.ok(paths.includes('discover/movie'));
    assert.ok(paths.includes('discover/tv'));
    const genreMovieIndex = paths.findIndex((path,index) => path === 'discover/movie' && !parameters[index].orig_lang);
    assert.deepEqual(parameters[genreMovieIndex], {genres:'18',page:1,sort_by:'popularity.desc',filter:{'vote_count.gte':80}});
    assert.equal(snapshot.failures, 0);
    assert.deepEqual(snapshot.cards, []);
    adapter.dispose();
});

test('merges seed provenance for duplicate candidates', async () => {
    const f = fixture({like:[movie(10),movie(20)]});
    const adapter = makeAdapter(f, {request(method, done) {
        done({results: /^movie\/\d+\/recommendations/.test(method) ? [movie(99)] : []});
    }});
    const snapshot = await load(adapter);
    assert.equal(snapshot.cards.length, 1);
    assert.deepEqual(snapshot.cards[0].recommendation_sources.map(s => s.seed_key).sort(), ['movie:10','movie:20']);
    adapter.dispose();
});

test('each load rereads synchronized favorites and reranks cached candidates', async () => {
    const f = fixture({like:[movie(77)]});
    let requests = 0;
    const adapter = makeAdapter(f, {request(method, done) {requests++; done({results: method === 'trending/movie/week' ? [movie(77)] : []});}});
    const first = await load(adapter);
    assert.equal(first.cards.length, 1);
    f.favorites.viewed = [movie(77)];
    const second = await load(adapter);
    assert.equal(second.cards.length, 0);
    assert.equal(second.profile.stats.viewed, 1);
    assert.equal(requests, 7);
    adapter.dispose();
});

test('discovers only genres that exist for the requested media type', async () => {
    const f = fixture({like:[movie(10, {genre_ids:[28]}), series(20,{genre_ids:[10765]})]});
    const discover = [];
    const adapter = makeAdapter(f,{request(method,done,fail,params) {
        if (method.startsWith('discover/') && !params.orig_lang) discover.push({path:method,genre:params.genres});
        done({results:[]});
    }});
    await load(adapter);
    assert.deepEqual(discover.sort((a,b) => a.path.localeCompare(b.path)), [{path:'discover/movie',genre:'28'},{path:'discover/tv',genre:'10765'}]);
    adapter.dispose();
});

test('a new liked seed refreshes the candidate pool before its TTL expires', async () => {
    const f = fixture();
    const paths = [];
    const adapter = makeAdapter(f,{request(method,done) {
        paths.push(method);
        done({results:method === 'movie/10/recommendations' ? [movie(88)] : method === 'trending/movie/week' ? [movie(77)] : []});
    }});
    await load(adapter);
    f.favorites.like = [movie(10)];
    const refreshed = await load(adapter);
    assert.ok(paths.includes('movie/10/recommendations'));
    assert.ok(refreshed.cards.some(card => card.id === 88));
    adapter.dispose();
});

test('mixed history receives anime movie and TV discover candidates without suppressing trending', async () => {
    const f = fixture({like:[movie(10,{genre_ids:[18]})]});
    const queries = [];
    const adapter = makeAdapter(f,{request(method,done,fail,params) {
        queries.push({method,params});
        if (params.orig_lang === 'ja') {
            const candidate = method === 'discover/tv' ? series(50,{genre_ids:[16],original_language:'ja'}) : movie(50,{genre_ids:[16],original_language:'ja'});
            done({results:[candidate, movie(90,{genre_ids:[16],original_language:'en'})]});
        } else done({results:method === 'trending/movie/week' ? [movie(70)] : []});
    }});
    const snapshot = await load(adapter);
    const animeQueries = queries.filter(query => query.params.orig_lang === 'ja');
    assert.deepEqual(animeQueries.map(query => query.method).sort(), ['discover/movie','discover/tv']);
    assert.ok(animeQueries.every(query => query.params.genres === '16' && query.params.page === 1));
    assert.ok(queries.some(query => query.method === 'trending/movie/week'));
    assert.ok(queries.some(query => query.method === 'trending/tv/week'));
    const engine = require('../src/engine.js');
    assert.deepEqual(snapshot.cards.filter(engine.isAnime).map(card => card.media_type + ':' + card.id).sort(), ['movie:50','tv:50']);
    assert.ok(snapshot.cards.some(card => card.id === 70));
    assert.ok(!snapshot.cards.some(card => card.id === 90));
    adapter.dispose();
});

test('late anime candidates still enter a full bounded pool and each anime source is bounded', async () => {
    const f = fixture();
    const adapter = makeAdapter(f,{request(method,done,fail,params) {
        if (method === 'trending/movie/week') done({results:Array.from({length:600},(_,index) => movie(index+1))});
        else if (params.orig_lang === 'ja') done({results:Array.from({length:100},(_,index) => method === 'discover/tv' ? series(1000+index,{genre_ids:[16],original_language:'ja'}) : movie(1000+index,{genre_ids:[16],original_language:'ja'}))});
        else done({results:[]});
    }});
    const snapshot = await load(adapter);
    const engine = require('../src/engine.js');
    assert.equal(snapshot.cards.length, 500);
    assert.equal(snapshot.cards.filter(engine.isAnime).length, 40);
    assert.ok(snapshot.cards.some(card => !engine.isAnime(card)));
    assert.ok(snapshot.cards.some(card => engine.isAnime(card) && card.media_type === 'tv'));
    adapter.dispose();
});

test('resolves CUB IMDb history without guessing IDs or modifying Favorite cards', async () => {
    const original = movie(12345,{source:'cub',imdb_id:'tt0137523',time:Date.UTC(2026,9,2)});
    const f = fixture({history:[original]});
    const paths = [];
    const adapter = makeAdapter(f,{request(method,done) {
        paths.push(method);
        if (method === 'find/tt0137523?external_source=imdb_id') done({movie_results:[movie(550)],tv_results:[]});
        else done({results:method === 'movie/550/recommendations' ? [movie(99)] : []});
    }});
    const snapshot = await load(adapter);
    assert.ok(paths.includes('movie/550/recommendations'));
    assert.ok(!paths.includes('movie/12345/recommendations'));
    assert.equal(snapshot.profile.stats.history, 1);
    assert.equal(snapshot.profile.seeds[0].id, 550);
    assert.equal(snapshot.profile.signals[0].at, Date.UTC(2026,9,2));
    assert.equal(snapshot.cards[0].id, 99);
    assert.equal(original.id, 12345);
    assert.equal(original.source, 'cub');
    adapter.dispose();
});

test('IMDb resolution is capped at eight and cached under the active owner', async () => {
    const f = fixture({like:Array.from({length:12},(_,index) => movie(1000+index,{source:'cub',imdb_id:'tt' + (1000000+index)}))});
    const paths = [];
    const adapter = makeAdapter(f,{request(method,done) {
        paths.push(method);
        if (method.startsWith('find/')) done({movie_results:[movie(Number(method.match(/tt(\d+)/)[1]))],tv_results:[]});
        else done({results:method === 'trending/movie/week' ? [movie(77)] : []});
    }});
    await load(adapter);
    assert.equal(paths.filter(p => p.startsWith('find/')).length, 8);
    paths.length = 0;
    await load(adapter);
    assert.equal(paths.filter(p => p.startsWith('find/')).length, 4);
    f.values.lampac_profile_id = 'bob';
    paths.length = 0;
    await load(adapter);
    assert.equal(paths.filter(p => p.startsWith('find/')).length, 8);
    adapter.dispose();
});

test('bounded IMDb lookup favors recent history when timestamps mix seconds and milliseconds', async () => {
    const f = fixture({history:[movie(1,{source:'cub',imdb_id:'tt0000001',time:Date.UTC(2020,0,1)})].concat(Array.from({length:8},(_,index) => movie(index+2,{source:'cub',imdb_id:'tt000000' + (index+2),time:Date.UTC(2026,9,1)/1000 + index}))) });
    const found = [];
    const adapter = makeAdapter(f,{request(method,done) {
        if (method.startsWith('find/')) {found.push(method); done({movie_results:[],tv_results:[]});}
        else done({results:[]});
    }});
    await load(adapter);
    assert.equal(found.length, 8);
    assert.ok(!found.includes('find/tt0000001?external_source=imdb_id'));
    adapter.dispose();
});

test('feedback persists locally per owner and an old card cannot affect the new profile', async () => {
    const f = fixture();
    const adapter = makeAdapter(f, {request(method, done) {done({results:method === 'trending/movie/week' ? [movie(77)] : []});}});
    const alice = await load(adapter);
    assert.equal(adapter.setFeedback(alice.cards[0], 'like'), true);
    assert.equal(adapter.feedback()['movie:77'].action, 'like');
    f.values.lampac_profile_id = 'bob';
    assert.deepEqual(adapter.feedback(), {});
    assert.equal(adapter.setFeedback(alice.cards[0], 'hide'), false);
    assert.equal(adapter.removeFeedback(alice.cards[0]), false);
    assert.deepEqual(adapter.feedback(), {});
    assert.equal(adapter.setFeedback(series(77), 'seen'), true);
    assert.equal(adapter.feedback()['tv:77'].action, 'seen');
    f.values.lampac_profile_id = 'alice';
    assert.equal(adapter.feedback()['movie:77'].action, 'like');
    assert.equal(adapter.removeFeedback(movie(77)), true);
    assert.deepEqual(adapter.feedback(), {});
    assert.ok(Object.keys(f.values).filter(key => key.includes('recommendation')).every(key => !key.includes('@') && !key.includes('alice')));
    adapter.dispose();
});

test('only valid TMDB cards and supported feedback actions enter local feedback', () => {
    const f = fixture();
    const adapter = makeAdapter(f, {request() {}});
    assert.equal(adapter.setFeedback(movie(1), 'skip'), false);
    assert.equal(adapter.setFeedback(movie(1, {source:'kinopoisk'}), 'like'), false);
    assert.deepEqual(adapter.feedback(), {});
    adapter.dispose();
});

test('feedback cap retains the latest 300 distinct media records', () => {
    const f = fixture();
    let clock = Date.UTC(2026, 9, 3);
    const adapter = makeAdapter(f, {request() {}, now: () => ++clock});
    for (let id = 1; id <= 305; id++) adapter.setFeedback(movie(id), 'hide');
    const saved = adapter.feedback();
    assert.equal(Object.keys(saved).length, 300);
    assert.equal(saved['movie:1'], undefined);
    assert.equal(saved['movie:305'].action, 'hide');
    adapter.dispose();
});

test('malformed and failed sources leave useful results and finish exactly once', async () => {
    const f = fixture({like:[movie(10)]});
    let terminal = 0;
    const adapter = makeAdapter(f, {request(method, done, fail) {
        if (method === 'trending/movie/week') {done({results:[movie(77)]}); fail(); done({results:[movie(78)]});}
        else if (method === 'trending/tv/week') done({results:null});
        else fail(new Error('offline'));
    }});
    const snapshot = await new Promise((resolve,reject) => adapter.load(s => {terminal++; resolve(s);}, reject));
    assert.equal(terminal, 1);
    assert.deepEqual(snapshot.cards.map(c => c.id), [77]);
    assert.ok(snapshot.failures >= 2);
    adapter.dispose();
});

test('timeouts release request slots and terminate an empty-history load once', async () => {
    const f = fixture();
    const clock = timers();
    let terminals = 0;
    const adapter = makeAdapter(f, {request() {}, timers: clock, timeoutMs:8000});
    const result = new Promise(resolve => adapter.load(() => {throw new Error('unexpected success');}, error => {terminals++; resolve(error);}));
    assert.equal(clock.size(), 2);
    clock.tick();
    assert.equal(clock.size(), 2);
    clock.tick();
    const error = await result;
    assert.equal(error.code, 'NETWORK_FAILED');
    assert.equal(error.failures, 4);
    assert.equal(terminals, 1);
    assert.equal(clock.size(), 0);
    adapter.dispose();
});

test('forced refresh falls back to owner cache offline and marks it stale', async () => {
    const f = fixture();
    let offline = false;
    const adapter = makeAdapter(f, {request(method, done, fail) {if (offline) fail(); else done({results:method === 'trending/movie/week' ? [movie(77)] : []});}});
    await load(adapter);
    offline = true;
    const cached = await load(adapter, true);
    assert.equal(cached.stale, true);
    assert.equal(cached.failures, 4);
    assert.deepEqual(cached.cards.map(c => c.id), [77]);
    adapter.dispose();
});

test('owner-scoped cache survives adapter recreation and expires after 30 minutes', async () => {
    const f = fixture();
    let clock = Date.UTC(2026, 9, 3);
    const first = makeAdapter(f, {now:() => clock, request(method, done) {done({results:method === 'trending/movie/week' ? [movie(77)] : []});}});
    await load(first);
    first.dispose();
    let requests = 0;
    const second = makeAdapter(f, {now:() => clock, request(method,done,fail) {requests++; fail();}});
    assert.equal((await load(second)).stale, false);
    assert.equal(requests, 0);
    clock += 30 * 60 * 1000 + 1;
    assert.equal((await load(second)).stale, true);
    assert.equal(requests, 4);
    f.values.lampac_profile_id = 'bob';
    await assert.rejects(load(second), error => error.code === 'NETWORK_FAILED');
    second.dispose();
});

test('late results from a switched profile never render or populate either owner cache', async () => {
    const f = fixture();
    const pending = [];
    const clock = timers();
    const adapter = makeAdapter(f, {timers:clock, request(method,done,fail) {pending.push({method,done,fail});}});
    let success = 0;
    let errors = 0;
    const old = new Promise(resolve => adapter.load(() => {success++;}, error => {errors++; resolve(error);}));
    f.values.lampac_profile_id = 'bob';
    pending[0].done({results:[movie(77)]});
    pending[1].done({results:[series(88)]});
    const error = await old;
    assert.equal(error.code, 'OWNER_CHANGED');
    assert.equal(success, 0);
    assert.equal(errors, 1);
    assert.equal(clock.size(), 0);
    const current = load(adapter);
    assert.equal(pending.length, 4);
    pending[2].done({results:[]}); pending[3].done({results:[]});
    pending[4].done({results:[]}); pending[5].done({results:[]});
    assert.deepEqual((await current).cards, []);
    adapter.dispose();
});

test('invalidate refreshes candidates and dispose ignores all pending callbacks', async () => {
    const f = fixture();
    const pending = [];
    const clock = timers();
    let requests = 0;
    const adapter = makeAdapter(f, {timers:clock, request(method,done) {requests++; pending.push(done);}});
    const first = load(adapter);
    pending.shift()({results:[movie(77)]});
    while (pending.length) pending.shift()({results:[]});
    await first;
    adapter.invalidate();
    let terminal = 0;
    adapter.load(() => terminal++, () => terminal++);
    assert.equal(requests, 6);
    adapter.dispose();
    assert.equal(clock.size(), 0);
    pending.forEach(done => done({results:[movie(88)]}));
    clock.tick();
    assert.equal(terminal, 0);
});

test('candidate cache is bounded to 500 unique cards', async () => {
    const f = fixture();
    const adapter = makeAdapter(f, {request(method,done) {done({results:Array.from({length:600}, (_,index) => movie(index+1))});}});
    const snapshot = await load(adapter);
    assert.equal(snapshot.cards.length, 500);
    const caches = Object.keys(f.values).filter(key => key.includes('candidate'));
    assert.equal(caches.length, 1);
    assert.equal(f.values[caches[0]].cards.length, 500);
    adapter.dispose();
});

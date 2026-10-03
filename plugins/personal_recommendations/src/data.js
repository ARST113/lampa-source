(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(root);
    else root.LampacRecommendationData = factory(root);
}(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this, function (root) {
    'use strict';

    var categories = ['history', 'viewed', 'like', 'book', 'thrown'];
    var cacheTtl = 30 * 60 * 1000;
    var candidateLimit = 500;
    var feedbackLimit = 300;
    var genreIds = {
        movie: [28,12,16,35,80,99,18,10751,14,36,27,10402,9648,10749,878,10770,53,10752,37],
        tv: [10759,16,35,80,99,18,10751,10762,9648,10763,10764,10765,10766,10767,10768,37]
    };

    function object(value) {
        return value && typeof value === 'object' && !Array.isArray(value);
    }

    function clone(value) {
        try { return JSON.parse(JSON.stringify(value)); }
        catch (ignore) { return null; }
    }

    function storageGet(lampa, key, fallback) {
        var value;
        try {
            if (lampa.Storage && typeof lampa.Storage.get === 'function') value = lampa.Storage.get(key, fallback);
            else if (lampa.Storage && typeof lampa.Storage.field === 'function') value = lampa.Storage.field(key);
        } catch (ignore) {}
        if (typeof value === 'string' && /^[\[{]/.test(value)) {
            try { value = JSON.parse(value); } catch (ignoreParse) {}
        }
        return value === undefined || value === null ? fallback : value;
    }

    function readFavorites(lampa) {
        var favorite = lampa && lampa.Favorite;
        var result = {};
        var all = null;
        var i;
        if (favorite && typeof favorite.all === 'function') {
            try { all = favorite.all(); } catch (ignoreAll) {}
        }
        for (i = 0; i < categories.length; i++) {
            var type = categories[i];
            var list = null;
            if (favorite && typeof favorite.get === 'function') {
                try { list = favorite.get({type: type}); } catch (ignoreGet) {}
            }
            if (!Array.isArray(list) && object(all)) list = all[type];
            result[type] = Array.isArray(list) ? list.filter(function (card) { return object(card); }).slice() : [];
        }
        return result;
    }

    function syncRuntime(lampa) {
        return lampa.LampacSync || root.LampacSync;
    }

    function callSync(sync, name, fallback) {
        try { return sync && typeof sync[name] === 'function' ? sync[name]() : fallback; }
        catch (ignore) { return fallback; }
    }

    function hash(text, initial) {
        var value = initial;
        for (var i = 0; i < text.length; i++) {
            value ^= text.charCodeAt(i);
            value += (value << 1) + (value << 4) + (value << 7) + (value << 8) + (value << 24);
        }
        return ('00000000' + (value >>> 0).toString(16)).slice(-8);
    }

    function owner(lampa) {
        lampa = lampa || {};
        var sync = syncRuntime(lampa);
        var ready = !sync || callSync(sync, 'ready', false);
        var identity = [];
        var profile;
        if (sync && ready) {
            identity.push(storageGet(lampa, 'lampac_sync_owner_v1', ''));
            identity.push(callSync(sync, 'uid', ''));
            identity.push(callSync(sync, 'profile', ''));
        }
        identity.push(storageGet(lampa, 'lampac_unic_id', ''));
        identity.push(storageGet(lampa, 'unic_id', ''));
        identity.push(storageGet(lampa, 'account_email', ''));
        identity.push(storageGet(lampa, 'lampac_profile_id', ''));
        profile = storageGet(lampa, 'account', {});
        identity.push(object(profile) ? profile.id || profile.email || '' : profile);
        identity.push(object(profile) && object(profile.profile) ? profile.profile.id || '' : '');
        profile = storageGet(lampa, 'profile', {});
        identity.push(object(profile) ? profile.id || profile.name || '' : profile);
        identity.push(ready ? 'ready' : 'sync-pending');
        var text = JSON.stringify(identity);
        return 'owner-' + hash(text, 2166136261) + hash(text, 3335557771);
    }

    function create(lampa, engine, options) {
        options = options || {};
        lampa = lampa || {};
        var now = options.now || function () { return new Date().getTime(); };
        var timers = options.timers || root;
        var setTimer = options.setTimeout || function (fn, delay) { return timers.setTimeout(fn, delay); };
        var clearTimer = options.clearTimeout || function (id) { timers.clearTimeout(id); };
        var timeoutMs = typeof options.timeoutMs === 'number' && options.timeoutMs > 0 ? options.timeoutMs : 8000;
        var memory = {};
        var invalidated = {};
        var active = null;
        var disposed = false;

        function state() {
            var sync = syncRuntime(lampa);
            return {owner: owner(lampa), ready: !sync || !!callSync(sync, 'ready', false), epoch: callSync(sync, 'epoch', 0)};
        }

        function sameState(expected) {
            var current = state();
            return current.ready && current.owner === expected.owner && current.epoch === expected.epoch;
        }

        function get(key) {
            var stored = storageGet(lampa, key, null);
            return stored === null ? memory[key] : stored;
        }

        function put(key, value) {
            var copy = clone(value);
            memory[key] = copy;
            try { if (lampa.Storage && typeof lampa.Storage.set === 'function') lampa.Storage.set(key, copy); }
            catch (ignore) {}
        }

        function feedbackKey(identity) { return 'lampac_recommendation_feedback_' + identity; }
        function cacheKey(identity) { return 'lampac_recommendation_candidates_' + identity; }
        function resolutionKey(identity) { return 'lampac_recommendation_resolved_' + identity; }

        function imdb(card) {
            return card && typeof card.imdb_id === 'string' && /^tt\d+$/.test(card.imdb_id) ? card.imdb_id : '';
        }

        function resolutions(identity) {
            var saved = get(resolutionKey(identity));
            var result = {};
            if (!object(saved)) return result;
            Object.keys(saved).slice(0, 100).forEach(function (key) {
                var card = /^tt\d+$/.test(key) && saved[key] && engine.normalizeCard(saved[key].card);
                if (card) result[key] = {card:card, at:Number(saved[key].at) || 0};
            });
            return result;
        }

        function resolvedFavorites(favorites, mapped) {
            var result = {};
            categories.forEach(function (category) {
                result[category] = favorites[category].map(function (original) {
                    var entry = mapped[imdb(original)];
                    if (engine.normalizeCard(original) || !entry) return original;
                    var copy = {};
                    Object.keys(original).forEach(function (field) { copy[field] = original[field]; });
                    Object.keys(entry.card).forEach(function (field) { copy[field] = entry.card[field]; });
                    return copy;
                });
            });
            return result;
        }

        function profileFor(identity) {
            var favorites = resolvedFavorites(readFavorites(lampa), resolutions(identity));
            var profile = engine.buildProfile(favorites, readFeedback(identity), {now:now()});
            var unsupported = {};
            categories.forEach(function (category) {
                favorites[category].forEach(function (card) {
                    if (!engine.normalizeCard(card)) unsupported[String(card.source || '') + ':' + String(card.media_type || card.type || '') + ':' + String(card.id || imdb(card))] = true;
                });
            });
            profile.stats.unsupported = Object.keys(unsupported).length;
            return profile;
        }

        function topGenres(profile) {
            return Object.keys(profile.genres || {}).filter(function (genre) { return /^\d+$/.test(genre) && profile.genres[genre] > 0; }).sort(function (a, b) { return profile.genres[b] - profile.genres[a] || Number(a) - Number(b); }).slice(0, 2);
        }

        function fingerprint(profile) {
            return JSON.stringify({poolVersion:2, seeds:(profile.seeds || []).map(function (seed) { return seed.key || engine.key(seed); }).sort(), genres:topGenres(profile).sort()});
        }

        function lookupJobs(favorites, mapped) {
            var result = [];
            var seen = {};
            ['like','history','viewed','book'].forEach(function (category) {
                var ordered = favorites[category].slice();
                ordered.sort(function (a, b) {
                    function at(card) {
                        var value = card.at || card.time || card.timestamp || card.added_at || 0;
                        var numeric = Number(value);
                        if (!isFinite(numeric) && typeof value === 'string') numeric = Date.parse(value);
                        if (!isFinite(numeric) || numeric <= 0) return 0;
                        return numeric < 100000000000 ? numeric * 1000 : numeric;
                    }
                    return at(b) - at(a);
                });
                ordered.forEach(function (card) {
                    var identifier = imdb(card);
                    if (result.length === 8 || !identifier || seen[identifier] || mapped[identifier] || engine.normalizeCard(card)) return;
                    seen[identifier] = true;
                    var type = card.media_type || card.type;
                    result.push({path:'find/' + identifier + '?external_source=imdb_id', params:{}, lookup:identifier, type:type === 'movie' || type === 'tv' ? type : ''});
                });
            });
            return result;
        }

        function readFeedback(identity) {
            var saved = get(feedbackKey(identity));
            var result = {};
            if (!object(saved)) return result;
            Object.keys(saved).forEach(function (key) {
                var item = saved[key];
                var card = item && engine.normalizeCard(item.card);
                if (card && engine.key(card) === key && /^(like|hide|seen)$/.test(item.action)) {
                    result[key] = {card: card, action: item.action, at: Number(item.at) || 0};
                }
            });
            return result;
        }

        function feedback() {
            var current = state();
            return current.ready ? clone(readFeedback(current.owner)) || {} : {};
        }

        function validFeedbackCard(card, current) {
            if (!current.ready || disposed || !card) return null;
            if (card.recommendation_owner && card.recommendation_owner !== current.owner) return null;
            if (card.recommendation_epoch !== undefined && card.recommendation_epoch !== current.epoch) return null;
            return engine.normalizeCard(card);
        }

        function setFeedback(card, action) {
            var current = state();
            var normalized = validFeedbackCard(card, current);
            if (!normalized || !/^(like|hide|seen)$/.test(action)) return false;
            var saved = readFeedback(current.owner);
            var key = engine.key(normalized);
            saved[key] = {card: normalized, action: action, at: now()};
            var keys = Object.keys(saved).sort(function (a, b) { return saved[b].at - saved[a].at || (a < b ? -1 : 1); });
            for (var i = feedbackLimit; i < keys.length; i++) delete saved[keys[i]];
            if (!sameState(current)) return false;
            put(feedbackKey(current.owner), saved);
            return true;
        }

        function removeFeedback(card) {
            var current = state();
            var normalized = validFeedbackCard(card, current);
            if (!normalized) return false;
            var saved = readFeedback(current.owner);
            delete saved[engine.key(normalized)];
            if (!sameState(current)) return false;
            put(feedbackKey(current.owner), saved);
            return true;
        }

        function clearOperation(operation) {
            operation.finished = true;
            operation.timers.forEach(function (timer) { clearTimer(timer); });
            operation.timers = [];
            if (active === operation) active = null;
        }

        function failOperation(operation, code) {
            if (operation.finished || disposed) return;
            clearOperation(operation);
            if (typeof operation.error === 'function') operation.error({code: code, failures: operation.failures});
        }

        function snapshot(operation, cards, stale) {
            if (operation.finished || disposed) return;
            if (!sameState(operation.state)) return failOperation(operation, 'OWNER_CHANGED');
            var profile = profileFor(operation.state.owner);
            var ranked = engine.rank(cards, profile, {now: now(), limit: candidateLimit});
            ranked.forEach(function (card) {
                card.recommendation_owner = operation.state.owner;
                card.recommendation_epoch = operation.state.epoch;
            });
            if (!sameState(operation.state)) return failOperation(operation, 'OWNER_CHANGED');
            clearOperation(operation);
            if (typeof operation.callback === 'function') operation.callback({owner: operation.state.owner, cards: ranked, profile: profile, stats: profile.stats, stale: stale, failures: operation.failures});
        }

        function defaultRequest(path, complete, error, params) {
            var tmdb = lampa.Api && lampa.Api.sources && lampa.Api.sources.tmdb;
            if (!tmdb || typeof tmdb.get !== 'function') return error();
            return tmdb.get(path, params || {}, complete, error, false);
        }

        var request = options.request || defaultRequest;

        function jobs(profile) {
            var result = [];
            (profile.seeds || []).slice(0, 8).forEach(function (seed) {
                var card = engine.normalizeCard(seed);
                if (!card) return;
                result.push({path: card.media_type + '/' + card.id + '/recommendations', type: card.media_type, params: {}, source: {seed_key: seed.key || engine.key(card), seed_title: card.title || card.name || '', kind: 'recommendations', weight: Number(seed.weight) || 1}});
            });
            result.push({path:'trending/movie/week', type:'movie', params:{}, source:{kind:'trending'}});
            result.push({path:'trending/tv/week', type:'tv', params:{}, source:{kind:'trending'}});
            ['movie','tv'].forEach(function (type) {
                result.push({path:'discover/' + type, type:type, anime:true, params:{genres:'16', orig_lang:'ja', page:1, sort_by:'popularity.desc', filter:{'vote_count.gte':80}}, source:{kind:'genre'}});
            });
            var genres = topGenres(profile);
            genres.forEach(function (genre) {
                ['movie','tv'].forEach(function (type) {
                    if (genreIds[type].indexOf(Number(genre)) === -1) return;
                    result.push({path:'discover/' + type, type:type, params:{genres:genre, page:1, sort_by:'popularity.desc', filter:{'vote_count.gte':80}}, source:{kind:'genre'}});
                });
            });
            return result;
        }

        function mergeLookup(operation, job, response) {
            if (!object(response) || !Array.isArray(response.movie_results) || !Array.isArray(response.tv_results)) return false;
            var matches = [];
            ['movie','tv'].forEach(function (type) {
                if (job.type && job.type !== type) return;
                response[type + '_results'].forEach(function (raw) {
                    if (!object(raw)) return;
                    var input = {};
                    Object.keys(raw).forEach(function (key) { input[key] = raw[key]; });
                    input.source = 'tmdb';
                    input.media_type = type;
                    var card = engine.normalizeCard(input);
                    if (card) matches.push(card);
                });
            });
            if (matches.length === 1) {
                operation.resolved[job.lookup] = {card:matches[0], at:now()};
                var keys = Object.keys(operation.resolved).sort(function (a, b) { return operation.resolved[b].at - operation.resolved[a].at; });
                for (var i = 100; i < keys.length; i++) delete operation.resolved[keys[i]];
                put(resolutionKey(operation.state.owner), operation.resolved);
            }
            return true;
        }

        function mergeResponse(operation, job, response) {
            if (!object(response) || !Array.isArray(response.results)) return false;
            var valid = 0;
            (job.anime ? response.results.slice(0, 20) : response.results).forEach(function (raw) {
                if (!object(raw)) return;
                var input = {};
                Object.keys(raw).forEach(function (key) { input[key] = raw[key]; });
                input.media_type = job.type;
                input.source = 'tmdb';
                var card = engine.normalizeCard(input);
                if (!card) return;
                if (job.anime && !engine.isAnime(card)) return;
                valid++;
                var key = engine.key(card);
                var existing = operation.byKey[key];
                if (!existing && job.anime && operation.cards.length === candidateLimit) {
                    for (var index = operation.cards.length - 1; index >= 0; index--) {
                        if (!engine.isAnime(operation.cards[index])) {
                            delete operation.byKey[engine.key(operation.cards[index])];
                            operation.cards.splice(index, 1);
                            break;
                        }
                    }
                }
                if (!existing && operation.cards.length < candidateLimit) {
                    card.recommendation_sources = [];
                    operation.cards.push(card);
                    operation.byKey[key] = card;
                    existing = card;
                }
                if (existing) {
                    var source = clone(job.source);
                    var duplicate = existing.recommendation_sources.some(function (entry) { return entry.kind === source.kind && entry.seed_key === source.seed_key; });
                    if (!duplicate) existing.recommendation_sources.push(source);
                }
            });
            return response.results.length === 0 || valid > 0;
        }

        function load(callback, error, force) {
            if (disposed) return;
            if (active) failOperation(active, 'CANCELLED');
            var current = state();
            if (!current.ready) {
                if (typeof error === 'function') error({code:'SYNC_PENDING', failures:0});
                return;
            }
            var cached = get(cacheKey(current.owner));
            var cachedCards = cached && Array.isArray(cached.cards) ? cached.cards.slice(0, candidateLimit) : [];
            var mapped = resolutions(current.owner);
            var operation = {state:current, callback:callback, error:error, failures:0, candidateFailures:0, candidateCount:0, timers:[], finished:false, cards:[], byKey:{}, cached:cachedCards, jobs:lookupJobs(readFavorites(lampa), mapped), next:0, running:0, resolved:mapped, phase:'lookup', fingerprint:''};
            active = operation;

            function beginCandidates() {
                if (!sameState(current)) return failOperation(operation, 'OWNER_CHANGED');
                var profile = profileFor(current.owner);
                operation.fingerprint = fingerprint(profile);
                if (!force && !invalidated[current.owner] && cachedCards.length && cached.fingerprint === operation.fingerprint && now() - Number(cached.at) >= 0 && now() - Number(cached.at) < cacheTtl) {
                    snapshot(operation, cachedCards, false);
                    return;
                }
                operation.phase = 'candidates';
                var candidateJobs = jobs(profile);
                operation.candidateCount = candidateJobs.length;
                operation.jobs = operation.jobs.concat(candidateJobs);
                pump();
            }

            function finish() {
                if (operation.finished || disposed) return;
                if (!sameState(current)) return failOperation(operation, 'OWNER_CHANGED');
                if (operation.cards.length) {
                    put(cacheKey(current.owner), {at:now(), cards:operation.cards, fingerprint:operation.fingerprint});
                    delete invalidated[current.owner];
                    snapshot(operation, operation.cards, false);
                } else if (operation.cached.length) snapshot(operation, operation.cached, true);
                else if (operation.candidateFailures === operation.candidateCount) failOperation(operation, 'NETWORK_FAILED');
                else snapshot(operation, [], false);
            }

            function start(job) {
                operation.running++;
                var complete = false;
                var timer;
                function settle(response, failed) {
                    if (complete || operation.finished || disposed) return;
                    complete = true;
                    clearTimer(timer);
                    var index = operation.timers.indexOf(timer);
                    if (index !== -1) operation.timers.splice(index, 1);
                    operation.running--;
                    if (!sameState(current)) return failOperation(operation, 'OWNER_CHANGED');
                    var valid = !failed && (job.lookup ? mergeLookup(operation, job, response) : mergeResponse(operation, job, response));
                    if (!valid) {
                        operation.failures++;
                        if (!job.lookup) operation.candidateFailures++;
                    }
                    pump();
                }
                timer = setTimer(function () { settle(null, true); }, timeoutMs);
                operation.timers.push(timer);
                try { request(job.path, function (response) { settle(response, false); }, function () { settle(null, true); }, job.params); }
                catch (ignoreRequest) { settle(null, true); }
            }

            function pump() {
                if (operation.finished || disposed) return;
                while (operation.running < 2 && operation.next < operation.jobs.length && !operation.finished) start(operation.jobs[operation.next++]);
                if (!operation.running && operation.next === operation.jobs.length) {
                    if (operation.phase === 'lookup') beginCandidates();
                    else finish();
                }
            }

            pump();
        }

        function invalidate() {
            invalidated[owner(lampa)] = true;
            if (active) failOperation(active, 'CANCELLED');
        }

        function dispose() {
            disposed = true;
            if (active) clearOperation(active);
            memory = {};
        }

        return {load:load, setFeedback:setFeedback, removeFeedback:removeFeedback, feedback:feedback, invalidate:invalidate, dispose:dispose};
    }

    return {readFavorites:readFavorites, owner:owner, create:create};
}));

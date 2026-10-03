(function (root, factory) {
    'use strict';
    var engine = factory();
    if (typeof module === 'object' && module.exports) module.exports = engine;
    else root.LampacRecommendationEngine = engine;
}(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    var DAY = 86400000;
    var MAX_ID = 9007199254740991;
    var CATEGORIES = ['history', 'viewed', 'like', 'book', 'thrown'];
    var WEIGHTS = { history: 1, viewed: 2.2, like: 5, book: 0.7, thrown: -3.5 };
    var own = Object.prototype.hasOwnProperty;

    function has(object, name) { return !!object && own.call(object, name); }
    function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
    function finite(value) { return typeof value === 'number' && isFinite(value); }
    function number(value, fallback, min, max) {
        var parsed = typeof value === 'string' && value.replace(/\s/g, '') !== '' ? Number(value) : value;
        return finite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
    }
    function identifier(value) {
        if (typeof value === 'string' && !/^\d+$/.test(value)) return 0;
        var parsed = typeof value === 'string' ? Number(value) : value;
        return finite(parsed) && parsed > 0 && parsed <= MAX_ID && Math.floor(parsed) === parsed ? parsed : 0;
    }
    function text(value, limit) {
        return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').replace(/^\s+|\s+$/g, '').slice(0, limit || 1000) : '';
    }
    function date(value) {
        var clean = text(value, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return '';
        var year = Number(clean.slice(0, 4));
        var month = Number(clean.slice(5, 7));
        var day = Number(clean.slice(8, 10));
        var parsed = new Date(Date.UTC(year, month - 1, day));
        return year >= 1900 && parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day ? clean : '';
    }
    function compareKey(a, b) {
        var ak = a.key || key(a);
        var bk = b.key || key(b);
        var at = ak.split(':');
        var bt = bk.split(':');
        if (at[0] !== bt[0]) return at[0] < bt[0] ? -1 : 1;
        return Number(at[1]) - Number(bt[1]);
    }
    function sourceKey(value) {
        if (typeof value !== 'string' || !/^(movie|tv):\d+$/.test(value)) return '';
        var parts = value.split(':');
        var id = identifier(parts[1]);
        return id ? parts[0] + ':' + id : '';
    }
    function sources(values) {
        if (!Array.isArray(values)) return [];
        var result = [];
        var seen = {};
        values.slice(0, 64).forEach(function (value) {
            if (!object(value)) return;
            var seedKey = sourceKey(value.seed_key || value.key);
            var kind = text(value.kind, 32) || (seedKey ? 'recommendations' : 'trending');
            if (['recommendations', 'similar', 'trending', 'genre'].indexOf(kind) === -1) return;
            if ((kind === 'recommendations' || kind === 'similar') && !seedKey) return;
            var normalized = { seed_key: seedKey, seed_title: text(value.seed_title || value.title, 300), kind: kind };
            if (finite(value.weight)) normalized.weight = number(value.weight, 0, 0, 10);
            var identity = seedKey + ':' + kind;
            if (has(seen, identity)) {
                var prior = result[seen[identity]];
                if ((normalized.weight || 0) > (prior.weight || 0)) prior.weight = normalized.weight;
                if (normalized.seed_title && (!prior.seed_title || normalized.seed_title < prior.seed_title)) prior.seed_title = normalized.seed_title;
            } else {
                seen[identity] = result.length;
                result.push(normalized);
            }
        });
        return result.sort(function (a, b) {
            var ak = a.seed_key + ':' + a.kind;
            var bk = b.seed_key + ':' + b.kind;
            return ak < bk ? -1 : ak > bk ? 1 : 0;
        });
    }

    function normalizeCard(card) {
        if (!object(card)) return null;
        var explicit = identifier(card.tmdb_id);
        var origin = text(card.source, 64).toLowerCase();
        if (origin && origin !== 'tmdb' && !explicit) return null;
        var id = explicit || identifier(card.id);
        if (!id) return null;
        var type = text(card.media_type || card.type, 16).toLowerCase();
        if (type && type !== 'movie' && type !== 'tv') return null;
        if (!type) type = card.first_air_date || (!card.title && card.name) ? 'tv' : card.title ? 'movie' : '';
        if (!type) return null;
        var normalized = {
            id: id,
            tmdb_id: id,
            media_type: type,
            source: 'tmdb',
            adult: card.adult === true || card.adult === 'true' || card.adult === 1 || card.adult === '1',
            genre_ids: [],
            vote_average: number(card.vote_average, 0, 0, 10),
            vote_count: Math.floor(number(card.vote_count, 0, 0, 100000000)),
            popularity: number(card.popularity, 0, 0, 1000000)
        };
        ['title', 'name', 'original_title', 'original_name', 'poster_path', 'backdrop_path', 'original_language'].forEach(function (field) {
            var clean = text(card[field], field.indexOf('_path') !== -1 ? 1000 : 300);
            if (clean) normalized[field] = clean;
        });
        normalized[type === 'movie' ? 'title' : 'name'] = normalized[type === 'movie' ? 'title' : 'name'] || normalized.title || normalized.name || 'Без названия';
        var overview = text(card.overview, 10000);
        if (overview) normalized.overview = overview;
        ['release_date', 'first_air_date'].forEach(function (field) {
            var clean = date(card[field]);
            if (clean) normalized[field] = clean;
        });
        var genreSeen = {};
        var genreValues = Array.isArray(card.genre_ids) ? card.genre_ids : [];
        genreValues.slice(0, 50).forEach(function (value) {
            var genre = identifier(value);
            if (genre && !has(genreSeen, genre)) {
                genreSeen[genre] = true;
                normalized.genre_ids.push(genre);
            }
        });
        if (Array.isArray(card.genres)) {
            normalized.genres = [];
            var namedSeen = {};
            card.genres.slice(0, 50).forEach(function (value) {
                if (!object(value)) return;
                var genre = identifier(value.id);
                if (!genre) return;
                if (!has(genreSeen, genre)) {
                    genreSeen[genre] = true;
                    normalized.genre_ids.push(genre);
                }
                if (!has(namedSeen, genre)) {
                    namedSeen[genre] = true;
                    normalized.genres.push({ id: genre, name: text(value.name, 120) });
                }
            });
        }
        if (Array.isArray(card.recommendation_sources)) normalized.recommendation_sources = sources(card.recommendation_sources);
        return normalized;
    }

    function key(card) {
        var normalized = normalizeCard(card);
        return normalized ? normalized.media_type + ':' + normalized.id : '';
    }
    function isAnime(card) {
        var normalized = normalizeCard(card);
        return !!normalized && normalized.genre_ids.indexOf(16) !== -1 && (normalized.original_language || '').toLowerCase() === 'ja';
    }
    function clock(options) {
        return finite(options.now) && options.now >= 0 ? options.now : new Date().getTime();
    }
    function timestamp(card) {
        var fields = ['at', 'time', 'timestamp', 'added_at', 'added', 'watched_at', 'last_seen', 'updated_at', 'created_at', 'date'];
        var i;
        for (i = 0; i < fields.length; i++) {
            var value = card[fields[i]];
            var parsed = typeof value === 'string' ? Number(value) : value;
            if (!finite(parsed) && typeof value === 'string') parsed = Date.parse(value);
            if (finite(parsed) && parsed > 0) return parsed < 100000000000 ? parsed * 1000 : parsed;
        }
        return 0;
    }
    function recency(at, now, floor) {
        if (!at) return 1;
        var age = Math.max(0, now - at) / DAY;
        return floor + (1 - floor) * Math.pow(0.5, age / 90);
    }
    function orderRecency(index, floor) {
        // Favorite keeps newest entries first but strips activity timestamps.
        // Preserve that ordering as confidence without inventing a watched date.
        return floor + (1 - floor) / (1 + index / 20);
    }
    function release(card) {
        var value = card.media_type === 'tv' ? card.first_air_date : card.release_date;
        return value ? Date.parse(value + 'T00:00:00Z') : 0;
    }

    function buildProfile(favorites, feedback, options) {
        favorites = object(favorites) ? favorites : {};
        feedback = object(feedback) ? feedback : {};
        options = object(options) ? options : {};
        var now = clock(options);
        var records = {};
        var stats = { history: 0, viewed: 0, like: 0, book: 0, thrown: 0, feedback: 0, positive: 0, negative: 0 };
        var excluded = {};
        function record(card, normalized) {
            var identity = normalized.media_type + ':' + normalized.id;
            if (!has(records, identity)) records[identity] = { key: identity, card: normalized, positive: 0, negative: 0, kind: '', at: 0, historyAt: -1, historyIndex: Infinity };
            return records[identity];
        }
        CATEGORIES.forEach(function (category) {
            if (!Array.isArray(favorites[category])) return;
            var categorySeen = {};
            favorites[category].forEach(function (raw, index) {
                var card = normalizeCard(raw);
                if (!card) return;
                var current = record(raw, card);
                if (has(categorySeen, current.key)) return;
                categorySeen[current.key] = true;
                stats[category]++;
                var at = timestamp(raw);
                var floor = category === 'like' || category === 'thrown' ? 0.6 : 0.15;
                var weight = WEIGHTS[category] * (at ? recency(at, now, floor) : orderRecency(index, floor));
                if (category === 'history') {
                    current.historyAt = Math.max(current.historyAt, at);
                    current.historyIndex = Math.min(current.historyIndex, index);
                }
                if (category === 'history' || category === 'viewed' || category === 'thrown') excluded[current.key] = true;
                if (weight < 0) current.negative = Math.min(current.negative, weight);
                else if (weight > current.positive) {
                    current.positive = weight;
                    current.kind = category;
                    current.at = at;
                    current.card = card;
                }
            });
        });
        Object.keys(feedback).sort().forEach(function (identity) {
            var value = feedback[identity];
            if (!object(value) || ['like', 'hide', 'seen'].indexOf(value.action) === -1) return;
            var card = normalizeCard(value.card);
            if (!card || key(card) !== identity) return;
            var current = record(value.card, card);
            var at = timestamp({ at: value.at });
            stats.feedback++;
            current.card = card;
            current.kind = 'feedback:' + value.action;
            current.at = at;
            if (value.action === 'hide') {
                current.positive = 0;
                current.negative = -4 * recency(at, now, 0.6);
                excluded[identity] = true;
            } else if (value.action === 'like') {
                current.positive = 6 * recency(at, now, 0.6);
            } else {
                current.positive = 1.8 * recency(at, now, 0.15);
                excluded[identity] = true;
            }
        });
        var signals = [];
        var positiveGenres = {};
        var negativeGenres = {};
        var possibleSeeds = [];
        Object.keys(records).sort().forEach(function (identity) {
            var current = records[identity];
            var weight = current.negative < 0 ? current.negative : current.positive;
            if (!weight) return;
            var kind = current.negative < 0 && current.kind !== 'feedback:hide' ? 'thrown' : current.kind;
            signals.push({ key: identity, card: normalizeCard(current.card), kind: kind, weight: weight, at: current.at });
            if (weight > 0) stats.positive++;
            else stats.negative++;
            current.card.genre_ids.forEach(function (genre) {
                var target = weight > 0 ? positiveGenres : negativeGenres;
                target[genre] = (target[genre] || 0) + Math.abs(weight) / Math.sqrt(Math.max(1, current.card.genre_ids.length));
            });
            if (weight > 0 && !current.card.adult && (!release(current.card) || release(current.card) <= now)) possibleSeeds.push(current);
        });
        var genres = {};
        Object.keys(positiveGenres).concat(Object.keys(negativeGenres)).forEach(function (genre) {
            var positive = positiveGenres[genre] || 0;
            var negative = negativeGenres[genre] || 0;
            // Each genre has its own confidence denominator: many unrelated
            // positive genres cannot dilute an isolated negative preference.
            genres[genre] = (positive - negative) / (6 + positive + negative);
        });
        possibleSeeds.sort(function (a, b) { return b.positive - a.positive || b.at - a.at || compareKey(a, b); });
        var maxSeeds = Math.floor(number(options.maxSeeds, 8, 0, 8));
        var selected = possibleSeeds.slice(0, maxSeeds);
        var historySeeds = possibleSeeds.filter(function (seed) { return seed.historyAt >= 0; });
        historySeeds.sort(function (a, b) {
            if (a.historyAt > 0 && b.historyAt > 0 && a.historyAt !== b.historyAt) return b.historyAt - a.historyAt;
            return a.historyIndex - b.historyIndex || b.positive - a.positive || compareKey(a, b);
        });
        if (maxSeeds > 1 && historySeeds.length && !selected.some(function (seed) { return seed.historyAt >= 0; })) {
            selected[selected.length - 1] = historySeeds[0];
        }
        selected.sort(function (a, b) { return b.positive - a.positive || b.at - a.at || compareKey(a, b); });
        var seeds = selected.map(function (seed) {
            var card = normalizeCard(seed.card);
            card.key = seed.key;
            card.weight = seed.positive;
            return card;
        });
        return { signals: signals, seeds: seeds, genres: genres, excluded: excluded, stats: stats };
    }

    function candidateScore(card, profile, seedMap, now, options) {
        var relevance = 0;
        var topSource = null;
        var sourceValues = [];
        (card.recommendation_sources || []).forEach(function (source) {
            var seed = seedMap[source.seed_key];
            if (!seed || (source.kind !== 'recommendations' && source.kind !== 'similar')) return;
            var value = (source.kind === 'similar' ? 2.2 : 3) * Math.min(1.2, seed.weight / 5);
            sourceValues.push(value);
            if (!topSource || value > topSource.value || (value === topSource.value && source.seed_key < topSource.key)) {
                topSource = { key: source.seed_key, title: seed.title || seed.name || source.seed_title, value: value };
            }
        });
        sourceValues.sort(function (a, b) { return b - a; });
        sourceValues.forEach(function (value, index) { relevance += value * (index === 0 ? 1 : 0.35); });
        relevance = Math.min(5, relevance);
        var preference = 0;
        card.genre_ids.forEach(function (genre) { preference += number(profile.genres[genre], 0, -1, 1); });
        preference /= Math.sqrt(Math.max(1, card.genre_ids.length));
        preference = Math.max(-1.5, Math.min(1.5, preference));
        var prior = number(options.ratingPrior, 6.5, 0, 10);
        var priorVotes = number(options.ratingPriorVotes, 100, 1, 100000);
        var rating = (card.vote_average * card.vote_count + prior * priorVotes) / (card.vote_count + priorVotes);
        var released = release(card);
        var fresh = released ? Math.pow(0.5, Math.max(0, now - released) / (DAY * 730)) : 0;
        var reason;
        if (topSource) reason = 'Похоже на «' + topSource.title + '»';
        else if (!profile.stats.positive) reason = 'Популярно сейчас — начальная подборка';
        else if (preference > 0) reason = 'По вашим любимым жанрам';
        else reason = 'Высокая оценка зрителей';
        return { card: card, key: card.media_type + ':' + card.id, score: relevance + 2 * preference + rating / 5 + fresh * 0.6 + Math.min(0.2, Math.log(1 + card.popularity) / 50), seed: topSource ? topSource.key : '', reason: reason };
    }

    function rank(candidates, profile, options) {
        options = object(options) ? options : {};
        if (!Array.isArray(candidates)) return [];
        profile = object(profile) ? profile : buildProfile({}, {}, options);
        var safeProfile = {
            genres: object(profile.genres) ? profile.genres : {},
            excluded: object(profile.excluded) ? profile.excluded : {},
            stats: object(profile.stats) ? profile.stats : { positive: 0 }
        };
        var now = clock(options);
        var unique = {};
        candidates.forEach(function (value) {
            var card = normalizeCard(value);
            if (!card || card.adult || (release(card) && release(card) > now)) return;
            var identity = card.media_type + ':' + card.id;
            if (has(safeProfile.excluded, identity) && safeProfile.excluded[identity]) return;
            if (options.mediaType === 'anime') {
                if (!isAnime(card)) return;
            } else if (options.mediaType && options.mediaType !== 'all' && card.media_type !== options.mediaType) return;
            if (!has(unique, identity)) unique[identity] = card;
            else {
                var prior = unique[identity];
                var combined = sources((prior.recommendation_sources || []).concat(card.recommendation_sources || []));
                // Pick the better-supported metadata independently of input order.
                var choose = card.vote_count > prior.vote_count || (card.vote_count === prior.vote_count && JSON.stringify(card) < JSON.stringify(prior));
                if (choose) unique[identity] = card;
                unique[identity].recommendation_sources = combined;
            }
        });
        var seedMap = {};
        (Array.isArray(profile.seeds) ? profile.seeds : []).forEach(function (seed) {
            var identity = key(seed);
            if (identity) seedMap[identity] = { weight: number(seed.weight, 0, 0, 10), title: text(seed.title || seed.name, 300) };
        });
        var remaining = Object.keys(unique).map(function (identity) { return candidateScore(unique[identity], safeProfile, seedMap, now, options); });
        var genreCounts = {};
        var seedCounts = {};
        var result = [];
        var limit = Math.floor(number(options.limit, 60, 0, 500));
        var diversity = number(options.diversityFactor, 1, 0, 3);
        while (remaining.length && result.length < limit) {
            var best = -1;
            var bestScore = -Infinity;
            remaining.forEach(function (entry, index) {
                var repeated = 0;
                entry.card.genre_ids.forEach(function (genre) { repeated += genreCounts[genre] || 0; });
                repeated /= Math.max(1, entry.card.genre_ids.length);
                var adjusted = entry.score - diversity * (repeated * 0.65 + (seedCounts[entry.seed] || 0) * 0.7);
                if (adjusted > bestScore || (adjusted === bestScore && (best === -1 || compareKey(entry, remaining[best]) < 0))) {
                    best = index;
                    bestScore = adjusted;
                }
            });
            var selected = remaining.splice(best, 1)[0];
            selected.card.recommendation_reason = selected.reason;
            selected.card.recommendation_score = Math.round(bestScore * 1000000) / 1000000;
            result.push(selected.card);
            selected.card.genre_ids.forEach(function (genre) { genreCounts[genre] = (genreCounts[genre] || 0) + 1; });
            if (selected.seed) seedCounts[selected.seed] = (seedCounts[selected.seed] || 0) + 1;
        }
        return result;
    }

    return { normalizeCard: normalizeCard, key: key, isAnime:isAnime, buildProfile: buildProfile, rank: rank };
}));

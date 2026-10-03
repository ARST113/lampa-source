(function (window) {
    'use strict';

    if (window.LampacRecommendations) return;
    var Lampa;
    var Engine = window.LampacRecommendationEngine;
    var Data = window.LampacRecommendationData;
    var document = window.document;
    var COMPONENT = 'lampac_personal_feed';
    var VERSION = '1.1.0';
    var PAGE_SIZE = 60;
    var instances = [];
    var registered = false;
    var syncBound = null;
    var modes = [
        {title: 'Всё', type: 'all'},
        {title: 'Фильмы', type: 'movie'},
        {title: 'Сериалы', type: 'tv'},
        {title: 'Аниме', type: 'anime'}
    ];

    function icon(name) { return '<svg><use xlink:href="#sprite-' + name + '"></use></svg>'; }
    function notify(text) { if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(text); }
    function open() {
        if (!registered) return false;
        Lampa.Activity.push({component: COMPONENT, title: 'Для вас', page: 1, url: ''});
        return true;
    }
    function openCard(card) {
        var normalized = Engine.normalizeCard(card);
        if (!normalized) return false;
        if (card.recommendation_owner && card.recommendation_owner !== Data.owner(Lampa)) return false;
        Lampa.Activity.push({component: 'full', source: 'tmdb', method: normalized.media_type,
            id: normalized.id, card: normalized, url: '', title: normalized.title || normalized.name});
        return true;
    }
    function addMenu() {
        if (document.getElementById('lampac-personal-feed-menu')) return;
        if (!Lampa.Menu || !Lampa.Menu.addButton) return;
        Lampa.Menu.addButton(icon('feed'), 'Для вас', open)
            .attr('id', 'lampac-personal-feed-menu').attr('data-action', COMPONENT);
    }

    function Feed(object) {
        object = object || {};
        object.page = Math.max(1, parseInt(object.page, 10) || 1);
        object.params = object.params || {};
        object.params.empty = {
            title: 'Пока нет новых рекомендаций',
            descr: 'Выберите другой фильтр или уберите скрытие в «Мои оценки».'
        };
        var self = Lampa.Maker.make('Category', object, function (mask) {
            return mask.toggle(mask.MASK.base, 'Pagination');
        });
        var data = Data.create(Lampa, Engine);
        var owner = Data.owner(Lampa);
        var type = object.recommendation_type || 'all';
        var force = !!object.recommendation_force;
        delete object.recommendation_force;
        var snapshot = null;
        var cards = [];
        var active = false;
        var dead = false;
        var busy = false;
        var dirty = false;
        var built = false;
        var refreshing = false;
        var generation = 0;
        var timer;
        var reloadTimer;
        var historyTimer;
        var headIcon;

        function loader(value) { if (self.activity) self.activity.loader(value); }
        function removeHead() {
            if (headIcon) headIcon.remove();
            headIcon = null;
        }
        function showHead() {
            if (!headIcon && Lampa.Head && Lampa.Head.addIcon) {
                headIcon = Lampa.Head.addIcon(icon('filter'), filters);
                headIcon.attr('title', 'Для вас: фильтры и оценки');
            }
        }
        function back() { if (!dead && !refreshing) self.start(); }
        function select(title, items, callback) {
            Lampa.Select.show({title: title, items: items, onSelect: callback, onBack: back});
        }
        function requestRefresh(refreshPool, resetPage) {
            if (dead || refreshing) return;
            refreshing = true;
            generation++;
            busy = false;
            dirty = false;
            window.clearTimeout(reloadTimer);
            window.clearTimeout(historyTimer);
            reloadTimer = null;
            historyTimer = null;
            data.invalidate();
            if (resetPage !== false) object.page = 1;
            object.recommendation_type = type;
            if (refreshPool) object.recommendation_force = true;
            self.activity.refresh();
        }
        function summary() {
            var stats = snapshot && (snapshot.profile && snapshot.profile.stats || snapshot.stats) || {};
            var text = 'История: ' + Number(stats.history || 0) + ' · Нравится: ' + Number(stats.like || 0) +
                ' · Рекомендаций: ' + cards.length;
            if (stats.unsupported) text += ' · Ещё не сопоставлено с TMDB: ' + Number(stats.unsupported);
            if (snapshot && snapshot.stale) text += ' · Сохранённая подборка: сеть недоступна';
            else if (snapshot && snapshot.failures) text += ' · Часть источников временно недоступна';
            notify(text);
        }
        function filters() {
            if (self.ownerChanged() || dead || refreshing) return;
            var items = modes.map(function (mode) {
                return {title: mode.title, type: mode.type, selected: mode.type === type};
            });
            items.push({title: 'Обновить рекомендации', action: 'refresh'});
            items.push({title: 'Мои оценки', action: 'reviews'});
            items.push({title: 'О подборке', action: 'summary'});
            select('Для вас', items, function (item) {
                if (self.ownerChanged() || dead) return;
                if (item.type) {
                    if (type !== item.type) { type = item.type; requestRefresh(false); }
                    else back();
                } else if (item.action === 'refresh') requestRefresh(true);
                else if (item.action === 'reviews') reviews();
                else { summary(); back(); }
            });
        }
        function applyFeedback(card, action) {
            if (self.ownerChanged() || dead || refreshing) return;
            var saved = action === 'remove' ? data.removeFeedback(card) : data.setFeedback(card, action);
            if (saved === false) { notify('Не удалось сохранить оценку. Попробуйте ещё раз.'); back(); return; }
            requestRefresh(false);
        }
        function reviews() {
            var records = data.feedback();
            var items = [];
            Object.keys(records).forEach(function (key) {
                var record = records[key];
                if (!record || !record.card) return;
                items.push({title: (record.card.title || record.card.name) + ' · ' +
                    ({like: 'Нравится', hide: 'Не интересно', seen: 'Просмотрено'}[record.action] || ''), record: record});
            });
            if (!items.length) { notify('Здесь появятся ваши оценки и скрытые фильмы'); back(); return; }
            select('Мои оценки · выберите, чтобы убрать', items, function (item) {
                applyFeedback(item.record.card, 'remove');
            });
        }
        function page() {
            var number = Math.min(object.page, Math.max(1, Math.ceil(cards.length / PAGE_SIZE)));
            object.page = number;
            return {results: cards.slice((number - 1) * PAGE_SIZE, number * PAGE_SIZE), page: number,
                total_pages: Math.max(1, Math.ceil(cards.length / PAGE_SIZE)), total_results: cards.length};
        }
        function activate() {
            if (dead) return;
            active = true;
            showHead();
            if (self.ownerChanged() || refreshing) return;
            if (dirty && !busy && !reloadTimer) requestRefresh(false);
            else if (!built && !busy && !reloadTimer) self.load(false);
        }
        self.load = function (refreshPool) {
            if (dead || busy || refreshing) return;
            if (built) { requestRefresh(!!refreshPool); return; }
            if (self.ownerChanged()) return;
            window.clearTimeout(reloadTimer);
            reloadTimer = null;
            var turn = ++generation;
            busy = true;
            loader(true);
            data.load(function (value) {
                if (dead || turn !== generation) return;
                busy = false;
                if (Data.owner(Lampa) !== owner || value.owner !== owner) { self.ownerChanged(); return; }
                snapshot = value;
                cards = snapshot.cards.filter(function (card) {
                    return type === 'all' || (type === 'anime' ? Engine.isAnime(card) : card.media_type === type);
                });
                built = true;
                self.build(page());
            }, function (error) {
                if (dead || turn !== generation) return;
                busy = false;
                if (error && (error.code === 'OWNER_CHANGED' || error.code === 'SYNC_PENDING')) {
                    loader(true);
                    reloadTimer = window.setTimeout(function () {
                        reloadTimer = null;
                        if (!dead && active) self.load(false);
                        else dirty = true;
                    }, 1000);
                } else {
                    built = true;
                    self.params.empty = {title: 'Не удалось получить рекомендации',
                        descr: 'Проверьте доступность TMDB в Lampa и обновите ленту. Ваши оценки сохранены.'};
                    self.empty();
                }
            }, !!refreshPool);
        };
        self.ownerChanged = function () {
            if (dead) return false;
            var current = Data.owner(Lampa);
            if (current === owner) return false;
            owner = current;
            snapshot = null;
            cards = [];
            // Hide the previous profile immediately; Activity creates a fresh
            // native Category on refresh, including its cards and controller.
            self.render().hide();
            requestRefresh(false);
            return true;
        };
        self.historyChanged = function () {
            if (dead || refreshing) return;
            dirty = true;
            window.clearTimeout(historyTimer);
            historyTimer = null;
            if (!active) return;
            historyTimer = window.setTimeout(function () {
                historyTimer = null;
                if (!dead && active && !busy && !reloadTimer) requestRefresh(false);
            }, 300);
        };
        self.refresh = function () { requestRefresh(false); };
        self.stop = function () { self.pause(); };
        self.use({
            onCreate: function () {
                instances.push(self);
                if (window.setInterval) timer = window.setInterval(function () {
                    if (!dead && active) { bindSync(); self.ownerChanged(); }
                }, 1000);
                self.load(force);
            },
            onStart: activate,
            onPause: function () { active = false; removeHead(); },
            onEmpty: function () {
                // Native Empty has its own start method. Keep profile checks
                // and the same head menu available when returning to it.
                if (self.empty_class && self.empty_class.use) self.empty_class.use({onStart: activate});
            },
            onNext: function (resolve, reject) {
                if (self.ownerChanged() || refreshing || dead) { reject(); return; }
                resolve(page());
            },
            onInstance: function (item, card) {
                item.use({
                    onEnter: function () { openCard(card); },
                    onFocus: function () { Lampa.Background.change(Lampa.Utils.cardImgBackground(card)); },
                    onMenu: function (menu) {
                        if (Data.owner(Lampa) !== owner || dead || refreshing) return;
                        menu.push({title: 'Почему рекомендовано', action: 'why', onSelect: function () {
                            if (!self.ownerChanged()) notify(card.recommendation_reason || 'Начальная подборка по рейтингу и популярности');
                        }});
                        [['like', 'Нравится'], ['hide', 'Не интересно'], ['seen', 'Уже просмотрено'],
                            ['remove', 'Убрать мою оценку']].forEach(function (entry) {
                            menu.push({title: entry[1], action: entry[0], onSelect: function () { applyFeedback(card, entry[0]); }});
                        });
                    }
                });
            },
            onDestroy: function () {
                dead = true;
                active = false;
                generation++;
                removeHead();
                window.clearTimeout(reloadTimer);
                window.clearTimeout(historyTimer);
                if (timer && window.clearInterval) window.clearInterval(timer);
                if (self.empty_class) self.empty_class.destroy();
                data.dispose();
                var index = instances.indexOf(self);
                if (index >= 0) instances.splice(index, 1);
            }
        });
        return self;
    }

    function changed() {
        instances.slice().forEach(function (instance) {
            if (!instance.ownerChanged()) instance.historyChanged();
        });
    }
    function bindSync() {
        var sync = window.LampacSync;
        if (sync && sync !== syncBound && typeof sync.onChange === 'function') {
            syncBound = sync;
            sync.onChange(changed);
        }
    }
    function install() {
        if (registered || !window.Lampa || !Engine || !Data) return;
        Lampa = window.Lampa;
        if (!Lampa.Component || !Lampa.Component.add || !Lampa.Maker || !Lampa.Maker.make) return;
        registered = true;
        Lampa.Component.add(COMPONENT, Feed);
        addMenu(); bindSync();
        if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('lampac', function (event) {
                if (event && (event.name === 'storage_importСompleted' || event.name === 'storage_importCompleted')) changed();
            });
            Lampa.Listener.follow('state:changed', function (event) { if (event && event.target === 'favorite') changed(); });
        }
        if (Lampa.Storage && Lampa.Storage.listener && Lampa.Storage.listener.follow) {
            Lampa.Storage.listener.follow('change', function (event) {
                var name = event && (event.name || event.key);
                if (name && /^(lampac_profile_id|lampac_unic_id|lampac_sync_owner_v1|account_email|account|profile|favorite)$/.test(name)) changed();
            });
        }
        if (Lampa.Account && Lampa.Account.listener && Lampa.Account.listener.follow) Lampa.Account.listener.follow('profile_select', changed);
        if (window.MutationObserver) {
            var menu = document.querySelector('.menu');
            if (menu) new window.MutationObserver(addMenu).observe(menu, {childList: true, subtree: true});
        }
    }

    window.LampacRecommendations = {version: VERSION, open: open, openCard: openCard};
    if (window.appready) install();
    else if (window.Lampa && window.Lampa.Listener) window.Lampa.Listener.follow('app', function (event) { if (event && event.type === 'ready') install(); });
}(window));

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// The plugin only needs tree construction and hover events from the DOM. Keep
// ranking, Favorite imports, owner isolation and cache handling in the real code.
function node(tag) {
  const element = {
    tagName: tag, className: '', children: [], attributes: {}, events: {}, style: {}, parentNode: null, value: '',
    get firstChild() { return this.children[0] || null; },
    get textContent() { return this.value + this.children.map(child => child.textContent).join(''); },
    set textContent(value) { this.value = String(value); this.children.forEach(child => {child.parentNode = null;}); this.children = []; },
    appendChild(child) { if (child.parentNode) child.parentNode.removeChild(child); this.children.push(child); child.parentNode = this; return child; },
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; return child; },
    contains(child) { return this === child || this.children.some(entry => entry.contains(child)); },
    append(child) { return this.appendChild(child[0] || child); },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); },
    querySelectorAll(selector) { return descendants(this, child => selector.startsWith('.') ?
      selector.slice(1).split('.').every(name => child.classList.contains(name)) : child.tagName === selector); },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'id') this.id = String(value); },
    addEventListener(event, handler) { (this.events[event] || (this.events[event] = [])).push(handler); },
    dispatch(event) { (this.events[event] || []).forEach(handler => handler({target: this, stopPropagation() {}})); }
  };
  element.classList = {contains: name => element.className.split(' ').includes(name),
    add(...names) { element.className = Array.from(new Set(element.className.split(' ').filter(Boolean).concat(names))).join(' '); },
    remove(...names) { element.className = element.className.split(' ').filter(name => !names.includes(name)).join(' '); }};
  return element;
}
function descendants(root, predicate) {
  return root.children.flatMap(child => (predicate(child) ? [child] : []).concat(descendants(child, predicate)));
}
function clock() {
  let next = 1, now = 0;
  const jobs = new Map();
  return {
    setTimeout(fn, delay) { const id = next++; jobs.set(id, {fn, at: now + delay}); return id; },
    clearTimeout(id) { jobs.delete(id); },
    advance(ms) {
      const end = now + ms;
      let count = 0;
      while (true) {
        const pending = Array.from(jobs).filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!pending) break;
        assert.ok(++count < 100, 'timers must settle instead of repeatedly reloading');
        const [id, job] = pending; jobs.delete(id); now = job.at; job.fn();
      }
      now = end;
    }
  };
}
const movie = id => ({id, source: 'tmdb', media_type: 'movie', title: 'Movie ' + id,
  release_date: '2020-01-01', genre_ids: [18], vote_average: 7, vote_count: 100, popularity: 50});

function fixture(options = {}) {
  const time = clock(), components = {}, listeners = {}, values = {lampac_profile_id: 'alice'};
  const favorites = {alice: {}, bob: {}}, menu = node('ul'), head = node('head');
  const on = (type, callback) => (listeners[type] || (listeners[type] = [])).push(callback);
  const emit = (type, event) => (listeners[type] || []).slice().forEach(callback => callback(event));
  const document = {
    head, createElement: node, querySelector: selector => selector === '.menu .menu__list' ? menu : null,
    getElementById: id => descendants({children: [head, menu]}, entry => entry.id === id)[0] || null
  };
  const $ = entry => ({0: entry, length: 1,
    on(events, callback) {events.split(' ').forEach(event => entry.addEventListener(event, callback)); return this;},
    off() {return this;}, append(child) {entry.append(child); return this;},
    empty() {entry.textContent = ''; return this;}, remove() {entry.remove(); return this;},
    addClass(names) {entry.classList.add(...names.split(' ')); return this;},
    removeClass(names) {entry.classList.remove(...names.split(' ')); return this;},
    text(value) {if (value === undefined) return entry.textContent; entry.textContent = value; return this;},
    attr(name, value) {entry.setAttribute(name, value); return this;},
    hide() {entry.style.display = 'none'; return this;}, show() {entry.style.display = ''; return this;},
    find(selector) {return $(entry.querySelector(selector));}
  });
  const notices = [], pushes = [], controllers = {}, nativeClasses = [], headerIcons = [];
  let selection, selectionVisible = false, toggles = 0, requests = 0, activeController, focused;
  const focus = target => {focused = target; if (target) target.dispatch('hover:focus');};
  const Lampa = {
    Component: {add(name, constructor) {components[name] = constructor;}},
    Menu: {addButton(svg, title, callback) {const item = node('li'); item.className = 'menu__item selector';
      item.textContent = title; item.addEventListener('hover:enter', callback); menu.append(item); return $(item);}},
    Storage: {get: (key, fallback) => key in values ? values[key] : fallback,
      set(key, value) {values[key] = value; emit('storage', {name: key});}, listener: {follow: (type, callback) => on('storage', callback)}},
    Favorite: {get: params => favorites[values.lampac_profile_id][params.type] || []},
    Listener: {follow: on}, Noty: {show: text => notices.push(text)},
    Scroll: function () {
      const root = node('div');
      this.append = child => root.appendChild(child); this.render = js => js ? root : $(root);
      this.update = this.destroy = this.minus = () => {};
    },
    // Deployed public API exports Controller, not its internal Navigator.
    // move dispatches to the active controller; it is not a focus primitive.
    Controller: {add(name, controller) {controllers[name] = controller;},
      toggle(name) {activeController = controllers[name]; if (activeController) activeController.toggle();},
      move(direction) {if (activeController && activeController[direction]) activeController[direction]();},
      enter() {if (activeController && activeController.enter) activeController.enter(); else if (focused) focused.dispatch('hover:enter');},
      collectionSet() {}, collectionFocus(target, root) {
        focus(target || descendants(root[0] || root, entry => entry.classList.contains('selector'))[0]);
      },
      enabled: () => ({name: 'content', controller: activeController}), own: link => activeController && activeController.link === link},
    Activity: {push: params => pushes.push(params), backward() {},
      own: component => component === feed && component.activity.is_started},
    Head: {addIcon(svg, callback) {const icon = node('div'); icon.className = 'head__action selector';
      icon.addEventListener('hover:enter', callback); headerIcons.push(icon); return $(icon);}, addElement() {}},
    Template: {string: name => '<svg data-icon="' + name + '"></svg>'},
    // Characterized against deployed Lampa: hide preserves active params;
    // close invokes onBack even when already hidden, selection only hides.
    Select: {show(params) {selection = params; selectionVisible = true;}, hide() {selectionVisible = false;},
      close() {this.hide(); if (selection && selection.onBack) selection.onBack();}},
    Background: {change() {}}, Utils: {cardImgBackground: card => card.backdrop_path},
    Arrays: {destroy: items => items.forEach(item => item.destroy())},
    Api: {sources: {tmdb: {get(method, params, done) {
      requests++;
      const owner = values.lampac_profile_id;
      const type = /(^|\/)tv(\/|$)/.test(method) ? 'tv' : 'movie';
      const cards = (owner === 'bob' ? [movie(99), movie(111)] : options.candidates || [movie(77), movie(88)])
        .filter(card => card.media_type === type);
      time.setTimeout(() => done({results: cards}), options.requestDelay || 1);
    }}}}
  };
  // A small characterized Maker/Category/Card boundary. The actual engine,
  // adapter and plugin run unchanged; native DOM and internal grid navigation
  // belong to Lampa. There is intentionally no public Navigator object.
  function useEvents(target) {
    const modules = [];
    target.use = module => {modules.push(module); return target;};
    target.emit = (event, ...args) => modules.slice().forEach(module => {
      const callback = module['on' + event[0].toUpperCase() + event.slice(1)];
      if (callback) callback.apply(target, args);
    });
    return target;
  }
  function nativeCard(data) {
    const item = useEvents({data}), html = node('div');
    html.className = 'card card--category selector'; html.card_data = data; html.textContent = data.title || data.name;
    item.html = html;
    item.create = () => {
      html.addEventListener('hover:enter', () => item.emit('enter', html, data));
      html.addEventListener('hover:focus', () => item.emit('focus', html, data));
      html.addEventListener('hover:long', () => {
        const menuItems = [{title: 'В закладки', where: 'book', checkbox: true},
          {title: 'Нравится', where: 'like', checkbox: true}];
        item.emit('menu', menuItems, html, data);
        Lampa.Select.show({title: 'Действие', items: menuItems,
          onBack: () => Lampa.Controller.toggle('content'),
          onBeforeClose: () => {Lampa.Controller.toggle('content'); return true;}});
      });
      item.emit('create');
    };
    item.render = js => js ? html : $(html);
    item.destroy = () => {html.remove(); item.emit('destroy');};
    return item;
  }
  function nativeCategory(object) {
    object.params = object.params || {};
    const html = node('div'), body = node('div'), scroll = new Lampa.Scroll();
    const component = useEvents({object, params: object.params, html, body, scroll,
      items: [], pages: {}, loaded: [], active: 0, added: 0, total_pages: 1, last: null});
    body.className = 'mapping--grid cols--6';
    component.create = () => {scroll.append(body); html.append(scroll.render(true)); component.emit('create');};
    function appendCards(data) {
      data.results.forEach(card => {
        const item = nativeCard(card);
        component.emit('instance', item, card); item.create();
        item.html.addEventListener('hover:focus', () => {component.last = item.html; component.active = component.items.indexOf(item);});
        component.items.push(item); body.append(item.html);
      });
    }
    component.appendNext = appendCards;
    component.build = data => {
      if (!data.results.length) return component.empty();
      component.total_pages = data.total_pages || 1;
      appendCards(data);
      component.emit('build', data); component.activity.loader(false); component.activity.toggle();
    };
    component.empty = () => {
      component.empty_class = nativeEmpty(component.params.empty || {});
      scroll.append(component.empty_class.render(true));
      // Category's Simple.onEmpty really overwrites start. A plugin that only
      // hooks Category.onStart would silently miss every resume in this state.
      component.start = component.empty_class.start.bind(component.empty_class);
      component.emit('empty'); component.activity.loader(false); component.activity.toggle();
    };
    component.start = () => {
      component.emit('start');
      if (component.empty_class) {component.empty_class.start(); return;}
      const move = direction => {
        const cards = component.items.map(item => item.render(true));
        const delta = {left: -1, right: 1, up: -6, down: 6}[direction];
        const index = cards.indexOf(focused), next = cards[index + delta];
        if (next) focus(next);
        else if (direction === 'right') component.emit('right');
        else if (direction === 'left') Lampa.Controller.toggle('menu');
        else if (direction === 'up') Lampa.Controller.toggle('head');
      };
      const controller = {link: component, toggle() {Lampa.Controller.collectionFocus(component.last || false, $(body));},
        left: () => move('left'), right: () => move('right'), up: () => move('up'), down: () => move('down'), back: () => Lampa.Activity.backward()};
      component.emit('controller', controller); Lampa.Controller.add('content', controller); Lampa.Controller.toggle('content');
    };
    component.pause = () => component.emit('pause');
    component.render = js => js ? html : $(html);
    component.destroy = () => {Lampa.Arrays.destroy(component.items); if (component.empty_class) component.empty_class.destroy();
      html.remove(); body.remove(); component.emit('destroy');};
    return component;
  }
  function nativeEmpty(params) {
    const empty = useEvents({params}), html = node('div');
    html.className = 'empty'; html.textContent = (params.title || '') + (params.descr || params.text || '');
    const image = node('div'); image.className = 'empty__img selector'; html.append(image);
    (params.buttons || []).forEach(button => {const entry = node('div'); entry.className = 'simple-button selector';
      entry.textContent = button.title; entry.addEventListener('hover:enter', button.onEnter); html.append(entry);});
    empty.render = js => js ? html : $(html);
    empty.start = () => {empty.emit('start'); const controller = {toggle: () => Lampa.Controller.collectionFocus(false, $(html)),
      left() {}, right() {}, up() {}, down() {}, back: () => Lampa.Activity.backward()};
      empty.emit('controller', controller); Lampa.Controller.add('content', controller); Lampa.Controller.toggle('content');};
    empty.destroy = () => {html.remove(); empty.emit('destroy');};
    return empty;
  }
  Lampa.Maker = {make(name, object, modifier) {
    nativeClasses.push(name);
    if (modifier) modifier({MASK: {base: 1}, toggle: mask => mask, except: () => 1});
    if (name === 'Category') return nativeCategory(object);
    if (name === 'Empty') return nativeEmpty(object);
    throw new Error('Unexpected native Maker class: ' + name);
  }};
  Lampa.Empty = nativeEmpty;
  if (options.sync) Lampa.LampacSync = options.sync;
  const window = {document, $, Lampa, appready: true, setTimeout: time.setTimeout, clearTimeout: time.clearTimeout,
    setInterval: () => 1, clearInterval() {}};
  const context = vm.createContext({window, console});
  for (const file of ['engine.js', 'data.js', 'plugin.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), context);
  }
  let feed, replacements = 0;
  function mount(object) {
    const instance = new components.lampac_personal_feed(object);
    const activity = instance.activity = {is_started: false, waite_refresh: false, loader() {}, canRefresh: () => false,
      start() {this.is_started = true; if (this.waite_refresh) this.runRefresh(); else instance.start();},
      pause() {this.is_started = false; instance.pause();},
      toggle() {if (!this.is_started) return;
        assert.ok(++toggles < 40, 'load completion must not recursively restart loading'); this.start();},
      refresh() {if (this.waite_refresh) return; this.waite_refresh = true; if (Lampa.Activity.own(instance)) this.runRefresh();},
      runRefresh() {time.clearTimeout(this.timer_refresh); this.timer_refresh = time.setTimeout(() => {
        assert.ok(++replacements < 20, 'native refresh replacements must settle');
        if (instance.beforeRefresh) instance.beforeRefresh(); instance.destroy(); mount(object);
      }, 400);},
      destroy() {this.is_started = false; time.clearTimeout(this.timer_refresh); instance.destroy();}
    };
    feed = instance; instance.create(); activity.start();
  }
  mount({component: 'lampac_personal_feed', source: 'tmdb', url: '', page: 1,
    recommendation_type: options.type || 'all'});
  const rendered = () => {
    const root = feed.render(true);
    if (root.classList.contains('hide') || root.style.display === 'none' || root.style.visibility === 'hidden') return [];
    return descendants(root, entry => entry.classList.contains('card') && entry.card_data);
  };
  return {get feed() {return feed;}, favorites, Lampa, values, time, emit, notices,
    keys: () => rendered().map(card => card.card_data.media_type + ':' + card.card_data.id).sort(),
    text: () => feed.render(true).textContent,
    feedback(id) {(id ? rendered().find(card => card.card_data.id === id) : rendered()[0]).dispatch('hover:long');},
    select(action) {const titles = {why: 'Почему рекомендовано', seen: 'Уже просмотрено', hide: 'Не интересно', like: 'Нравится'};
      const item = selection.items.find(entry => entry.action === action || entry.title === titles[action] && !entry.checkbox);
      assert.ok(item, 'expected recommendation menu action ' + action);
      if (selection.onBeforeClose && !selection.onBeforeClose()) return;
      if (!selection.nohide) Lampa.Select.hide();
      if (item.onSelect) item.onSelect(item); else if (selection.onSelect) selection.onSelect(item);},
    selectionVisible: () => selectionVisible,
    requests: () => requests,
    focused: () => focused, pushes, head, nativeClasses,
    pause: () => feed.activity.pause(), resume: () => feed.activity.start(), destroy: () => feed.activity.destroy(),
    replacements: () => replacements,
    options() {headerIcons[headerIcons.length - 1].dispatch('hover:enter');},
    selectTitle(title) {const item = selection.items.find(entry => entry.title === title);
      assert.ok(item, 'expected menu choice ' + title);
      if (selection.onBeforeClose && !selection.onBeforeClose()) return;
      if (!selection.nohide) Lampa.Select.hide();
      if (item.onSelect) item.onSelect(item); else if (selection.onSelect) selection.onSelect(item);},
    menuItems: () => selection.items,
    next() {feed.object.page++; feed.emit('next', data => feed.appendNext(data), () => assert.fail('native next page rejected'));},
    move: direction => Lampa.Controller.move(direction)
  };
}

test('native Category Down and Right move focus and Enter opens that card without Navigator exports', t => {
  const f = fixture({candidates: Array.from({length: 12}, (_, index) => movie(77 + index))});
  t.after(() => f.destroy()); f.time.advance(10);
  assert.equal(f.keys().length, 12);
  assert.equal(f.Lampa.Navigator, undefined, 'the public API must mirror deployed Lampa exports');
  const first = f.focused();
  assert.doesNotThrow(() => f.move('down'));
  assert.notEqual(f.focused(), first, 'Down should enter the second native grid row');
  const below = f.focused(); f.move('right');
  assert.notEqual(f.focused(), below, 'Right should select the next native card');
  const selected = f.focused().card_data;
  f.Lampa.Controller.enter();
  assert.equal(f.pushes[0].component, 'full');
  assert.equal(f.pushes[0].id, selected.id);
  assert.equal(f.pushes[0].source, 'tmdb');
  assert.equal(f.head.children.length, 0, 'native rendering should not inject a custom stylesheet');
  assert.equal(f.nativeClasses[0], 'Category');
});

test('feedback Back restores a rendered feed under Lampa close/onBack semantics', t => {
  const f = fixture(); t.after(() => f.feed.destroy()); f.time.advance(10);
  f.feedback();
  assert.equal(f.selectionVisible(), true);
  assert.doesNotThrow(() => f.Lampa.Select.close());
  assert.equal(f.selectionVisible(), false);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
});

test('native card context keeps Favorite actions alongside recommendation actions', t => {
  const f = fixture(); t.after(() => f.destroy()); f.time.advance(10); f.feedback();
  assert.ok(f.menuItems().find(item => item.where === 'book' && item.checkbox));
  assert.ok(f.menuItems().find(item => item.where === 'like' && item.checkbox));
  f.select('hide'); f.time.advance(1000);
  assert.deepEqual(f.keys(), ['movie:88']);
});

test('native head filter changes the activity mode and renders only TV cards', t => {
  const tv = {id: 77, source: 'tmdb', media_type: 'tv', name: 'Series 77', first_air_date: '2020-01-01',
    genre_ids: [18], vote_average: 7, vote_count: 100, popularity: 50};
  const f = fixture({candidates: [movie(77), tv]}); t.after(() => f.destroy()); f.time.advance(10);
  assert.deepEqual(f.keys(), ['movie:77', 'tv:77']);
  f.options(); f.selectTitle('Сериалы'); f.time.advance(1000);
  assert.equal(f.feed.object.recommendation_type, 'tv');
  assert.equal(f.feed.object.page, 1);
  assert.deepEqual(f.keys(), ['tv:77']);
  f.Lampa.Controller.enter();
  assert.equal(f.pushes[0].method, 'tv');
});

test('native next page appends the remaining snapshot cards without duplicates or new TMDB requests', t => {
  const f = fixture({candidates: Array.from({length: 65}, (_, index) => movie(77 + index))});
  t.after(() => f.destroy()); f.time.advance(10);
  assert.equal(f.keys().length, 60);
  assert.equal(f.feed.total_pages, 2);
  const requests = f.requests(); f.next();
  assert.equal(f.keys().length, 65);
  assert.equal(new Set(f.keys()).size, 65);
  assert.equal(f.requests(), requests);
});

test('selecting viewed feedback hides the menu and removes the rendered card', t => {
  const f = fixture(); t.after(() => f.feed.destroy()); f.time.advance(10);
  f.feedback();
  assert.doesNotThrow(() => f.select('seen'));
  f.time.advance(1000);
  assert.equal(f.selectionVisible(), false);
  assert.deepEqual(f.keys(), ['movie:88']);
  const feedback = Object.entries(f.values).find(([key]) => key.startsWith('lampac_recommendation_feedback_'))[1];
  assert.equal(feedback['movie:77'].action, 'seen');
});

test('resuming after a paused profile switch renders only the new owner cards', t => {
  const f = fixture(); t.after(() => f.feed.destroy()); f.time.advance(10);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
  f.pause(); f.Lampa.Storage.set('lampac_profile_id', 'bob');
  assert.deepEqual(f.keys(), []);
  f.resume(); f.time.advance(1000);
  assert.deepEqual(f.keys(), ['movie:111', 'movie:99']);
  assert.doesNotMatch(f.text(), /Переключаем профиль/);
});

test('Favorite viewed changes made while paused exclude the card when resuming', t => {
  const f = fixture(); t.after(() => f.feed.destroy()); f.time.advance(10);
  f.pause(); f.favorites.alice.viewed = [movie(77)]; f.emit('state:changed', {target: 'favorite'});
  f.resume(); f.time.advance(1000);
  assert.deepEqual(f.keys(), ['movie:88']);
});

test('Favorite likes made while paused update explanations on native cards after return', t => {
  const f = fixture(); t.after(() => f.feed.destroy()); f.time.advance(10);
  f.pause(); f.favorites.alice.like = [movie(77)]; f.emit('state:changed', {target: 'favorite'});
  f.resume(); f.time.advance(1000);
  f.feedback(88); f.select('why');
  assert.match(f.notices.join(' '), /Movie 77/);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
});

test('repeated starts during a request preserve the pending feed load', t => {
  const f = fixture({requestDelay: 100}); t.after(() => f.feed.destroy());
  f.feed.start(); f.feed.start(); f.time.advance(400);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
  assert.equal(f.requests(), 4);
});

test('paused Favorite changes render through a synchronous cache hit without restarting', t => {
  const f = fixture(); t.after(() => f.feed.destroy()); f.time.advance(10);
  f.pause();
  f.favorites.alice.history = [{id: 'catalogue-1', source: 'custom', title: 'Unmapped history'}];
  f.emit('state:changed', {target: 'favorite'});
  assert.doesNotThrow(() => f.resume()); f.time.advance(1000);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
  assert.equal(f.requests(), 4);
});

test('Favorite changes during loading wait for completion before refreshing the rendered feed', t => {
  const f = fixture({requestDelay: 1000}); t.after(() => f.feed.destroy());
  f.favorites.alice.viewed = [movie(77)]; f.emit('state:changed', {target: 'favorite'});
  f.time.advance(500);
  assert.equal(f.requests(), 2, 'the debounced change must not cancel the pending requests');
  f.time.advance(7500);
  assert.deepEqual(f.keys(), ['movie:88']);
});

test('pending synchronization waits for its retry and renders after becoming ready', t => {
  let ready = false;
  const f = fixture({sync: {ready: () => ready, uid: () => 'user', profile: () => 'alice', epoch: () => 1}});
  t.after(() => f.feed.destroy());
  f.feed.start(); f.feed.start(); f.time.advance(900);
  assert.deepEqual(f.keys(), []);
  assert.equal(f.requests(), 0);
  ready = true; f.time.advance(700);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
  assert.ok(f.focused().card_data, 'ready history should restore native card focus after an empty state');
});

test('synchronization retry remains deferred while paused and resumes with fresh cards', t => {
  let ready = false;
  const f = fixture({sync: {ready: () => ready, uid: () => 'user', profile: () => 'alice', epoch: () => 1}});
  t.after(() => f.feed.destroy());
  f.pause(); ready = true; f.time.advance(1100);
  assert.deepEqual(f.keys(), []);
  assert.equal(f.requests(), 0);
  f.resume(); f.time.advance(1000);
  assert.deepEqual(f.keys(), ['movie:77', 'movie:88']);
});

test('native Empty resumes same-owner Favorite changes through its own activation hook', t => {
  const candidates = [];
  const f = fixture({candidates}); t.after(() => f.destroy()); f.time.advance(10);
  assert.deepEqual(f.keys(), []);
  assert.match(f.text(), /Пока нет новых рекомендаций/);
  f.pause(); candidates.push(movie(77));
  f.favorites.alice.like = [movie(1)]; f.emit('state:changed', {target: 'favorite'});
  f.resume(); f.time.advance(1000);
  assert.deepEqual(f.keys(), ['movie:77']);
  assert.equal(f.focused().card_data.id, 77);
  f.Lampa.Controller.enter();
  assert.equal(f.pushes[0].component, 'full');
  assert.equal(f.pushes[0].id, 77);
});

test('destroyed paused feeds cannot resume or render queued Favorite changes', () => {
  const f = fixture(); f.time.advance(10); f.pause();
  const requests = f.requests();
  f.favorites.alice.viewed = [movie(77)]; f.emit('state:changed', {target: 'favorite'});
  f.destroy(); f.feed.start(); f.time.advance(1000);
  assert.deepEqual(f.keys(), []);
  assert.equal(f.requests(), requests);
});

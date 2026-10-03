'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(ready = true) {
  const pushes = [], components = {}, events = {};
  const nodes = {};
  const list = { appendChild(node) { nodes[node.id] = node; } };
  const doc = {
    createElement(tag) {
      return { tagName: tag, children: [], style: {}, classList: {add() {}, remove() {}},
        appendChild(node) { this.children.push(node); },
        setAttribute() {}, addEventListener() {}, querySelectorAll() { return []; } };
    },
    querySelector(selector) { return selector.indexOf('.menu') === 0 ? list : null; },
    getElementById(id) { return nodes[id] || null; },
    head: { appendChild(node) { nodes[node.id] = node; } }
  };
  const jquery = () => ({on() { return this; },off() { return this; }});
  const window = {
    appready: ready,
    document: doc,
    $: jquery,
    Lampa: {
      Component: {add(name,ctor) {components[name] = ctor;}},
      Maker: {make() {throw new Error('registration must not construct a native activity');}},
      Menu: {addButton(icon, title, callback) {
        const entry = doc.createElement('li'); entry.className = 'menu__item selector'; entry.textContent = title;
        list.appendChild(entry);
        return {attr(name, value) {entry[name] = value; if (name === 'id') nodes[value] = entry; return this;}};
      }},
      Activity: {push(params) {pushes.push(params);}},
      Listener: {follow(type,cb) {events[type] = cb;}},
      Storage: {listener: {follow() {}}}
    },
    LampacRecommendationEngine: require('../src/engine.js'),
    LampacRecommendationData: require('../src/data.js'),
    setTimeout() {return 1;},clearTimeout() {}
  };
  const sandbox = {window,document:doc,console,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout};
  const source = fs.readFileSync(path.join(__dirname,'../src/plugin.js'),'utf8');
  const context = vm.createContext(sandbox);
  return {window,pushes,components,events,nodes,run() {vm.runInContext(source,context);}};
}

test('registers once when loaded twice and exposes a usable feed opener', () => {
  const f = fixture(); f.run(); f.run();
  assert.deepEqual(Object.keys(f.components),['lampac_personal_feed']);
  assert.ok(f.nodes['lampac-personal-feed-menu']);
  f.window.LampacRecommendations.open();
  assert.equal(f.pushes.length,1);
  assert.equal(f.pushes[0].component,'lampac_personal_feed');
});

test('waits for Lampa ready before registering a component', () => {
  const f = fixture(false); f.run();
  assert.equal(Object.keys(f.components).length,0);
  f.events.app({type:'ready'});
  assert.equal(typeof f.components.lampac_personal_feed,'function');
});

test('opens a TV recommendation using the standard TMDB full component', () => {
  const f = fixture(); f.run();
  f.window.LampacRecommendations.openCard({id:1399,media_type:'tv',source:'tmdb',name:'Series'});
  assert.equal(f.pushes[0].component,'full');
  assert.equal(f.pushes[0].source,'tmdb');
  assert.equal(f.pushes[0].method,'tv');
  assert.equal(f.pushes[0].id,1399);
});

test('rejects custom catalogue cards rather than sending their IDs to TMDB', () => {
  const f = fixture(); f.run();
  assert.equal(f.window.LampacRecommendations.openCard({id:123,source:'audiobooks'}),false);
  assert.equal(f.pushes.length,0);
});

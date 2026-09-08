import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const profile = require('../test-stand/profile.js');

const staticPlugins = [
  './plugins/tmdb_proxy.js',
  './plugins/etor.js',
  './plugins/online.js',
  './plugins/tracks.js',
  './plugins/collections.js',
  './plugins/dlna.js',
  './plugins/view_plugin.js',
  './plugins/twolines.js',
  './plugins/radio.js',
  './plugins/record.js',
  './plugins/nova_skin.js',
];

const backendPlugins = [
  './plugins/tracks.js',
  './plugins/collections.js',
  './plugins/dlna.js',
  './plugins/view_plugin.js',
  './plugins/twolines.js',
  './plugins/radio.js',
  './plugins/record.js',
  './plugins/nova_skin.js',
];

describe('test stand Lampac backend profile', () => {
  it('normalizes only absolute HTTP(S) Lampac URLs', () => {
    expect(profile.normalizeBackend('https://silver-space-9118.app.github.dev/')).toBe(
      'https://silver-space-9118.app.github.dev',
    );
    expect(profile.normalizeBackend('http://127.0.0.1:9118///')).toBe('http://127.0.0.1:9118');
    expect(profile.normalizeBackend('ftp://example.com')).toBeNull();
    expect(profile.normalizeBackend('/relative')).toBeNull();
  });

  it('keeps the existing static profile when no backend is supplied', () => {
    const result = profile.buildProfile('');
    expect(result.mode).toBe('static');
    expect(result.backend).toBeNull();
    expect(result.plugins).toEqual(staticPlugins);
    expect(result.features.tmdbProxy).toBe(true);
  });

  it('uses Lampac as authority for Online, TMDB Proxy and TorrServer in backend mode', () => {
    const result = profile.buildProfile(
      '?lampac=https%3A%2F%2Fsilver-space-9118.app.github.dev%2F',
    );

    expect(result.mode).toBe('lampac');
    expect(result.backend).toBe('https://silver-space-9118.app.github.dev');
    expect(result.lampacInitUrl).toBe('https://silver-space-9118.app.github.dev/lampainit.js');
    expect(result.plugins).toEqual(backendPlugins);
    expect(result.plugins).not.toContain('./plugins/online.js');
    expect(result.plugins).not.toContain('./plugins/tmdb_proxy.js');
    expect(result.plugins).not.toContain('./plugins/etor.js');
    expect(result.features.realLampac).toBe(true);
    expect(result.features.parser).toBe(true);
    expect(result.features.torserverProxy).toBe(true);
  });

  it('waits for the stock Lampa runtime before injecting Lampac init', () => {
    expect(profile.runtimeReady({ appready: true, Lampa: {} })).toBe(true);
    expect(profile.runtimeReady({ appready: false, Lampa: {} })).toBe(false);
    expect(profile.runtimeReady({ appready: true })).toBe(false);

    const source = fs.readFileSync('test-stand/profile.js', 'utf8');
    expect(source).not.toContain('document.write');
  });

  it('falls back to static mode for an invalid lampac parameter', () => {
    const result = profile.buildProfile('?lampac=javascript%3Aalert(1)');
    expect(result.mode).toBe('static');
    expect(result.backend).toBeNull();
    expect(result.plugins).toEqual(staticPlugins);
  });
});

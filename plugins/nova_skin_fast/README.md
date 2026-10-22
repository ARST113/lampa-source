# Nova Skin Fast — MCP Edition

Standalone Lampa UI plugin based on [amikdn/nova_skin.js](https://github.com/amikdn/amikdn.github.io/blob/main/nova_skin.js). This version retains the original Nova interface, online-source cards, hero artwork and TMDB logo loading while adding compatibility and correctness fixes based on the Lampa source API.

## GitHub Pages hosting

The executable plugin is published from the `gh-pages` branch. The primary install URL is `https://arst113.github.io/lampa-source/nova_skin_fast.js` (served directly as JavaScript, HTTP 200). The `main` branch contains the editable source.

For new releases, update both `plugins/nova_skin_fast/nova_skin_fast.js` in `main` and `nova_skin_fast.js` in `gh-pages` to keep the Pages URL in sync.

## Install

In Lampa, open **Settings → Plugins → Add plugin** and insert:

```text
https://arst113.github.io/lampa-source/nova_skin_fast.js
```

Disable other variants of Nova Skin before installing to avoid duplicate UI hooks. Restart Lampa after installation. The plugin has no additional build step.

## MCP Edition fixes (2026-10-22)

- Parse quality entries correctly when Lampa supplies either a direct string URL or an object with `url`; ignore callback-only quality entries.
- Preserve Lampa's own nested `Select.close()` and `Select.hide()` lifecycle. Only intercept `Select.show()` when capturing a dropdown.
- Preserve constructor identity for wrapped `Lampa.Filter` and `Lampa.Scroll`.
- Do not install a global `XMLHttpRequest.prototype.open` hook at startup.
- Add provider- and media-type-scoped keys for logo, quality, availability and switching caches; do not restore ambiguous legacy logo cache entries.
- Only query the correct TMDB media type for a logo.
- Avoid CSS-selector errors when a source label contains quotes or special characters.
- Respect persisted boolean `false` in environments where `Storage.get` substitutes a truthy default.
- Set the shared `window.nova_skin` flag only after successful initialization.

## Verification

The standalone JavaScript passes `node --check`. A small mocked Lampa runtime test covers initialization, native select close/hide preservation, constructor identity, absence of a global XHR hook, and selection of quality from string/object/lazy entries.

**Limitations:** These are static and isolated-runtime checks. Actual playback, remote-control navigation, performance and cross-platform compatibility still require testing in Lampa, Lampa Desktop, Android TV and other targeted devices.

## Source and attribution

Original skin: [amikdn/nova_skin.js](https://github.com/amikdn/amikdn.github.io/blob/main/nova_skin.js).

This derivative preserves its upstream attribution. Review the upstream repository's applicable licensing terms before further redistribution. No third-party licensing terms are granted by this README.

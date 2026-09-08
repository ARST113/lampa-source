const { test, expect } = require('@playwright/test');

const backend = (process.env.LAMPA_TEST_LAMPAC_URL || '').replace(/\/+$/, '');

test.skip(!backend, 'LAMPA_TEST_LAMPAC_URL is required');

test('LIVE DIAG: inspect real TorrServer viewed API contract', async ({ request }) => {
  test.setTimeout(60_000);
  const hash = '89abcdef0123456789abcdef0123456789abcdef';
  const rows = [];

  async function post(payload) {
    const response = await request.post(backend + '/ts/viewed', { data: payload, timeout: 30_000 });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) {}
    const item = { payload, status: response.status(), text, json };
    rows.push(item);
    console.log('[TS viewed]', JSON.stringify(item));
    return item;
  }

  const initial1 = await post({ action: 'list', hash, file_index: 1, timecode: 0 });
  const set1 = await post({ action: 'set', hash, file_index: 1, timecode: 65 });
  const list1 = await post({ action: 'list', hash, file_index: 1, timecode: 0 });
  const initial0 = await post({ action: 'list', hash, file_index: 0, timecode: 0 });
  const set0 = await post({ action: 'set', hash, file_index: 0, timecode: 33 });
  const list0 = await post({ action: 'list', hash, file_index: 0, timecode: 0 });

  for (const item of [initial1, set1, list1, initial0, set0, list0]) {
    expect(item.status).toBeGreaterThanOrEqual(200);
    expect(item.status).toBeLessThan(300);
  }
});

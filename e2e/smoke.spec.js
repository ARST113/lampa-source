const { test, expect } = require('@playwright/test');

test('serves the Lampa shell and core assets', async ({ page, request }) => {
  const response = await page.goto('/');

  expect(response, 'index.html should return a response').not.toBeNull();
  expect(response.ok(), 'index.html should return HTTP 2xx').toBeTruthy();
  await expect(page).toHaveTitle('Lampa');
  await expect(page.locator('#app')).toHaveCount(1);

  const app = await request.get('/app.js');
  expect(app.ok(), 'app.js should return HTTP 2xx').toBeTruthy();
  expect((await app.body()).length, 'app.js should contain a built application').toBeGreaterThan(1000);

  const css = await request.get('/css/app.css');
  expect(css.ok(), 'app.css should return HTTP 2xx').toBeTruthy();
  expect((await css.body()).length, 'app.css should contain compiled styles').toBeGreaterThan(1000);
});

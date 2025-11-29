import { expect, test } from '@playwright/test';

test('Mobile app web preview loads', async ({ page }) => {
  // Navigate to the web preview
  await page.goto('http://localhost:8085/', { waitUntil: 'domcontentloaded' });

  // Check if page title exists
  const title = await page.title();
  console.log('Page Title:', title);
  expect(title).toBeTruthy();

  // Check for any JavaScript errors
  let consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Wait a few seconds for the app to load
  await page.waitForTimeout(3000);

  // Try to find the root element
  const rootElement = await page.locator('#root, [data-testid="root"], body > *:first-child');
  const exists = await rootElement.count().then(count => count > 0);
  console.log('Root element exists:', exists);

  // Check for any visible content
  const body = await page.content();
  const hasContent = body.length > 2000;
  console.log('Page has content:', hasContent);
  console.log('Page content length:', body.length);

  // Log any console errors
  if (consoleErrors.length > 0) {
    console.log('Console Errors Found:');
    consoleErrors.forEach(err => console.log(' -', err));
  }

  // Take a screenshot
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved');
});

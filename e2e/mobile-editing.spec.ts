import { expect, test, type Locator, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

async function viewportWidth(page: Page) {
  return page.evaluate(() => document.documentElement.clientWidth);
}

async function expectInsideViewport(page: Page, locator: Locator) {
  const width = await viewportWidth(page);
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(width);
}

// Hosts such as Experiencer Pro keep the canvas at letter width inside a horizontal
// scroller and wrap the editing toolbar, whose rows change when a node is selected.
// Reproduce both host conditions so the shared editor stays usable inside them.
async function useHostPhoneLayout(page: Page) {
  await page.addStyleTag({ content: `
    #resume .text-content { min-width: 780px; }
    body:has(#resume [data-selected]) #toolbar { padding-bottom: 72px; }
  ` });
}

test.describe('phone touch editing at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('a double-tap on canvas text opens its editor even when selection moves the canvas', async ({ page }) => {
    await createResumeFromTemplate(page);
    await useHostPhoneLayout(page);
    const text = page.locator('#resume .text-content').first();
    await text.scrollIntoViewIfNeeded();
    const box = (await text.boundingBox())!;
    const x = box.x + Math.min(40, box.width / 2);
    const y = box.y + box.height / 2;

    // Both taps land on the same screen point, like a finger; the first tap's
    // selection is free to re-flow the wrapped toolbar above the canvas.
    await page.touchscreen.tap(x, y);
    await page.touchscreen.tap(x, y);

    await expect(page.locator('.resume-overlay-editor--markdown')).toBeVisible();
    await expect(text).toHaveClass(/editing/);
  });

  test('a slow second tap on the selected text still opens its editor', async ({ page }) => {
    await createResumeFromTemplate(page);
    await useHostPhoneLayout(page);
    const text = page.locator('#resume .text-content').first();
    await text.scrollIntoViewIfNeeded();
    const box = (await text.boundingBox())!;
    await page.touchscreen.tap(box.x + 20, box.y + box.height / 2);
    await page.waitForTimeout(700);
    const moved = (await text.boundingBox())!;
    await page.touchscreen.tap(moved.x + 20, moved.y + moved.height / 2);

    // A slow second tap on the selected node is still the ordinary click-to-edit.
    await expect(page.locator('.resume-overlay-editor--markdown')).toBeVisible();
  });

  test('the text editor fits the screen and keeps Save reachable', async ({ page }) => {
    await createResumeFromTemplate(page);
    await useHostPhoneLayout(page);
    const text = page.locator('#resume .text-content').first();
    await text.scrollIntoViewIfNeeded();
    await text.tap();
    await text.tap();

    const editor = page.locator('.resume-overlay-editor--markdown');
    await expect(editor).toBeVisible();
    await expect(page.locator('.w-md-editor')).toBeVisible();
    await expectInsideViewport(page, editor);
    const save = page.getByRole('button', { name: 'Save (Ctrl + Enter)' });
    await expectInsideViewport(page, save);
    await expectInsideViewport(page, page.getByRole('button', { name: 'Cancel', exact: true }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await viewportWidth(page));

    await page.getByLabel('Text content').fill('Edited on a phone.');
    await save.tap();
    await expect(text).toContainText('Edited on a phone.');
  });
});

test('desktop double-click still opens the text editor over the text', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await createResumeFromTemplate(page);
  const text = page.locator('#resume .text-content').first();
  await text.dblclick();

  const editor = page.locator('.resume-overlay-editor--markdown');
  await expect(editor).toBeVisible();
  const textBox = (await text.boundingBox())!;
  const overlayBox = (await page.locator('.overlay-editor').boundingBox())!;
  // Unconstrained overlays still start at the edited text and span at least its width.
  expect(Math.abs(overlayBox.x - textBox.x)).toBeLessThanOrEqual(1);
  expect(overlayBox.width).toBeGreaterThanOrEqual(textBox.width - 1);
});

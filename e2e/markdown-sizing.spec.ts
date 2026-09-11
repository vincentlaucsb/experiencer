import { expect, test, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

async function expectTextareaToFit(page: Page) {
  await expect.poll(async () => page.getByLabel('Text content').evaluate((element) => {
    const pane = element.closest('.w-md-editor-area')!;
    const inputBounds = element.getBoundingClientRect();
    const paneBounds = pane.getBoundingClientRect();
    return Math.max(
      Math.abs(inputBounds.height - paneBounds.height),
      Math.abs(inputBounds.width - paneBounds.width),
    );
  })).toBeLessThanOrEqual(1);
}

for (const [name, content] of [
  ['empty', ''],
  ['short', 'A short paragraph.'],
  ['multiline', Array.from({ length: 8 }, (_, index) => `Paragraph ${index + 1}.`).join('\n\n')],
] as const) {
  test(`Markdown textarea fills the available editing pane with ${name} content`, async ({ page }) => {
    await createResumeFromTemplate(page);
    const markdown = page.locator('#resume .text-content').first();
    await markdown.click();
    await markdown.click();

    const input = page.getByLabel('Text content');
    await expect(page.locator('.w-md-editor')).toBeVisible();
    await input.fill(content);

    // Measure the real textarea, not just the outer editor's configured height.
    // A textarea can fill its immediate wrapper while leaving half the pane unusable.
    const bounds = await input.evaluate((element) => {
      const pane = element.closest('.w-md-editor-area')!;
      const wrapper = element.parentElement!;
      return {
        inputHeight: element.getBoundingClientRect().height,
        paneHeight: pane.getBoundingClientRect().height,
        wrapperHeight: wrapper.getBoundingClientRect().height,
        inputWidth: element.getBoundingClientRect().width,
        paneWidth: pane.getBoundingClientRect().width,
        wrapperMinHeight: getComputedStyle(wrapper).minHeight,
      };
    });

    expect(bounds.inputWidth, JSON.stringify(bounds)).toBeCloseTo(bounds.paneWidth, 0);
    expect(Math.abs(bounds.inputHeight - bounds.paneHeight), JSON.stringify(bounds)).toBeLessThanOrEqual(1);
  });
}

test('Markdown textarea follows resizing and preview mode changes', async ({ page }) => {
  await createResumeFromTemplate(page);
  const markdown = page.locator('#resume .text-content').first();
  await markdown.click();
  await markdown.click();
  await expect(page.locator('.w-md-editor')).toBeVisible();
  await page.getByLabel('Text content').fill('Scrollable paragraph.\n\n'.repeat(30));
  const editor = page.locator('.w-md-editor');
  const initialHeight = await editor.evaluate(element => element.getBoundingClientRect().height);

  // UIW ignores out-of-range pointer moves instead of clamping them.
  for (const delta of [120, -240]) {
    const handle = await page.locator('.w-md-editor-bar').boundingBox();
    if (!handle) throw new Error('Missing Markdown resize handle');
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2 + delta);
    await page.mouse.up();
    if (delta > 0) {
      await expect.poll(async () => editor.evaluate(element => element.getBoundingClientRect().height))
        .toBeGreaterThan(initialHeight);
    } else {
      await expect(editor).toHaveCSS('height', '100px');
      await expect.poll(async () => page.locator('.w-md-editor-area').evaluate(element => (
        element.getBoundingClientRect().height
      ))).toBeLessThan(100);
    }
    await expectTextareaToFit(page);
  }

  const input = page.getByLabel('Text content');
  await input.evaluate(element => { element.scrollTop = element.scrollHeight; });
  expect(await input.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect.poll(async () => page.locator('.w-md-editor-area').evaluate(element => (
    element.scrollHeight - element.clientHeight
  ))).toBeLessThanOrEqual(1);

  await page.getByRole('button', { name: 'Live code (ctrl + 8)', exact: true }).click();
  await expect(editor).toHaveClass(/w-md-editor-show-live/);
  await expectTextareaToFit(page);
  await page.getByRole('button', { name: 'Toggle fullscreen (ctrl + 0)', exact: true }).click();
  await expect(editor).toHaveClass(/w-md-editor-fullscreen/);
  await expectTextareaToFit(page);
  await page.getByRole('button', { name: 'Toggle fullscreen (ctrl + 0)', exact: true }).click();
  await expect(editor).not.toHaveClass(/w-md-editor-fullscreen/);
  await expectTextareaToFit(page);
});

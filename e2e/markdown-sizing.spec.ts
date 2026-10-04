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

test('Markdown editor grows with content, shrinks, and stays above the viewport edge on resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createResumeFromTemplate(page);
  const markdown = page.locator('#resume .text-content').first();
  await markdown.click();
  await markdown.click();
  await expect(page.locator('.w-md-editor')).toBeVisible();
  const editor = page.locator('.w-md-editor');
  const input = page.getByLabel('Text content');
  await input.fill('Short paragraph.');
  await expect(editor).toHaveCSS('height', '220px');
  await input.fill('Paragraph with enough source lines to grow.\n'.repeat(12));
  await expect.poll(async () => editor.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(220);
  expect(await input.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  await input.fill('Scrollable paragraph.\n\n'.repeat(80));
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 1100, height: 720 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => page.locator('.resume-overlay-editor--markdown').evaluate(element =>
      element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(viewport.height - 14);
    await expect(page.getByRole('button', { name: 'Save (Ctrl + Enter)' })).toBeInViewport();
    await expectTextareaToFit(page);
  }
  await input.evaluate(element => { element.scrollTop = element.scrollHeight; });
  expect(await input.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect.poll(async () => page.locator('.w-md-editor-area').evaluate(element => (
    element.scrollHeight - element.clientHeight
  ))).toBeLessThanOrEqual(1);

  await page.getByRole('button', { name: 'Preview code (ctrl + 9)', exact: true }).click();
  await expect(editor).toHaveClass(/w-md-editor-show-preview/);
  await page.setViewportSize({ width: 1100, height: 650 });
  await expect.poll(async () => page.locator('.resume-overlay-editor--markdown').evaluate(element =>
    element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(636);
  await expect(page.getByRole('button', { name: 'Save (Ctrl + Enter)' })).toBeInViewport();

  await page.getByRole('button', { name: 'Live code (ctrl + 8)', exact: true }).click();
  await expect(editor).toHaveClass(/w-md-editor-show-live/);
  await expectTextareaToFit(page);
  await page.getByRole('button', { name: 'Toggle fullscreen (ctrl + 0)', exact: true }).click();
  await expect(editor).toHaveClass(/w-md-editor-fullscreen/);
  await expectTextareaToFit(page);
  await page.getByRole('button', { name: 'Toggle fullscreen (ctrl + 0)', exact: true }).click();
  await expect(editor).not.toHaveClass(/w-md-editor-fullscreen/);
  await expectTextareaToFit(page);
  await page.getByRole('button', { name: 'Edit code (ctrl + 7)', exact: true }).click();
  await input.fill('Short again.');
  await expect(editor).toHaveCSS('height', '220px');
  await page.getByRole('button', { name: 'Save (Ctrl + Enter)' }).click();
  await expect(markdown).toHaveText('Short again.');
});

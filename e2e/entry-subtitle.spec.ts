import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('optional entry subtitles remain addable and empty headings stay out of print output', async ({ page, context }) => {
  await context.addInitScript(() => { window.print = () => undefined; });
  await createResumeFromTemplate(page);
  const entry = page.locator('#resume article.entry').first();
  await entry.evaluate(element => (element as HTMLElement).click());
  while (await entry.locator('h4.subtitle .field').count()) {
    await entry.locator('h4.subtitle .field').first().click({ button: 'right' });
    await page.getByRole('menuitem', { name: /^Delete "/ }).click();
  }
  await expect(entry.locator('h4.subtitle')).toHaveCount(1);
  await expect(entry.getByRole('button', { name: 'Add detail', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'File', exact: true }).click();
  const emptyPopupPromise = context.waitForEvent('page');
  await page.getByRole('menuitem', { name: /print/i }).click();
  const emptyPopup = await emptyPopupPromise;
  await expect(emptyPopup.locator('article.entry').first().locator('h4.subtitle')).toHaveCount(0);
  await emptyPopup.close();

  await entry.getByRole('button', { name: 'Add detail', exact: true }).click();
  const input = entry.getByRole('textbox', { name: 'Enter a value' });
  await input.fill('Synthetic restored detail');
  await input.press('Enter');
  await expect(entry.locator('h4.subtitle')).toContainText('Synthetic restored detail');
  await page.getByRole('button', { name: 'File', exact: true }).click();
  const populatedPopupPromise = context.waitForEvent('page');
  await page.getByRole('menuitem', { name: /print/i }).click();
  const populatedPopup = await populatedPopupPromise;
  await expect(populatedPopup.locator('article.entry').first().locator('h4.subtitle')).toHaveText('Synthetic restored detail');
});

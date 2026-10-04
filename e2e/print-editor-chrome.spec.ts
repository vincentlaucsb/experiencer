import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('print preview omits editor controls and empty-field hints', async ({ page }) => {
  await page.context().addInitScript(() => {
    window.print = () => undefined;
  });
  await createResumeFromTemplate(page);

  const name = page.getByRole('heading', { name: 'Randy Marsh', exact: true });
  await name.click();
  await name.click();
  const nameInput = page.getByRole('textbox', { name: 'Title', exact: true });
  await nameInput.fill('');
  await nameInput.press('Enter');
  await expect(page.getByRole('heading', { name: 'Enter a title', exact: true })).toBeVisible();

  const entry = page.locator('#resume article.entry').first();
  await entry.evaluate((element) => (element as HTMLElement).click());
  await entry.getByRole('button', { name: 'Add title', exact: true }).click();
  const addedTitle = entry.getByRole('textbox', { name: 'Enter a value' });
  await addedTitle.press('Enter');
  await expect(entry.getByText('Enter a value', { exact: true })).toBeVisible();
  await expect(entry).toContainText('Tegridy Farms');
  await expect(entry.getByRole('button', { name: 'Add title', exact: true })).toBeVisible();
  await expect(entry.getByRole('button', { name: 'Add detail', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'File', exact: true }).click();
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('menuitem', { name: 'Print' }).click();
  const preview = await popupPromise;

  await expect(preview.locator('body')).toContainText('Tegridy Farms');
  await expect(preview.getByText('Enter a value', { exact: true })).toHaveCount(0);
  await expect(preview.getByText('Enter a title', { exact: true })).toHaveCount(0);
  await expect(preview.getByText('ENTER A TITLE', { exact: true })).toHaveCount(0);
  await expect(preview.getByRole('button', { name: 'Add title' })).toHaveCount(0);
  await expect(preview.getByRole('button', { name: 'Add detail' })).toHaveCount(0);
});

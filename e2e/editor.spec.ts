import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('switches page size and adds a new section', async ({ page }) => {
  await createResumeFromTemplate(page);

  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'letter');
  await page.getByRole('button', { name: 'A4' }).click();
  await expect(page.locator('#resume')).toHaveAttribute('data-page-size', 'a4');

  const sectionCount = await page.locator('#resume section').count();
  await page.getByRole('button', { name: 'Add Section' }).click();

  await expect(page.locator('#resume section')).toHaveCount(sectionCount + 1);
  await expect(page.getByRole('heading', { name: 'Enter a title' })).toBeVisible();
});

test('opens and exits print preview from the file menu', async ({ page }) => {
  await createResumeFromTemplate(page);

  await page.getByRole('button', { name: 'File' }).click();
  await page.getByRole('button', { name: 'Print' }).click();

  await expect(page.locator('#print-preview-actions')).toBeVisible();
  await expect(page.locator('#app-header')).toBeHidden();

  await page.getByRole('button', { name: 'Exit Print Preview' }).click();

  await expect(page.locator('#app-header')).toBeVisible();
  await expect(page.locator('#toolbar')).toBeVisible();
});

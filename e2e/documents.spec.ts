import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('creates a resume from a template and shows it in the document library', async ({ page }) => {
  await createResumeFromTemplate(page, 'Streamline');

  await page.getByRole('button', { name: 'Go to landing page' }).click();

  await expect(page.getByRole('region', { name: 'Resume library' })).toBeVisible();
  await expect(page.locator('.resume-library-item')).toContainText('Streamline');
  await expect(page.locator('.resume-library-item')).toContainText('Version 1');
  await expect(page.getByRole('button', { name: 'Return to editing resume' })).toBeVisible();
});

test('renames and deletes a saved resume from the landing page', async ({ page }) => {
  await createResumeFromTemplate(page, 'Assured');
  await page.getByRole('button', { name: 'Go to landing page' }).click();

  const documentCard = page.locator('.resume-library-item').filter({ hasText: 'Assured' }).first();
  await documentCard.getByRole('button', { name: 'Rename' }).click();
  await page.getByLabel('Name').fill('Product Resume');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('.resume-library-item')).toContainText('Product Resume');

  await page.getByRole('button', { name: 'New' }).click();
  await page.getByText('Streamline', { exact: true }).click();
  await page.getByRole('button', { name: 'Use this Template' }).click();
  await page.getByRole('button', { name: 'Go to landing page' }).click();

  page.on('dialog', (dialog) => dialog.accept());
  await page.locator('.resume-library-item').filter({ hasText: 'Product Resume' }).getByRole('button', { name: 'Delete' }).click();

  await expect(page.locator('.resume-library-item')).not.toContainText('Product Resume');
  await expect(page.locator('.resume-library-item')).toContainText('Streamline');
});

import { expect, type Page } from '@playwright/test';

export async function openFreshApp(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto('/');
}

export async function createResumeFromTemplate(page: Page, templateName = 'Integrity') {
  await openFreshApp(page);

  await page.getByRole('button', { name: 'New' }).click();
  await page.getByText(templateName, { exact: true }).click();
  await page.getByRole('button', { name: 'Use this Template' }).click();

  await expect(page.locator('#resume')).toBeVisible();
  await expect(page.locator('#toolbar')).toBeVisible();
  await expect(page.locator('.save-status')).toContainText('Saved v1');
}

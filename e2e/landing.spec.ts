import { expect, test } from '@playwright/test';
import { openFreshApp } from './helpers';

test('shows the getting started landing page', async ({ page }) => {
  await openFreshApp(page);

  await expect(page.getByRole('button', { name: 'Go to landing page' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Getting Started' })).toBeVisible();
  await expect(page.getByText('Welcome to Experiencer')).toBeVisible();
  await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Experiencer on GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/vincentlaucsb/experiencer',
  );
});

test('opens the file loader modal from the landing page', async ({ page }) => {
  await openFreshApp(page);

  await page.getByRole('button', { name: 'Load' }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Load File' })).toBeVisible();
});

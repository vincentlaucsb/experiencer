import {expect, test} from '@playwright/test';
import {openFreshApp} from './helpers';

test('the local template picker uses the selected professional content and keeps its theme', async ({page}) => {
  await openFreshApp(page); await page.getByRole('button', {name: /New$/}).click();
  await page.getByText('Integrity', {exact: true}).click();
  const choice = page.getByRole('combobox', {name: 'Content starting point'});
  await expect(choice).toHaveValue('sample');
  await choice.selectOption('professional');
  await page.getByRole('radio', {name: 'Forest', exact: true}).check();
  await expect(page.frameLocator('iframe').locator('body')).toContainText('Maya Patel');
  await page.getByRole('button', {name: 'Use this Template', exact: true}).click();
  await expect(page.locator('#resume')).toContainText('Maya Patel');
  await expect(page.locator('#resume')).toHaveCSS('--randy-teal', '#76a58a');
  await expect(page.locator('.save-status')).toContainText('Saved v1');
});

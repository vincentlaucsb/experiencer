import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('standalone editor offers Notes and preserves imported notes read-only', async ({ page }) => {
  await createResumeFromTemplate(page);
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Upgrade to Pro' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Notes Markdown' })).toHaveCount(0);
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Load', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'with-notes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({
    childNodes: [{ type: 'Section', value: 'Resume content', childNodes: [{ type: 'Entry', title: ['Example entry'], notes: 'Entry private guidance' }] }],
    builtinCss: { name: 'Resume CSS', selector: 'body', properties: [], children: [] },
    rootCss: { name: ':root', selector: ':root', properties: [], children: [] },
    notes: { markdown: 'Private reminder', templateGuidance: 'Preserve leadership' }
  })) });
  await expect(page.locator('#resume')).toContainText('Resume content');
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await expect(page.getByLabel('Saved notes')).toHaveText('Private reminder');
  await expect(page.locator('#resume')).not.toContainText('Private reminder');
  await page.getByRole('tab', { name: 'Tree', exact: true }).click();
  await page.getByRole('tree').getByRole('button', { name: 'View Notes' }).click();
  await expect(page.getByRole('dialog')).toContainText('Entry private guidance');
  await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
  await expect(page.getByRole('dialog')).not.toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('dialog')).toHaveCSS('position', 'static');
  await expect(page.getByRole('dialog').getByRole('textbox')).toHaveCount(0);
});


test('standalone entry notes open read-only from selection, tree and context menu', async ({ page }) => {
  await createResumeFromTemplate(page);
  const entry = page.locator('#resume .entry').first();
  await entry.locator('.title').click();
  await entry.getByRole('button', { name: 'Add Notes', exact: true }).click();
  const modal = page.getByRole('dialog', { name: /^View Notes/ });
  await expect(modal).toContainText('Pro is required to edit notes');
  await expect(modal.getByRole('textbox')).toHaveCount(0);
  await modal.getByRole('button', { name: 'Close View Notes' }).click();
  await entry.locator('.title .field').first().click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Add Notes', exact: true }).click();
  await expect(modal).toBeVisible();
});

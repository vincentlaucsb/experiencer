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
    childNodes: [{ type: 'Section', value: 'Resume content' }],
    builtinCss: { name: 'Resume CSS', selector: 'body', properties: [], children: [] },
    rootCss: { name: ':root', selector: ':root', properties: [], children: [] },
    notes: { markdown: 'Private reminder', templateGuidance: 'Preserve leadership' }
  })) });
  await expect(page.locator('#resume')).toContainText('Resume content');
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await expect(page.getByLabel('Saved notes')).toHaveText('Private reminder');
  await expect(page.locator('#resume')).not.toContainText('Private reminder');
});

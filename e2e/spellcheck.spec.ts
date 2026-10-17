import { expect, test, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

/** Records whether the next right-click reaches the browser's own menu. */
async function watchNextContextMenu(page: Page) {
  await page.evaluate(() => {
    const state = window as unknown as { nativeMenuAllowed?: boolean };
    delete state.nativeMenuAllowed;
    document.addEventListener('contextmenu', event => {
      setTimeout(() => { state.nativeMenuAllowed = !event.defaultPrevented; });
    }, { capture: true, once: true });
  });
  return () => page.evaluate(() => (window as unknown as { nativeMenuAllowed?: boolean }).nativeMenuAllowed);
}

test('résumé text fields use native spellcheck and keep its suggestion menu', async ({ page }) => {
  await createResumeFromTemplate(page);

  const entryTitle = page.locator('#resume').getByText('Tegridy Farms', { exact: true });
  await entryTitle.click();
  await entryTitle.click();
  const field = page.locator('#resume article.entry').getByRole('textbox', { name: 'Enter a value' });
  await expect(field).toHaveAttribute('spellcheck', 'true');

  const nativeMenuAllowed = await watchNextContextMenu(page);
  await field.click({ button: 'right' });
  await expect.poll(nativeMenuAllowed).toBe(true);
  await expect(page.locator('[data-popright-menu]')).toHaveCount(0);
  await expect(field).toBeVisible();
  await field.press('Escape');

  const markdown = page.locator('#resume .text-content').first();
  await markdown.click();
  await markdown.click();
  await expect(page.locator('.w-md-editor')).toBeVisible();
  await expect(page.getByLabel('Text content')).toHaveAttribute('spellcheck', 'true');
  const overlayMenuAllowed = await watchNextContextMenu(page);
  await page.getByLabel('Text content').click({ button: 'right' });
  await expect.poll(overlayMenuAllowed).toBe(true);
  await expect(page.locator('[data-popright-menu]')).toHaveCount(0);
  await expect(page.getByLabel('Text content')).toBeFocused();
});

test('node menus still open outside text fields and CSS values are not spellchecked', async ({ page }) => {
  await createResumeFromTemplate(page);

  const nativeMenuAllowed = await watchNextContextMenu(page);
  await page.getByRole('heading', { name: 'Randy Marsh' }).click({ button: 'right' });
  await expect(page.locator('[data-popright-menu]')).toBeVisible();
  await expect.poll(nativeMenuAllowed).toBe(false);
  await page.keyboard.press('Escape');

  await page.locator('#resume article.entry').first().evaluate(element => (element as HTMLElement).click());
  await page.getByRole('tab', { name: 'CSS', exact: true }).click();
  const property = page.locator('section.css-category .property').first();
  const key = await property.locator('.property-key').innerText();
  await property.locator('.property-value-display').click();
  await expect(page.getByLabel(`${key} value`)).toHaveAttribute('spellcheck', 'false');
});

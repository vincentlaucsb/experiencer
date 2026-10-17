import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

for (const theme of ['light', 'dark']) {
  test(`shared cards preserve library geometry and theme Pure controls in ${theme}`, async ({ page }) => {
    await createResumeFromTemplate(page, 'Streamline');
    await page.getByRole('button', { name: 'Go to landing page' }).click();
    await page.evaluate((value) => document.documentElement.dataset.theme = value, theme);
    const libraryCard = page.locator('.resume-library-item').first();
    await expect(libraryCard).toHaveCSS('padding', '12px');
    await expect(libraryCard).toHaveCSS('border-radius', '6px');
    await expect(libraryCard).toHaveClass(/app-card/);

    // Mount semantic HTML in the real application stylesheet to exercise Pure's vendor cascade too.
    await page.evaluate(() => {
      const fixture = document.createElement('section');
      fixture.id = 'shared-surface-fixture';
      fixture.className = 'app-p-4';
      fixture.innerHTML = `
        <button class="pure-button app-card active app-p-3">Selected fixture card</button>
        <form class="pure-form pure-form-stacked app-form">
          <label>Fixture title<input type="text" value="Synthetic title"></label>
          <label>Fixture posting<textarea>Synthetic posting</textarea></label>
          <label>Fixture selection<select><option>One</option></select></label>
          <label>Fixture read-only<input type="text" value="Read only" readonly></label>
          <label>Fixture disabled<input type="text" value="Disabled" disabled></label>
          <label class="pure-checkbox"><input type="checkbox">Fixture enabled</label>
        </form>
        <table class="pure-table pure-table-striped app-table">
          <thead><tr><th>Fixture heading</th><th>Fixture value</th></tr></thead>
          <tbody><tr><th scope="row">Odd row heading</th><td>Odd fixture row</td></tr><tr><th scope="row">Even row heading</th><td>Even fixture row</td></tr></tbody>
        </table>`;
      document.body.append(fixture);
    });
    const fixture = page.locator('#shared-surface-fixture');
    const palette = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const resolve = (token: string) => {
        const element = document.createElement('span');
        element.style.color = style.getPropertyValue(token);
        document.body.append(element);
        const color = getComputedStyle(element).color;
        element.remove();
        return color;
      };
      return {
        text: resolve('--xp-text-primary'), raised: resolve('--xp-surface-raised'),
        muted: resolve('--xp-surface-muted'), focus: resolve('--xp-focus-ring'),
        border: resolve('--xp-border-strong'), interactive: resolve('--xp-surface-interactive'),
      };
    });
    for (const name of ['Fixture title', 'Fixture posting', 'Fixture selection']) {
      await expect(fixture.getByLabel(name)).toHaveCSS('background-color', palette.raised);
      await expect(fixture.getByLabel(name)).toHaveCSS('color', palette.text);
      await expect(fixture.getByLabel(name)).toHaveCSS('box-sizing', 'border-box');
    }
    for (const name of ['Fixture read-only', 'Fixture disabled']) {
      await expect(fixture.getByLabel(name)).toHaveCSS('background-color', palette.muted);
    }
    await fixture.getByLabel('Fixture title').focus();
    await expect(fixture.getByLabel('Fixture title')).toHaveCSS('outline-color', palette.focus);
    await expect(fixture.getByLabel('Fixture title')).toHaveCSS('outline-width', '2px');
    await expect(fixture.locator('.pure-checkbox')).toHaveCSS('display', 'flex');
    await fixture.getByLabel('Fixture enabled').check();
    await expect(fixture.getByLabel('Fixture enabled')).toBeChecked();
    await expect(fixture.locator('table')).toHaveCSS('border-top-color', palette.border);
    await expect(fixture.locator('thead')).toHaveCSS('background-color', palette.muted);
    await expect(fixture.getByRole('cell', { name: 'Odd fixture row' })).toHaveCSS('background-color', palette.muted);
    await expect(fixture.getByRole('rowheader', { name: 'Odd row heading' })).toHaveCSS('background-color', palette.muted);
    await expect(fixture.getByRole('cell', { name: 'Even fixture row' })).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    // Pure still owns the cell padding; the helper changes palette, not table layout.
    await expect(fixture.getByRole('cell', { name: 'Odd fixture row' })).toHaveCSS('padding', '8px 16px');
    const selected = fixture.getByRole('button', { name: 'Selected fixture card' });
    await expect(selected).toHaveCSS('padding', '12px');
    await expect(selected).toHaveCSS('border-left-color', palette.interactive);
    await expect(selected).toHaveCSS('color', palette.text);
    await selected.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(selected).toBeFocused();
    await expect(selected).toHaveCSS('outline-color', palette.focus);
    await selected.hover();
    await expect(selected).toHaveCSS('background-color', palette.muted);
  });
}

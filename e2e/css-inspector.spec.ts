import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('raw rules open their editable owner and nested path, and resume selection replaces inspector focus', async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    const block = page.locator('.raw-css-rule').filter({ hasText: 'body .entry > hgroup > h3' }).first();
    const selector = (await block.locator('code').innerText()).split(' {')[0];
    const button = block.getByRole('button');
    await button.focus();
    await button.press('Enter');
    await expect(page.getByRole('tab', { name: 'CSS', exact: true })).toHaveAttribute('aria-selected', 'true');
    const focused = page.locator('section.css-category').filter({ has: page.locator('.css-description', { hasText: selector }) }).last();
    await expect(focused).toBeFocused();
    await expect(focused).toHaveCount(1);
    await expect(focused.locator('.css-ruleset').first()).toContainText(selector);
    const property = focused.locator('.property').first();
    const key = await property.locator('.property-key').innerText();
    await property.locator('.property-value-display').click();
    await expect(page.getByLabel(`${key} value`)).toBeFocused();
    await page.getByLabel(`${key} value`).press('Escape');
    await expect(property.locator('.property-value-display')).toBeFocused();
    await page.locator('#resume article.entry').first().evaluate(element => (element as HTMLElement).click());
    await expect(page.getByText('PARENT', { exact: true }).first()).toBeVisible();
    const parents = page.locator('section.css-category-ancestor');
    await expect(parents.first()).toHaveCSS('border-top-width', '0px');
    // Component addresses stay fixed while ordinary nested rules remain renameable.
    const entryTitle = page.locator('h2.css-title-heading .css-title').filter({ hasText: /^Entry$/ }).first();
    await entryTitle.click();
    await expect(page.getByRole('textbox', { name: 'Enter a section name' })).toHaveCount(0);
    await expect(page.locator('.css-ruleset').first()).toContainText('body .entry');
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await page.getByRole('button', { name: `Edit ${selector} in CSS`, exact: true }).click();
    const nestedTitle = page.locator('section.css-category:focus > h2 .css-title');
    await nestedTitle.click();
    const nameInput = page.getByRole('textbox', { name: 'Enter a section name' });
    await nameInput.fill('Renamed nested rule');
    await nameInput.press('Enter');
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await page.getByRole('button', { name: `Edit ${selector} in CSS`, exact: true }).click();
    await expect(page.locator('h2.css-title-heading .css-title').filter({ hasText: /^Renamed nested rule$/ })).toBeVisible();
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await page.getByRole('button', { name: 'Edit :root in CSS', exact: true }).click();
    await expect(page.locator('.css-ruleset').first()).toContainText(':root');
});

test('declarations flow after their own property and remain readable in dark mode', async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    const declarations = page.locator('.css-declarations').first();
    const rows = declarations.locator('.property');
    await expect(rows.first()).toBeVisible();
    const geometry = await rows.evaluateAll(elements => elements.slice(0, 3).map(row => {
        const key = row.querySelector('.property-key')!.getBoundingClientRect();
        const value = row.querySelector('.property-value-display')!.getBoundingClientRect();
        return { keyRight: key.right, valueLeft: value.left, topGap: Math.abs(key.top - value.top) };
    }));
    for (const line of geometry) {
        expect(line.valueLeft - line.keyRight).toBeLessThan(30);
        expect(line.topGap).toBeLessThan(3);
    }
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expect(rows.first().locator('.property-key')).toHaveCSS('color', 'rgb(57, 183, 165)');
    await page.setViewportSize({ width: 1000, height: 900 });
    await expect(rows.first()).toBeVisible();
});

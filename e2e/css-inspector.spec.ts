import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('one CSS view edits full rules and keeps renamed rules scoped after reopening', async ({ page, context }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Raw CSS', exact: true })).toHaveCount(0);
    const panel = page.getByRole('tabpanel', { name: 'CSS' });
    const nested = panel.locator('section.css-category').filter({
        has: page.getByRole('button', { name: 'Selector: body .entry > hgroup > h3', exact: true })
    }).first();
    const value = nested.locator('.property-value-display').first();
    await value.press('Enter');
    const draft = nested.locator('.property-value').getByRole('textbox');
    await expect(draft).toBeFocused();
    await draft.press('Escape');
    await expect(value).toBeFocused();

    const entry = page.locator('#resume article.entry').first();
    await entry.evaluate(element => (element as HTMLElement).click());
    const allCss = page.getByRole('button', { name: 'All CSS', exact: true });
    await expect(allCss).toHaveAttribute('aria-pressed', 'false');
    await expect(panel.getByRole('button', { name: 'Selector: :root', exact: true })).toHaveCount(0);
    await expect(panel.getByText('PARENT', { exact: true }).first()).toBeVisible();
    const entryName = panel.getByRole('button', { name: 'Rule name: Entry', exact: true });
    await entryName.press('Enter');
    const nameInput = panel.getByRole('textbox', { name: 'Rule name', exact: true });
    await nameInput.fill('Work experience *entry*');
    await nameInput.press('Enter');
    const renamed = panel.getByRole('button', { name: 'Rule name: Work experience *entry*', exact: true });
    await expect(renamed).toBeFocused();
    await expect(renamed.locator('..')).toHaveText('/* Work experience *entry* */');
    await expect(panel.getByRole('button', { name: 'Delete Work experience *entry* rule', exact: true })).toBeVisible();
    await renamed.press('Enter');
    await nameInput.fill('Discard this label');
    await nameInput.press('Escape');
    await expect(renamed).toBeFocused();
    await expect(panel.getByRole('button', { name: 'Highlight elements matching body .entry', exact: true })).toBeVisible();

    await allCss.click();
    await expect(allCss).toHaveAttribute('aria-pressed', 'true');
    await expect(panel.getByRole('button', { name: 'Selector: :root', exact: true })).toBeVisible();
    await allCss.click();
    await expect(renamed).toBeVisible();
    await page.keyboard.press('Control+s');
    await expect(page.locator('.save-status')).toContainText('Saved v2');

    const restored = await context.newPage();
    await restored.goto('/');
    await restored.getByRole('button', { name: 'Open', exact: true }).click();
    await restored.locator('#resume article.entry').first().evaluate(element => (element as HTMLElement).click());
    await restored.getByRole('tab', { name: 'CSS', exact: true }).click();
    await expect(restored.getByRole('button', { name: 'Rule name: Work experience *entry*', exact: true })).toBeVisible();
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

test('long selectors wrap beside right-aligned actions and tooltips cross the pane edge', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();

    const rule = page.locator('section.css-category-1').filter({
        has: page.getByRole('button', { name: 'Rule name: Image', exact: true })
    });
    await rule.getByRole('button', { name: 'Selector: body img', exact: true }).click();
    const selectorInput = rule.getByRole('textbox', { name: 'Selector', exact: true });
    await selectorInput.fill('img.profile, img.illustration, img.chart, img.background, img.placeholder');
    await selectorInput.press('Enter');

    const selector = rule.getByRole('button', { name: /^Selector: body img.profile/ });
    const action = rule.getByRole('button', { name: /^Highlight elements matching body img.profile/ });
    await action.hover();
    const tooltip = page.getByRole('tooltip', { name: /^Highlight elements matching body img.profile/ });
    await expect(tooltip).toBeVisible();
    const row = rule.locator('.css-selector-row');
    const buttons = rule.locator('.css-rule-actions');
    const geometry = await Promise.all([selector, row, buttons].map(locator => locator.boundingBox()));
    const [selectorBox, rowBox, actionBox] = geometry.map(box => box!);
    expect(selectorBox.height).toBeGreaterThan(actionBox.height * 2);
    expect(Math.abs(actionBox.y - rowBox.y)).toBeLessThan(2);
    expect(Math.abs(actionBox.x + actionBox.width - rowBox.x - rowBox.width)).toBeLessThan(2);
    expect(selectorBox.x + selectorBox.width).toBeLessThan(actionBox.x);

    const inspector = page.locator('.split-pane__inspector');
    const inspectorBox = (await inspector.boundingBox())!;
    await expect.poll(() => tooltip.evaluate((element, divider) => {
        const bounds = element.getBoundingClientRect();
        const point = document.elementFromPoint(divider - 5, bounds.top + bounds.height / 2);
        return bounds.left < divider - 5 && element.contains(point);
    }, inspectorBox.x)).toBe(true);
    await action.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await expect(action).toBeFocused();
});

test('a pseudo-element can insert a variable inherited from the résumé body', async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    const ruleFor = (selector: string) => page.locator('section.css-category').filter({
        has: page.getByRole('button', { name: 'Selector: ' + selector, exact: true })
    });
    const addProperty = async (selector: string, name: string) => {
        const rule = ruleFor(selector);
        await rule.getByRole('button', { name: 'Add property', exact: true }).click();
        const field = rule.getByLabel('New property name value');
        await field.fill(name);
        await field.press('Enter');
        return rule.getByLabel(name + ' value', { exact: true });
    };

    const variable = await addProperty('body', '--picker-color');
    await variable.fill('rebeccapurple');
    await variable.press('Enter');
    const entry = ruleFor('body .entry');
    await entry.getByRole('button', { name: 'Add pseudo-class or pseudo-element to Entry', exact: true }).click();
    await page.getByRole('button', { name: '::before', exact: true }).click();

    const value = await addProperty('body .entry::before', 'color');
    await ruleFor('body .entry::before').getByRole('button', { name: 'Insert variable', exact: true }).click();
    const picker = page.getByRole('dialog', { name: 'Insert a CSS variable' });
    await picker.getByRole('button', { name: 'var(--picker-color)', exact: true }).click();
    await expect(value).toBeFocused();
    await expect(value).toHaveValue('var(--picker-color)');
    await value.press('Enter');
    await expect.poll(() => page.locator('#resume article.entry').first().evaluate(
        element => getComputedStyle(element, '::before').color
    )).toBe('rgb(102, 51, 153)');
});

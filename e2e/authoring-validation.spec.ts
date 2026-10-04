import { expect, test, type Page } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

function bodyRule(page: Page) {
    return page.locator('.css-ruleset').filter({
        has: page.locator('.css-description', { hasText: /^body$/ })
    }).first();
}

test('ID and classes stay unchanged until both fields are corrected, then persist', async ({ page }) => {
    await createResumeFromTemplate(page);
    const entry = page.locator('#resume article.entry').first();
    await entry.evaluate(element => (element as HTMLElement).click());
    await page.getByRole('button', { name: 'Add ID/Classes' }).click();
    await page.getByLabel('ID', { exact: true }).fill('bad id#test');
    await page.getByLabel('Classes', { exact: true }).fill('a b#c');
    await expect(page.getByLabel('ID', { exact: true })).toHaveValue('bad id#test');
    await expect(page.locator('#html-id-adder [role="alert"]')).toHaveCount(2);
    await expect(page.getByTestId('html-id-save')).toBeDisabled();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByLabel('ID', { exact: true })).toBeFocused();
    await expect(page.getByLabel('ID', { exact: true })).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Classes', { exact: true })).toBeFocused();
    await expect(page.getByLabel('Classes', { exact: true })).toHaveCSS('outline-style', 'solid');
    await expect(entry).not.toHaveAttribute('id');
    await expect(entry).not.toHaveClass(/b#c/);
    await page.getByLabel('ID', { exact: true }).fill('experience-entry');
    await expect(page.getByTestId('html-id-save')).toBeDisabled();
    await page.getByLabel('Classes', { exact: true }).fill('featured muted');
    await page.getByTestId('html-id-save').click();
    await expect(entry).toHaveAttribute('id', 'experience-entry');
    await expect(entry).toHaveClass(/featured muted/);
    await page.getByRole('tab', { name: 'Tree', exact: true }).click();
    await expect(page.getByRole('tree')).toContainText('#experience-entry.featured.muted');
    await page.keyboard.press('Control+s');
    await expect(page.locator('.save-status')).toContainText('Saved v2');
    // The fresh-app helper clears storage on this page's navigations. A new tab
    // exercises persisted data without carrying that fixture reset script.
    const restored = await page.context().newPage();
    await restored.goto('/');
    await restored.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(restored.locator('#resume #experience-entry.featured.muted')).toBeVisible();
});

test('invalid CSS values cannot enter raw CSS, saved documents, or print output', async ({ page, context }) => {
    await context.addInitScript(() => { window.print = () => undefined; });
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    const rules = bodyRule(page);
    const fontSizeRow = rules.locator('tr.property').filter({
        has: page.locator('.property-key', { hasText: /^font-size$/ })
    });
    await fontSizeRow.locator('.property-value').click();
    const input = page.getByLabel('font-size value');
    const original = await input.inputValue();
    const originalComputed = await page.locator('#resume').evaluate(element => getComputedStyle(element).fontSize);
    for (const invalid of ['notacolor', '-5px']) {
        await input.fill(invalid);
        await input.press('Enter');
        await expect(input).toHaveValue(invalid);
        await expect(fontSizeRow.getByRole('alert')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
        await expect(page.locator('#resume')).toHaveCSS('font-size', originalComputed);
    }
    await input.press('Escape');
    const fontFamilyRow = rules.locator('tr.property').filter({
        has: page.locator('.property-key', { hasText: /^font-family$/ })
    });
    await fontFamilyRow.locator('.property-value').click();
    await page.getByLabel('font-family value').fill('red; } body { display:none');
    await page.getByLabel('font-family value').press('Enter');
    await expect(fontFamilyRow.getByRole('alert')).toBeVisible();
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await expect(page.getByRole('tabpanel')).not.toContainText('display:none');
    await expect(page.getByRole('tabpanel')).not.toContainText('notacolor');
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    await fontSizeRow.locator('.property-value').click();
    await expect(page.getByLabel('font-size value')).toHaveValue(original);
    await page.getByLabel('font-size value').fill('18px');
    await fontFamilyRow.locator('.property-value').click();
    await expect(page.locator('#resume')).toHaveCSS('font-size', '18px');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.locator('#resume')).toHaveCSS('font-size', originalComputed);
    await page.keyboard.press('Control+s');
    const restored = await context.newPage();
    await restored.goto('/');
    await restored.getByRole('button', { name: 'Open', exact: true }).click();
    await expect(restored.locator('#resume')).toBeVisible();
    const popupPromise = restored.waitForEvent('popup');
    await restored.keyboard.press('Control+p');
    const popup = await popupPromise;
    await expect(popup.locator('body')).toBeVisible();
    await expect(popup.locator('body')).toContainText('Randy Marsh');
    await expect(popup.locator('body')).toHaveCSS('font-size', originalComputed);
    expect(await popup.locator('style').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringContaining('display:none')]));
});

test('Unicode custom properties keep balanced opaque values through save and reload', async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    const rules = bodyRule(page);
    await rules.evaluate(element => (element as HTMLElement).click());
    await page.getByLabel('New property name value').fill('--色');
    await page.getByLabel('New property name value').press('Enter');
    const row = rules.locator('tr.property').filter({ has: page.locator('.property-key', { hasText: /^--色$/ }) });
    await row.locator('.property-value').click();
    await page.getByLabel('--色 value').fill('{ color: red; }');
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await expect(page.getByRole('tabpanel')).toContainText('--色: { color: red; };');
    await page.keyboard.press('Control+s');
    await expect(page.locator('.save-status')).toContainText('Saved v2');
    const restored = await page.context().newPage();
    await restored.goto('/');
    await restored.getByRole('button', { name: 'Open', exact: true }).click();
    await restored.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await expect(restored.getByRole('tabpanel')).toContainText('--色: { color: red; };');
});

test('clearing a CSS value removes the declaration and undo restores it', async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    const rules = bodyRule(page);
    const fontSizeRow = rules.locator('tr.property').filter({
        has: page.locator('.property-key', { hasText: /^font-size$/ })
    });
    await fontSizeRow.locator('.property-value').click();
    const input = page.getByLabel('font-size value');
    const original = await input.inputValue();

    for (const cleared of ['', '   ']) {
        await input.fill(cleared);
        await input.press('Enter');
        await expect(fontSizeRow).toHaveCount(0);
        await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
        await expect(page.getByRole('tabpanel')).not.toContainText('font-size: ;');
        await page.getByRole('button', { name: 'Undo', exact: true }).click();
        await page.getByRole('tab', { name: 'CSS', exact: true }).click();
        await expect(fontSizeRow).toContainText(original);
        await fontSizeRow.locator('.property-value').click();
    }
});

test('a new property is stored only after it receives a value', async ({ page }) => {
    await createResumeFromTemplate(page);
    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    const rules = bodyRule(page);
    await rules.evaluate(element => (element as HTMLElement).click());
    await page.getByLabel('New property name value').fill('outline-offset');
    await page.getByLabel('New property name value').press('Enter');
    const pending = page.getByLabel('outline-offset value');
    await expect(pending).toBeFocused();
    await pending.press('Escape');
    await expect(rules.locator('.property-key', { hasText: /^outline-offset$/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await expect(page.getByRole('tabpanel')).not.toContainText('outline-offset');

    await page.getByRole('tab', { name: 'CSS', exact: true }).click();
    await rules.evaluate(element => (element as HTMLElement).click());
    await page.getByLabel('New property name value').fill('outline-offset');
    await page.getByLabel('New property name value').press('Enter');
    await page.getByLabel('outline-offset value').fill('2px');
    await page.getByRole('tab', { name: 'Raw CSS', exact: true }).click();
    await expect(page.getByRole('tabpanel')).toContainText('outline-offset: 2px;');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.getByRole('tabpanel')).not.toContainText('outline-offset');
});

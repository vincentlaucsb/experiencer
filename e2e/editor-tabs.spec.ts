import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

for (const theme of ['Light', 'Dark'] as const) {
    test(`selected editor tabs retain their fill through mouse and keyboard interaction in ${theme.toLowerCase()} mode`, async ({ page }) => {
        await createResumeFromTemplate(page);
        await page.getByRole('button', { name: /^Theme:/ }).click();
        await page.getByRole('menuitem', { name: theme, exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme.toLowerCase());

        const tabs = page.getByRole('tablist', { name: 'Editor tabs' });
        const tree = tabs.getByRole('tab', { name: 'Tree', exact: true });
        const initialFill = await page.getByRole('tabpanel').evaluate(element => getComputedStyle(element).borderTopColor);
        await expect(tree).toHaveCSS('background-color', initialFill);
        const initialText = await tree.evaluate(element => getComputedStyle(element).color);
        expect(initialFill).not.toBe('rgba(0, 0, 0, 0)');

        for (const name of ['CSS', 'Raw CSS', 'Tree']) {
            const tab = tabs.getByRole('tab', { name, exact: true });
            await tab.click();
            await expect(tab).toHaveAttribute('aria-selected', 'true');
            await expect(tab).toBeFocused();
            await expect(tab).toHaveCSS('background-color', initialFill);
            await expect(tab).toHaveCSS('color', initialText);
            await page.mouse.move(0, 0);
            await expect(tab).toHaveCSS('background-color', initialFill);
        }

        await tree.press('ArrowRight');
        const css = tabs.getByRole('tab', { name: 'CSS', exact: true });
        await expect(css).toBeFocused();
        await expect(css).toHaveAttribute('aria-selected', 'true');
        await expect(css).toHaveCSS('background-color', initialFill);
        await expect(css).toHaveCSS('outline-style', 'solid');
        await expect(css).toHaveCSS('outline-width', '3px');
        await page.getByRole('tabpanel').focus();
        await css.hover();
        await expect(css).toHaveCSS('background-color', initialFill);
        await expect(css).toHaveCSS('color', initialText);
    });
}

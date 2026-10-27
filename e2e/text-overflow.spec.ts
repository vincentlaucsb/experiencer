import { expect, test } from '@playwright/test';
import { createResumeFromTemplate } from './helpers';

test('legacy content warns before printing, allows cancel/continue, and responds to CSS correction', async ({ page, context }) => {
    await context.addInitScript(() => { window.print = () => undefined; });
    await createResumeFromTemplate(page, 'Integrity');
    await page.evaluate(async () => {
        const { createResumeTemplates } = await import('/src/templates/ResumeTemplates.tsx');
        const { hydrateResumeData } = await import('/src/shared/stores/loadData.ts');
        const data = structuredClone(createResumeTemplates('August 10, 2026').Integrity);
        data.builtinCss.properties = data.builtinCss.properties.map(([key, value]: string[]) => [key, key === 'overflow-wrap' ? 'normal' : value]);
        const find = (nodes: any[], predicate: (node: any) => boolean): any => {
            for (const node of nodes) {
                if (predicate(node)) return node;
                const child = find(node.childNodes ?? [], predicate);
                if (child) return child;
            }
        };
        const main = find(data.childNodes, node => node.htmlId === 'main-column');
        find(main.childNodes, node => node.type === 'Markdown').value = 'X'.repeat(180);
        hydrateResumeData(data);
    });
    const warning = page.getByRole('status').filter({ hasText: 'Text extends past a column or page edge' });
    await expect(warning).toBeVisible();
    await page.keyboard.press('Control+p');
    const review = page.getByRole('dialog', { name: 'Text may be clipped in PDF', exact: true });
    await expect(review).toBeVisible();
    await review.getByRole('button', { name: 'Return to editor', exact: true }).click();
    await expect(review).toBeHidden();
    await page.keyboard.press('Control+p');
    const popup = page.waitForEvent('popup');
    await review.getByRole('button', { name: 'Continue printing', exact: true }).click();
    const printed = await popup;
    await expect(printed.locator('body')).toContainText('X'.repeat(180));
    await expect(printed.locator('body')).not.toContainText('Text extends past');
    await printed.close();
    await page.evaluate(async () => {
        const { cssStore } = await import('/src/shared/stores/cssStoreHooks.ts');
        cssStore.updateCss((css: any) => css.setProperties((properties: Map<string, string>) => new Map([...properties, ['overflow-wrap', 'anywhere']])));
    });
    await expect(warning).toBeHidden();
});

import { expect, test } from '@playwright/test';

for (const pageSize of ['letter', 'a4'] as const) {
    test(`default Assured prints two pages after a break before Projects on ${pageSize}`, async ({ page, context }, testInfo) => {
        await context.addInitScript(() => { window.print = () => undefined; });
        await page.goto('/');
        await page.getByRole('button', { name: 'New' }).click();
        await page.getByText('Assured', { exact: true }).click();
        await page.getByRole('button', { name: 'Use this Template' }).click();
        if (pageSize === 'a4') await page.getByRole('button', { name: 'A4', exact: true }).click();
        await page.locator('#resume').getByRole('heading', { name: 'Projects', exact: true }).click();
        await page.getByRole('button', { name: 'Page break before', exact: true }).click();
        await expect(page.locator('#resume .page-break-editing')).toHaveCount(1);
        await page.getByRole('button', { name: 'File', exact: true }).click();
        const opened = page.waitForEvent('popup');
        await page.getByRole('menuitem', { name: 'Print' }).click();
        const preview = await opened;
        await expect(preview.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
        const pdf = await preview.pdf({ preferCSSPageSize: true, printBackground: true });
        await testInfo.attach('assured-projects-print.pdf', { body: pdf, contentType: 'application/pdf' });
        expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(2);
        await preview.close();
    });

    test(`inserts a break before Education in its column, saves, undoes and prints on ${pageSize}`, async ({ page, context }, testInfo) => {
        await context.addInitScript(() => { window.print = () => undefined; });
        await page.goto('/');
        await page.getByRole('button', { name: 'New' }).click();
        await page.getByText('Integrity', { exact: true }).click();
        await page.getByRole('button', { name: 'Use this Template' }).click();
        await expect(page.locator('#resume')).toBeVisible();
        if (pageSize === 'a4') {
            await page.getByRole('button', { name: 'A4', exact: true }).click();
        }
        const education = page.locator('#resume #main-column > section').filter({ has: page.getByRole('heading', { name: 'Education', exact: true }) });
        await education.getByRole('heading', { name: 'Education', exact: true }).click();
        await page.getByRole('button', { name: 'Page break before', exact: true }).click();
        const marker = page.locator('#resume #main-column > .page-break-editing');
        await expect(marker).toHaveCount(1);
        await expect(page.locator('#resume > .page-break')).toHaveCount(0);
        await expect.poll(() => education.evaluate(element => {
            const resume = document.getElementById('resume')!;
            const height = resume.getBoundingClientRect().width * (resume.dataset.pageSize === 'a4' ? 297 / 210 : 11 / 8.5);
            return element.getBoundingClientRect().top - resume.getBoundingClientRect().top - height;
        })).toBeGreaterThanOrEqual(-2);
        await expect.poll(() => education.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(1800);
        await page.getByRole('button', { name: 'Undo', exact: true }).click();
        await expect(marker).toHaveCount(0);
        await page.getByRole('button', { name: 'Redo', exact: true }).click();
        await expect(marker).toHaveCount(1);
        await page.getByRole('button', { name: 'File', exact: true }).click();
        const popupPromise = page.waitForEvent('popup');
        await page.getByRole('menuitem', { name: 'Print' }).click();
        const preview = await popupPromise;
        await expect(preview.locator('#main-column > .page-break')).toHaveCount(1);
        await expect(preview.locator('.page-break-editing')).toHaveCount(0);
        const pdf = await preview.pdf({ preferCSSPageSize: true, printBackground: true });
        await testInfo.attach('column-page-break.pdf', { body: pdf, contentType: 'application/pdf' });
        expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(2);
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await expect(page.locator('.save-status')).toContainText('Saved v2');
        await page.reload();
        await page.locator('.resume-library-item').filter({ hasText: 'Integrity' })
            .getByRole('button', { name: 'Open', exact: true }).click();
        await expect(marker).toHaveCount(1);
    });
}

test('right-click breaks in sibling columns independently land on the same page edge', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New' }).click();
    await page.getByText('Integrity', { exact: true }).click();
    await page.getByRole('button', { name: 'Use this Template' }).click();
    for (const [column, section] of [['#main-column', 'Education'], ['#sidebar', 'Skills']]) {
        await page.locator(column).getByRole('heading', { name: section, exact: true }).click({ button: 'right' });
        await page.getByRole('menuitem', { name: 'Page break before', exact: true }).click();
    }
    await expect(page.locator('#resume .page-break-editing')).toHaveCount(2);
    await expect.poll(() => page.locator('#resume .page-break-editing').evaluateAll(elements => {
        const resume = document.getElementById('resume')!;
        const top = resume.getBoundingClientRect().top;
        const height = resume.getBoundingClientRect().width * 11 / 8.5;
        return Math.max(...elements.map(element => Math.abs(element.getBoundingClientRect().bottom - top - height)));
    })).toBeLessThan(2);
    await expect(page.locator('#resume')).toHaveCSS('min-height', '2112px');
});

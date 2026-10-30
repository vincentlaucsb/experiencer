import {expect, test} from '@playwright/test';

function fixture() {
    const column = () => ({type: 'Column', childNodes: [{type: 'Section', value: 'Synthetic flow', childNodes: [
        {type: 'Markdown', value: Array.from({length: 75}, (_, i) => `Synthetic paragraph ${i + 1}.`).join('\n\n')}
    ]}]});
    return {rootCss: {name: 'Root', selector: ':root', properties: [], children: []},
        builtinCss: {name: 'Document', selector: 'body', properties: [
            ['font-family', 'Arial, sans-serif'], ['font-size', '10pt'], ['line-height', '20px'],
            ['margin', '0'], ['padding', '0'], ['display', 'grid'], ['grid-template-columns', 'repeat(2, minmax(0, 1fr))']
        ], children: [
            {name: 'Columns', selector: '.column', properties: [['padding', '.5in']], children: []},
            {name: 'Second flow', selector: '.column-1', properties: [['padding-top', '0'], ['padding-bottom', '0']], children: []},
            {name: 'Text', selector: 'p, h2', properties: [['margin', '0'], ['font-size', '10pt'], ['line-height', '20px']], children: []}
        ]}, childNodes: [column(), column()]};
}

for (const size of ['letter', 'a4']) {
    test(`mounted ${size} PNG pagination preserves authored root IDs and one inset per mixed column`, async ({page}, testInfo) => {
        await page.goto('/');
        const data = fixture();
        (data.childNodes[0] as object as {htmlId: string}).htmlId = 'root';
        (data.childNodes[1] as object as {uuid: string}).uuid = 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB';
        (data.childNodes[1].childNodes[0] as object as {uuid: string}).uuid = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA';
        const result = await page.evaluate(async ({data, size}) => {
            const preparationUrl = '/src/shared/resumeDocument/prepareResumeDocument.ts';
            const mountingUrl = '/src/shared/resumeDocument/mountResumeDocument.tsx';
            const preparation = await import(preparationUrl), mounting = await import(mountingUrl);
            const mounted = await mounting.mountResumeDocument(preparation.prepareResumeDocument(
                preparation.createResumeDocumentSource(data, 'Mounted pagination regression', size), 'png'));
            (window as unknown as {mounted: typeof mounted}).mounted = mounted;
            const doc = mounted.document, view = doc.defaultView!;
            const height = size === 'a4' ? 297 * 96 / 25.4 : 1056;
            mounted.iframe.style.left = '0'; mounted.iframe.style.top = '0';
            mounted.iframe.style.height = `${doc.documentElement.scrollHeight}px`;
            return {bodyTop: view.getComputedStyle(doc.body).paddingTop,
                rootVisible: view.getComputedStyle(doc.querySelector('#root')!).display !== 'none',
                uppercaseMargin: view.getComputedStyle(doc.querySelector('[data-uuid="AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA"]')!).marginTop,
                continuationTops: [...doc.querySelectorAll('.column')].map(column => {
                    const tops = [...column.querySelectorAll('p')].flatMap(element => {
                        const range = doc.createRange(); range.selectNodeContents(element);
                        return [...range.getClientRects()].map(rect => rect.top);
                    }).filter(top => top >= height);
                    return Math.min(...tops) - height;
                })};
        }, {data, size});
        try {
            expect(result.bodyTop).toBe('0px');
            expect(result.rootVisible).toBe(true);
            expect(Number.parseFloat(result.uppercaseMargin)).toBe(-48);
            for (const top of result.continuationTops) {
                expect(top).toBeGreaterThan(45); expect(top).toBeLessThan(70);
            }
            await testInfo.attach('mounted-png.png', {body: await page.locator('iframe[title="Mounted pagination regression"]').screenshot(), contentType: 'image/png'});
        } finally {await page.evaluate(() => (window as unknown as {mounted: {dispose(): void}}).mounted.dispose());}
        await expect(page.locator('iframe[title="Mounted pagination regression"]')).toHaveCount(0);
    });

    test(`ordinary ${size} print popup repeats geometry without explicit breaks`, async ({page}) => {
        await page.goto('/');
        const data = fixture();
        data.builtinCss.properties.find(([key]) => key === 'padding')![1] = '.5in';
        data.builtinCss.children = [];
        data.childNodes = [data.childNodes[0]];
        const opened = page.waitForEvent('popup');
        const printing = page.evaluate(async ({data, size}) => {
            const sourceUrl = '/src/shared/resumeDocument/prepareResumeDocument.ts';
            const printUrl = '/src/shared/utils/PrintHelpers.ts';
            const {createResumeDocumentSource} = await import(sourceUrl);
            await (await import(printUrl)).printResume(createResumeDocumentSource(data, 'Synthetic print', size));
        }, {data, size});
        const popup = await opened;
        await printing;
        // Chromium's native PDF has one /Page object per physical sheet, independent of screen height.
        const pages = (await popup.pdf({preferCSSPageSize: true})).toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
        expect(pages.length).toBeGreaterThanOrEqual(2);
        expect(pages.length).toBeLessThanOrEqual(4);
        expect(await popup.locator('style').allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining('box-decoration-break: clone')]));
        await popup.close();
    });
}

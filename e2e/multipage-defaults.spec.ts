import {expect, test} from '@playwright/test';

function fixture() {
    const column = () => ({type: 'Column', childNodes: [{type: 'Section', value: 'Synthetic flow', childNodes: [
        {type: 'Markdown', value: Array.from({length: 75}, (_, i) => `Synthetic paragraph ${i + 1}.`).join('\n\n')}
    ]}]});
    return {rootCss: {name: 'Root', selector: ':root', properties: [['display', 'flex !important'], ['--resume-page-layout', 'flow']], children: []},
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
        data.rootCss.properties.push(['padding', '1in !important'], ['margin', '.25in !important']);
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
        await popup.emulateMedia({media: 'print'});
        const rootGeometry = await popup.evaluate(() => ({
            padding: getComputedStyle(document.documentElement).padding,
            margin: getComputedStyle(document.documentElement).margin,
            left: document.querySelector('h2')!.getBoundingClientRect().left
        }));
        expect(rootGeometry).toEqual({padding: '0px', margin: '0px', left: 48});
        // Chromium's native PDF has one /Page object per physical sheet, independent of screen height.
        const pages = (await popup.pdf({preferCSSPageSize: true})).toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
        expect(pages.length).toBeGreaterThanOrEqual(2);
        expect(pages.length).toBeLessThanOrEqual(4);
        expect(await popup.locator('style').allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining('box-decoration-break: clone')]));
        await popup.close();
    });
}
for (const type of ['Row', 'Grid']) {
    test(`${type} authored contact spacing survives native pagination without duplicated ancestor insets`, async ({page}) => {
        await page.goto('/');
        const results = await page.evaluate(async type => {
            const {createResumeDocumentSource, prepareResumeDocument} = await import('/src/shared/resumeDocument/prepareResumeDocument.ts');
            const {mountResumeDocument} = await import('/src/shared/resumeDocument/mountResumeDocument.tsx');
            const {installResumePagination} = await import('/src/shared/resumeDocument/resumePagination.ts');
            const results = [];
            for (const mode of ['margin', 'padding', 'both']) for (const optOut of [false, true]) {
                const data = {rootCss: {name: 'Root', selector: ':root', properties: optOut ? [['--resume-page-inset', '0']] : [], children: []},
                    builtinCss: {name: 'Body', selector: 'body', properties: [['margin', '0'], ['padding', '0'], ['font-size', '16px'], ['line-height', '20px']], children: [
                        {name: 'Contact flow', selector: '#contact-flow', properties: [['margin', mode === 'padding' ? '0' : '.2in 0'], ['padding', mode === 'margin' ? '0' : '.2in']], children: []},
                        {name: 'Paragraph', selector: 'p', properties: [['margin', '0']], children: []}
                    ]}, childNodes: [{type, htmlId: 'contact-flow', childNodes: [
                        {type: 'Link', value: 'Synthetic contact', url: 'https://contact.example'}, {type: 'Markdown', value: 'Synthetic text'}
                    ]}]};
                const mounted = await mountResumeDocument(prepareResumeDocument(createResumeDocumentSource(data, 'Contact geometry', 'letter'), 'print'));
                try {
                    const doc = mounted.document, flow = doc.querySelector('#contact-flow')!;
                    const read = () => ({height: flow.getBoundingClientRect().height,
                        textTops: [...flow.querySelectorAll('a, p')].map(element => {
                            const range = doc.createRange(); range.selectNodeContents(element);
                            return [...range.getClientRects()][0].top;
                        })});
                    const before = read(); installResumePagination(doc.body, 'letter'); results.push({mode, optOut, before, after: read()});
                } finally {mounted.dispose();}
            }
            return results;
        }, type);
        for (const item of results) {
            expect(item.after.height, item.mode).toBe(item.before.height);
            expect(item.after.textTops.map(top => top - (item.optOut ? 0 : 48)), item.mode).toEqual(item.before.textTops);
        }
    });
}


test('physical canvas owns paper bounds for block BODY and important root height limits', async ({page}) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
        const {createResumeDocumentSource, prepareResumeDocument} = await import('/src/shared/resumeDocument/prepareResumeDocument.ts');
        const {mountResumeDocument} = await import('/src/shared/resumeDocument/mountResumeDocument.tsx');
        const {getResumePhysicalCanvas} = await import('/src/shared/resumeDocument/resumePagination.ts');
        const data = {rootCss: {name: 'Root', selector: ':root', properties: [['height', '100px !important'], ['max-height', '100px !important']], children: []},
            builtinCss: {name: 'Body', selector: 'body', properties: [['margin', '0'], ['padding', '.5in'], ['font', '16px/20px Arial']], children: [
                {name: 'Paragraph', selector: 'p', properties: [['margin', '0']], children: []}
            ]}, childNodes: [{type: 'Markdown', value: 'First physical page.'}, {type: 'PageBreak'}, {type: 'Markdown', value: 'Last physical page.'}]};
        const mounted = await mountResumeDocument(prepareResumeDocument(createResumeDocumentSource(data, 'Physical canvas'), 'render-service'));
        try {
            const doc = mounted.document;
            const canvas = getResumePhysicalCanvas(doc.body)!;
            const textTops = [...doc.querySelectorAll('p')].map(element => {
                const range = doc.createRange(); range.selectNodeContents(element); return range.getBoundingClientRect().top;
            });
            return {width: canvas.width, height: canvas.height, pages: canvas.pageCount, textTops};
        } finally {mounted.dispose();}
    });
    expect(result.width).toBe(816);
    expect(result.height).toBe(2112);
    expect(result.pages).toBe(2);
    expect(result.textTops[0]).toBeGreaterThanOrEqual(48);
    expect(result.textTops[1]).toBeGreaterThanOrEqual(1104);
});

for (const size of ['letter', 'a4']) for (const mode of ['overflow', 'short', 'trailing-break']) {
    test(`physical ${size} ${mode} canvas is independent of tall viewports`, async ({page}) => {
        await page.goto('/');
        const result = await page.evaluate(async ({size, mode}) => {
            const {createResumeDocumentSource, prepareResumeDocument} = await import('/src/shared/resumeDocument/prepareResumeDocument.ts');
            const {mountResumeDocument} = await import('/src/shared/resumeDocument/mountResumeDocument.tsx');
            const {getResumePhysicalCanvas} = await import('/src/shared/resumeDocument/resumePagination.ts');
            const {captureResumePng} = await import('/src/shared/utils/ExportPng.ts');
            const height = size === 'a4' ? 297 * 96 / 25.4 : 1056;
            const bottom = mode === 'overflow' ? (size === 'a4' ? height - 68 : 989) : 48;
            const data = {rootCss: {name: 'Root', selector: ':root', properties: [], children: []},
                builtinCss: {name: 'Body', selector: 'body', properties: [
                    ['padding', `48px 48px ${bottom}px`], ['margin', '0'], ['font', '16px/20px Arial']
                ], children: [{name: 'Text', selector: 'p', properties: [['margin', '0']], children: []}]},
                childNodes: [{type: 'Markdown', value: 'Physical overflow marker'}, ...(mode === 'trailing-break' ? [{type: 'PageBreak'}] : [])]};
            const source = createResumeDocumentSource(data, 'Physical canvas rounding', size);
            const mounted = await mountResumeDocument(prepareResumeDocument(source, 'png'));
            let canvas;
            try {
                mounted.iframe.style.height = '1800px';
                await new Promise(resolve => requestAnimationFrame(resolve));
                canvas = getResumePhysicalCanvas(mounted.document.body);
            }
            finally {mounted.dispose();}
            const bitmap = await createImageBitmap(await captureResumePng(source));
            const png = {width: bitmap.width, height: bitmap.height}; bitmap.close();
            return {canvas, png};
        }, {size, mode});
        const pages = size === 'letter' && mode === 'overflow' ? 2 : 1;
        expect(result.canvas!.pageCount).toBe(pages);
        expect(result.png.height).toBe(Math.ceil(pages * (size === 'a4' ? 297 * 96 / 25.4 : 1056)) * 6);
        expect(result.png.width).toBe(Math.ceil(size === 'a4' ? 210 * 96 / 25.4 : 816) * 6);
    });
}

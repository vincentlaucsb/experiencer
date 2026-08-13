import { buildHtmlExportPackage } from '@/shared/utils/HtmlExportPackage';

describe('buildHtmlExportPackage', () => {
    test('packages selected built-in font assets and their license', async () => {
        const fetchAsset = jest.fn(async (input: string | URL | Request) => {
            const url = String(input);
            if (url.endsWith('/licenses/source-sans-3.txt')) {
                return response('OFL license', 'text/plain');
            }
            return response(new Uint8Array([1, 2, 3]), 'font/woff2');
        }) as unknown as typeof fetch;

        const archive = await buildHtmlExportPackage({
            stylesheet: 'body { font-family: "Source Sans 3", sans-serif; }',
            resumeHtml: '<main id="resume">Casey Kanban</main>',
            documentFonts: [{ provider: 'builtin', family: 'Source Sans 3' }],
            baseUrl: 'https://app.example/editor',
            fetchAsset
        });
        const entries = await readStoredEntries(archive);
        const html = new TextDecoder().decode(entries.get('resume.html'));

        expect([...entries.keys()].filter((name) => name.endsWith('.woff2'))).toHaveLength(4);
        expect(entries.has('fonts/licenses/source-sans-3.txt')).toBe(true);
        expect(html).toContain('url("./fonts/source-sans-3-source-sans-3-');
        expect(html).not.toContain('url(/fonts/builtin/');
        expect(html).not.toContain('fonts.googleapis.com');
    });

    test('packages selected Google Font files instead of retaining a remote stylesheet', async () => {
        const fetchAsset = jest.fn(async (input: string | URL | Request) => {
            const url = String(input);
            if (url.startsWith('https://fonts.googleapis.com/')) {
                return response('@font-face { font-family: Test; src: url(https://fonts.gstatic.com/test.woff2) format("woff2"); }', 'text/css');
            }
            return response(new Uint8Array([4, 5, 6]), 'font/woff2');
        }) as unknown as typeof fetch;

        const archive = await buildHtmlExportPackage({
            stylesheet: 'body { font-family: Test, sans-serif; }',
            resumeHtml: '<main id="resume">Resume</main>',
            documentFonts: [{ provider: 'google', family: 'Test' }],
            baseUrl: 'https://app.example/editor',
            fetchAsset
        });
        const entries = await readStoredEntries(archive);
        const html = new TextDecoder().decode(entries.get('resume.html'));

        expect(entries.has('fonts/google-font-test.woff2')).toBe(true);
        expect(entries.has('fonts/GOOGLE-FONTS-NOTICE.txt')).toBe(true);
        expect(html).toContain('url("./fonts/google-font-test.woff2")');
        expect(html).not.toContain('<link href="https://fonts.googleapis.com');
    });
});

function response(data: string | Uint8Array, contentType: string) {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    return {
        ok: true,
        status: 200,
        headers: { get: () => contentType },
        arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        text: async () => new TextDecoder().decode(bytes)
    } as unknown as Response;
}

async function readStoredEntries(blob: Blob): Promise<Map<string, Uint8Array>> {
    const bytes = new Uint8Array(await readBlob(blob));
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const entries = new Map<string, Uint8Array>();
    let offset = 0;
    while (view.getUint32(offset, true) === 0x04034b50) {
        const size = view.getUint32(offset + 18, true);
        const nameLength = view.getUint16(offset + 26, true);
        const extraLength = view.getUint16(offset + 28, true);
        const dataOffset = offset + 30 + nameLength + extraLength;
        const name = new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + nameLength));
        entries.set(name, bytes.slice(dataOffset, dataOffset + size));
        offset = dataOffset + size;
    }
    return entries;
}

function readBlob(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as ArrayBuffer), { once: true });
        reader.addEventListener('error', () => reject(reader.error), { once: true });
        reader.readAsArrayBuffer(blob);
    });
}

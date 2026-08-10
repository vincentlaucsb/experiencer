import { createZipArchive } from '@/shared/utils/zipArchive';

describe('createZipArchive', () => {
    test('writes readable stored entries with UTF-8 names', async () => {
        const archive = await createZipArchive([
            { name: 'resume.html', data: '<p>Résumé</p>' },
            { name: 'fonts/sample.woff2', data: new Uint8Array([1, 2, 3]) }
        ]);
        const bytes = new Uint8Array(await readBlob(archive));
        const names = readLocalEntryNames(bytes);

        expect(archive.type).toBe('application/zip');
        expect(names).toEqual(['resume.html', 'fonts/sample.woff2']);
        expect(new DataView(bytes.buffer).getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    });

    test('rejects traversal entry names', async () => {
        await expect(createZipArchive([{ name: '../resume.html', data: '' }]))
            .rejects.toThrow('Invalid ZIP entry name');
    });
});

function readBlob(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result as ArrayBuffer), { once: true });
        reader.addEventListener('error', () => reject(reader.error), { once: true });
        reader.readAsArrayBuffer(blob);
    });
}

function readLocalEntryNames(bytes: Uint8Array): string[] {
    const names: string[] = [];
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;
    while (view.getUint32(offset, true) === 0x04034b50) {
        const size = view.getUint32(offset + 18, true);
        const nameLength = view.getUint16(offset + 26, true);
        const extraLength = view.getUint16(offset + 28, true);
        names.push(new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + nameLength)));
        offset += 30 + nameLength + extraLength + size;
    }
    return names;
}

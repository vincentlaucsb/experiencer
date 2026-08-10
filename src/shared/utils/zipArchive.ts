export interface ZipArchiveEntry {
    name: string;
    data: string | Blob | ArrayBuffer | Uint8Array;
}

const UTF8_FLAG = 0x0800;
const STORED_METHOD = 0;

/** Creates a dependency-free ZIP archive using uncompressed entries. */
export async function createZipArchive(entries: ZipArchiveEntry[]): Promise<Blob> {
    const encodedEntries = await Promise.all(entries.map(async (entry) => ({
        name: new TextEncoder().encode(normalizeEntryName(entry.name)),
        data: await toBytes(entry.data)
    })));
    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let localOffset = 0;

    for (const entry of encodedEntries) {
        const checksum = crc32(entry.data);
        const localHeader = new Uint8Array(30 + entry.name.length);
        const localView = new DataView(localHeader.buffer);
        localView.setUint32(0, 0x04034b50, true);
        localView.setUint16(4, 20, true);
        localView.setUint16(6, UTF8_FLAG, true);
        localView.setUint16(8, STORED_METHOD, true);
        localView.setUint32(14, checksum, true);
        localView.setUint32(18, entry.data.length, true);
        localView.setUint32(22, entry.data.length, true);
        localView.setUint16(26, entry.name.length, true);
        localHeader.set(entry.name, 30);
        localParts.push(localHeader, entry.data);

        const centralHeader = new Uint8Array(46 + entry.name.length);
        const centralView = new DataView(centralHeader.buffer);
        centralView.setUint32(0, 0x02014b50, true);
        centralView.setUint16(4, 20, true);
        centralView.setUint16(6, 20, true);
        centralView.setUint16(8, UTF8_FLAG, true);
        centralView.setUint16(10, STORED_METHOD, true);
        centralView.setUint32(16, checksum, true);
        centralView.setUint32(20, entry.data.length, true);
        centralView.setUint32(24, entry.data.length, true);
        centralView.setUint16(28, entry.name.length, true);
        centralView.setUint32(42, localOffset, true);
        centralHeader.set(entry.name, 46);
        centralParts.push(centralHeader);

        localOffset += localHeader.length + entry.data.length;
    }

    const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, encodedEntries.length, true);
    endView.setUint16(10, encodedEntries.length, true);
    endView.setUint32(12, centralSize, true);
    endView.setUint32(16, localOffset, true);

    const blobParts = [...localParts, ...centralParts, end]
        .map((part) => part.slice().buffer as ArrayBuffer);
    return new Blob(blobParts, { type: 'application/zip' });
}

function normalizeEntryName(name: string): string {
    const normalized = name.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized || normalized.split('/').includes('..')) {
        throw new Error(`Invalid ZIP entry name: ${name}`);
    }
    return normalized;
}

async function toBytes(data: ZipArchiveEntry['data']): Promise<Uint8Array> {
    if (typeof data === 'string') return new TextEncoder().encode(data);
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    return new Uint8Array(await data.arrayBuffer());
}

function crc32(data: Uint8Array): number {
    let checksum = 0xffffffff;
    for (const byte of data) {
        checksum ^= byte;
        for (let bit = 0; bit < 8; bit += 1) {
            checksum = (checksum >>> 1) ^ (0xedb88320 & -(checksum & 1));
        }
    }
    return (checksum ^ 0xffffffff) >>> 0;
}

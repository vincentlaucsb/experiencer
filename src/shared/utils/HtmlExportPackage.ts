import generateHtml from '@/editor/GenerateHtml';
import {
    getBuiltinFont,
    getGoogleFontRequests
} from '@/shared/fonts/builtinFonts';
import {
    extractFontFamiliesFromCss,
    getGoogleFontsUrl,
    type GoogleFontRequest
} from '@/shared/utils/fonts';
import { createZipArchive, type ZipArchiveEntry } from '@/shared/utils/zipArchive';
import type { ResumeFont } from '@/types';

interface HtmlExportPackageOptions {
    stylesheet: string;
    resumeHtml: string;
    documentFonts?: ResumeFont[];
    baseUrl?: string;
    fetchAsset?: typeof fetch;
}

interface FontBundle {
    stylesheet: string;
    entries: ZipArchiveEntry[];
}

/** Builds an offline HTML package whose font files travel with the résumé. */
export async function buildHtmlExportPackage(
    options: HtmlExportPackageOptions
): Promise<Blob> {
    const fontRequests = resolveFontRequests(options.stylesheet, options.documentFonts);
    const bundle = await bundleFontAssets(
        fontRequests,
        options.baseUrl ?? window.location.href,
        options.fetchAsset ?? fetch
    );
    const html = generateHtml(
        options.stylesheet,
        options.resumeHtml,
        fontRequests,
        bundle.stylesheet
    );

    return createZipArchive([
        { name: 'resume.html', data: html },
        ...bundle.entries
    ]);
}

function resolveFontRequests(
    stylesheet: string,
    documentFonts: ResumeFont[] | undefined
): GoogleFontRequest[] {
    if (documentFonts) return documentFonts;
    return extractFontFamiliesFromCss(stylesheet).map((family) => {
        const builtin = getBuiltinFont(family);
        return builtin ?? family;
    });
}

async function bundleFontAssets(
    fontRequests: GoogleFontRequest[],
    baseUrl: string,
    fetchAsset: typeof fetch
): Promise<FontBundle> {
    const entries: ZipArchiveEntry[] = [];
    const archivedUrls = new Map<string, string>();
    const usedNames = new Set<string>();
    const stylesheets: string[] = [];

    const archiveCssAssets = async (css: string, cssBaseUrl: string, prefix: string) => {
        const replacements = new Map<string, string>();
        const urls = Array.from(css.matchAll(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g))
            .map((match) => match[2].trim())
            .filter((url) => !url.startsWith('data:'));

        for (const rawUrl of [...new Set(urls)]) {
            const absoluteUrl = new URL(rawUrl, cssBaseUrl).href;
            let archivePath = archivedUrls.get(absoluteUrl);
            if (!archivePath) {
                const response = await fetchAsset(absoluteUrl);
                if (!response.ok) {
                    throw new Error(`Could not include font asset (${response.status}).`);
                }
                archivePath = uniqueAssetPath(absoluteUrl, prefix, usedNames, response.headers.get('content-type'));
                archivedUrls.set(absoluteUrl, archivePath);
                entries.push({ name: archivePath, data: await response.arrayBuffer() });
            }
            replacements.set(rawUrl, `./${archivePath}`);
        }

        return css.replace(
            /url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g,
            (match, _quote: string, rawUrl: string) => {
                const replacement = replacements.get(rawUrl.trim());
                return replacement ? `url("${replacement}")` : match;
            }
        );
    };

    for (const request of fontRequests) {
        if (typeof request === 'string' || request.provider !== 'builtin') continue;
        const definition = getBuiltinFont(request.family);
        if (!definition) continue;
        const css = definition.faces.map((face) => face.css).join('\n');
        stylesheets.push(await archiveCssAssets(css, baseUrl, slug(request.family)));

        const licenseResponse = await fetchAsset(new URL(definition.licenseUrl, baseUrl).href);
        if (!licenseResponse.ok) {
            throw new Error(`Could not include the ${definition.family} font license.`);
        }
        entries.push({
            name: `fonts/licenses/${slug(definition.family)}.txt`,
            data: await licenseResponse.text()
        });
    }

    const googleRequests = getGoogleFontRequests(fontRequests);
    const googleFontsUrl = getGoogleFontsUrl(googleRequests);
    if (googleFontsUrl) {
        const response = await fetchAsset(googleFontsUrl);
        if (!response.ok) {
            throw new Error(`Could not download the selected Google Fonts (${response.status}).`);
        }
        stylesheets.push(await archiveCssAssets(await response.text(), googleFontsUrl, 'google-font'));
        entries.push({
            name: 'fonts/GOOGLE-FONTS-NOTICE.txt',
            data: [
                'The files in this directory were downloaded from Google Fonts for this export.',
                'Font licenses are published by Google with each family:',
                ...googleRequests.map((font) => {
                    const family = typeof font === 'string' ? font : font.family;
                    return `https://fonts.google.com/specimen/${encodeURIComponent(family).replace(/%20/g, '+')}/about`;
                })
            ].join('\n')
        });
    }

    return { stylesheet: stylesheets.join('\n'), entries };
}

function uniqueAssetPath(
    url: string,
    prefix: string,
    usedNames: Set<string>,
    contentType: string | null
): string {
    const pathname = new URL(url).pathname;
    const pathnameName = pathname.slice(pathname.lastIndexOf('/') + 1);
    const extension = pathnameName.match(/\.([a-z0-9]{2,5})$/i)?.[1]
        ?? extensionForContentType(contentType);
    const baseName = slug(pathnameName.replace(/\.[^.]+$/, '')) || prefix;
    let name = `${prefix}-${baseName}.${extension}`;
    let suffix = 2;
    while (usedNames.has(name)) {
        name = `${prefix}-${baseName}-${suffix}.${extension}`;
        suffix += 1;
    }
    usedNames.add(name);
    return `fonts/${name}`;
}

function extensionForContentType(contentType: string | null): string {
    if (contentType?.includes('woff2')) return 'woff2';
    if (contentType?.includes('woff')) return 'woff';
    if (contentType?.includes('truetype')) return 'ttf';
    return 'bin';
}

function slug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

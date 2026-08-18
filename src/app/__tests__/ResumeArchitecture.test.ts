import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const resumePath = path.join(__dirname, '..', 'Resume.tsx');
const sourceText = fs.readFileSync(resumePath, 'utf8');
const sourceFile = ts.createSourceFile(
    resumePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
);

const forbiddenHooks = new Set(['useState', 'useEffect', 'useMemo', 'useCallback']);
const forbiddenGlobals = new Set([
    'window',
    'document',
    'navigator',
    'fetch',
    'AbortController'
]);
const forbiddenApi = ['createObjectURL', 'revokeObjectURL', 'clipboard', 'download'];
const allowedImportPrefixes = [
    'react',
    '@/app/ResumeAppContainer',
    '@/app/ResumeAppContracts',
    '@/app/ResumeEditor',
    '@/app/ResumeLanding',
    '@/app/ResumeShell',
    '@/app/ResumeTemplateSelector',
    '@/types/',
    '@/assets/',
    '@/sass/'
];
const allowedExactImports = new Set([
    'react',
    '@/app/ResumeAppContainer',
    '@/app/ResumeAppContracts',
    '@/app/ResumeEditor',
    '@/app/ResumeLanding',
    '@/app/ResumeShell',
    '@/app/ResumeTemplateSelector',
    '@/types/PageSize'
]);

function isAllowedImport(specifier: string): boolean {
    if (
        specifier.endsWith('.css')
        || specifier.endsWith('.scss')
        || specifier === 'popright/styles.css'
        || specifier === 'popright/dropdown.css'
        || specifier === 'purecss/build/pure-min.css'
    ) {
        return true;
    }
    if (allowedExactImports.has(specifier)) return true;
    return allowedImportPrefixes.some((prefix) => specifier.startsWith(prefix));
}

function collect(node: ts.Node, identifiers: string[], imports: string[]) {
    if (ts.isIdentifier(node)) {
        identifiers.push(node.text);
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        imports.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, (child) => collect(child, identifiers, imports));
}

const identifiers: string[] = [];
const imports: string[] = [];
collect(sourceFile, identifiers, imports);

const nonblankLines = sourceText.split(/\r?\n/).filter((line) => line.trim().length > 0).length;

test('Resume.tsx stays a small composition facade', () => {
    expect(nonblankLines).toBeLessThanOrEqual(200);
});

test('Resume.tsx does not own React state or effects', () => {
    expect(identifiers.filter((name) => forbiddenHooks.has(name))).toEqual([]);
});

test('Resume.tsx does not own browser or async workflow APIs', () => {
    expect(identifiers.filter((name) => forbiddenGlobals.has(name))).toEqual([]);
    expect(sourceText).not.toMatch(/createObjectURL|revokeObjectURL|clipboard|AbortController/);
    for (const api of forbiddenApi) {
        expect(identifiers).not.toContain(api);
    }
});

test('Resume.tsx only imports the composition boundary', () => {
    expect(imports.filter((specifier) => !isAllowedImport(specifier))).toEqual([]);
});

test('Resume.tsx still exports the public OSS and Pro contract', async () => {
    const resumeModule = await import('@/app/Resume');
    expect(typeof resumeModule.Resume).toBe('function');
    expect(typeof resumeModule.default).toBe('function');
    expect(typeof resumeModule.resolveResumeAppExtensions).toBe('function');
    expect(typeof resumeModule.mergeResumeAppExtensions).toBe('function');
});

import { getCssClassesError, getHtmlIdError } from '../validateNodeCssNames';
import { getCssDeclarationError } from '../transformResumeStylesheet';

test.each(['experience-section', '_private', '--accent', 'éducation', '作品', ''])('accepts directly addressable ID %s', value => {
    expect(getHtmlIdError(value)).toBeUndefined();
});

test.each(['bad id#test', 'a.b', 'a:b', '[id]', '1start', '-', 'resume', 'a\\.b'])('rejects ambiguous or reserved ID %s', value => {
    expect(getHtmlIdError(value)).toBeTruthy();
});

test('validates class tokens individually and supports HTML class whitespace and removal', () => {
    expect(getCssClassesError(' featured\tmuted\n作品 ')).toBeUndefined();
    expect(getCssClassesError('')).toBeUndefined();
    expect(getCssClassesError('a b#c')).toBeTruthy();
    expect(getCssClassesError('a.b')).toBeTruthy();
});

test.each([
    ['font-size', 'notacolor'], ['font-size', '-5px'],
    ['font-family', 'red; } body { display:none'], ['color', 'red; display:none'],
    ['color', 'red;'], ['--accent', 'red; display:none'], ['color', 'red /*'],
    ['color; display', 'none'], ['content', '"unfinished'], ['unknown-property', 'red'],
    ['--theme', 'foo('], ['--theme', '[foo'], ['--theme', 'url(foo'],
    ['--theme', '"escaped\\"'], ['--theme', 'url(foo\\)'], ['color', 'red /*/'], ['--theme', 'red /*/'],
    ['--theme', 'red\\']
])('rejects invalid declaration %s: %s', (property, value) => {
    expect(getCssDeclarationError(property, value)).toBeTruthy();
});

test.each([
    ['color', 'red'], ['font-size', 'calc(1rem + 2px)'], ['font-family', '"Source Sans 3", sans-serif'],
    ['color', 'var(--accent, red)'], ['--accent', 'red'], ['content', '"; }"'],
    ['color', 'red !important'], ['margin', '-5px'], ['background-image', 'url("https://assets.example/a.svg")'],
    ['--色', 'red'], ['--éducation', '12px'], ['COLOR', 'red'],
    ['--theme', '{ color: red; }'],
    ['background-image', 'url(https://assets.example/a[.svg)'],
    ['background-image', 'url(https://assets.example/a].svg)'], ['--theme', 'red\\\\']
])('preserves legitimate declaration %s: %s', (property, value) => {
    expect(getCssDeclarationError(property, value)).toBeUndefined();
});

test('treats a blank value as removable rather than invalid', () => {
    expect(getCssDeclarationError('font-size', '')).toBeUndefined();
    expect(getCssDeclarationError('font-size', '   ')).toBeUndefined();
    expect(getCssDeclarationError('color; display', '')).toBeTruthy();
});

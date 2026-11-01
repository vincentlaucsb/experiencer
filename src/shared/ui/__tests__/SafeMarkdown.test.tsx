import { render } from '@testing-library/react';
import SafeMarkdown from '../SafeMarkdown';
import InlineMarkdown from '@/resume/helpers/InlineMarkdown';

test('renders HTML text formatting together with ordinary Markdown', () => {
    const { container } = render(<SafeMarkdown>{
        '**Bold** and <mark>highlighted</mark> with <u>underlined</u> text, <sub>subscript</sub>, '
        + '<sup>superscript</sup>, and a line<br>break.\n\n`<mark>literal</mark>`'
    }</SafeMarkdown>);
    expect(container.querySelector('strong')?.textContent).toBe('Bold');
    expect(container.querySelector('mark')?.textContent).toBe('highlighted');
    expect(container.querySelector('u')?.textContent).toBe('underlined');
    expect(container.querySelector('sub')?.textContent).toBe('subscript');
    expect(container.querySelector('sup')?.textContent).toBe('superscript');
    expect(container.querySelector('br')).not.toBeNull();
    expect(container.querySelector('code')?.textContent).toBe('<mark>literal</mark>');
});

test('inline fields share the HTML policy without paragraph wrappers', () => {
    const { container } = render(<h1><InlineMarkdown>{'<u>Role</u> at <mark>Example</mark>'}</InlineMarkdown></h1>);
    expect(container.querySelector('h1 > u')?.textContent).toBe('Role');
    expect(container.querySelector('h1 > mark')?.textContent).toBe('Example');
    expect(container.querySelector('p')).toBeNull();
});

test.each([
    '<script>alert(1)</script><mark>Kept</mark>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe><mark>Kept</mark>',
    '<svg><g onload="alert(1)"></g></svg><mark>Kept</mark>',
    '<math><mtext><img src=x onerror="alert(1)"></mtext></math><mark>Kept</mark>',
    '<style>body { display: none }</style><mark>Kept</mark>',
    '<form action="https://evil.example"><input autofocus onfocus="alert(1)"></form><mark>Kept</mark>',
])('removes active HTML: %s', source => {
    const { container } = render(<SafeMarkdown>{source}</SafeMarkdown>);
    expect(container.querySelector('script, iframe, svg, math, style, form, input, [onload], [onerror], [onfocus]')).toBeNull();
    expect(container.querySelector('mark')?.textContent).toBe('Kept');
});

test('preserves arbitrary classes while stripping styles, identifiers, and event handlers', () => {
    const { container } = render(<SafeMarkdown>{
        '<mark id="resume" name="location" class="custom-highlight 2xl:accent tone[gold]" style="position:fixed" onclick="alert(1)">Kept</mark>'
    }</SafeMarkdown>);
    expect(container.querySelector('mark')?.outerHTML).toBe('<mark class="custom-highlight 2xl:accent tone[gold]">Kept</mark>');
});

test('encodes class tokens so quotes cannot introduce event attributes', () => {
    const { container } = render(<SafeMarkdown>{'<mark class="custom&quot;onclick=alert(1)">Kept</mark>'}</SafeMarkdown>);
    expect(container.querySelector('mark')?.className).toBe('custom"onclick=alert(1)');
    expect(container.querySelector('[onclick]')).toBeNull();
});

test('preserves safe HTML table structure and alignment', () => {
    const { container } = render(<SafeMarkdown>{
        '<table><thead><tr><th>Skill</th></tr></thead><tbody><tr><td align="right">TypeScript</td></tr></tbody></table>'
    }</SafeMarkdown>);
    expect(container.querySelector('table thead th')?.textContent).toBe('Skill');
    expect((container.querySelector('table tbody td') as HTMLElement)?.style.textAlign).toBe('right');
});

test.each(['javascript:alert(1)', 'jav&#x61;script:alert(1)', 'data:text/html,attack', 'vbscript:msgbox(1)'])(
    'removes unsafe link and image protocols: %s', url => {
        const { container } = render(<SafeMarkdown>{`<a href="${url}">Link</a><img src="${url}" alt="Image">`}</SafeMarkdown>);
        expect(container.querySelector('a')?.getAttribute('href') || '').toBe('');
        expect(container.querySelector('img')?.getAttribute('src') || '').toBe('');
    }
);

test('preserves safe links, images, and code language metadata', () => {
    const { container } = render(<SafeMarkdown>{
        '<a href="https://example.com" title="Example">Web</a> <a href="mailto:hello@example.com">Email</a> '
        + '<img src="https://example.com/image.png" alt="Portrait">\n\n```ts\nconst value = 1;\n```'
    }</SafeMarkdown>);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.querySelector('a[title]')?.getAttribute('title')).toBe('Example');
    expect(container.querySelector('a[href^="mailto:"]')).not.toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(container.querySelector('code')?.className).toBe('language-ts');
});

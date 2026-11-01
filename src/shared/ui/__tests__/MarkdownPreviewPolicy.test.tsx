import { render } from '@testing-library/react';
import Markdown from 'react-markdown';
import rehypeAttrs from 'rehype-attr';
import { markdownPreviewPlugins } from '@/shared/utils/markdownPreviewPolicy';

test.each([
    '[Link](https://example.com)rehype:href=javascript:alert(1)',
    '[Link](https://example.com)rehype:style=color:red',
    '[Link](https://example.com)&lt;!--rehype:id=spoof--&gt;',
])('preview annotations cannot restore unsafe attributes: %s', source => {
    const plugins = markdownPreviewPlugins('rehype', [[rehypeAttrs, { properties: 'attr' }]]);
    const { container } = render(<Markdown rehypePlugins={plugins}>{source}</Markdown>);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.querySelector('a')?.hasAttribute('style')).toBe(false);
    expect(container.querySelector('a')?.hasAttribute('id')).toBe(false);
});

test('preview retains only passive checkboxes from authored input', () => {
    const plugins = markdownPreviewPlugins('rehype', []);
    const { container } = render(<Markdown rehypePlugins={plugins}>{
        '<input type="password" autofocus name="secret" onfocus="alert(1)" checked>'
    }</Markdown>);
    const input = container.querySelector('input')!;
    expect(input.type).toBe('checkbox');
    expect(input.disabled).toBe(true);
    expect(input.checked).toBe(true);
    expect(input.hasAttribute('name')).toBe(false);
    expect(input.hasAttribute('autofocus')).toBe(false);
    expect(input.hasAttribute('onfocus')).toBe(false);
});

import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize';
import type { PluggableList } from 'unified';

// HTML is document content, never application UI. Do not allow authored styles,
// IDs, active elements, or event handlers through this boundary. Classes are inert
// styling hooks and remain available to authored document CSS.
const markdownHtmlSchema: Options = {
    ...defaultSchema,
    tagNames: [
        'a', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'kbd', 'li', 'mark',
        'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u', 'ul',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    ],
    attributes: {
        '*': ['className'],
        a: ['href', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        ol: ['start'],
        th: ['align'],
        td: ['align'],
    },
};

// Parse before sanitizing. Display renderers stop here; the source editor may
// then add its trusted preview controls to this sanitized content.
export const markdownHtmlPlugins: PluggableList = [rehypeRaw, [rehypeSanitize, markdownHtmlSchema]];

// Preserve the source editor's GFM task-list preview as passive checkboxes. Force
// both properties so authored input cannot become an interactive application field.
export const markdownPreviewHtmlPlugins: PluggableList = [rehypeRaw, [rehypeSanitize, {
    ...markdownHtmlSchema,
    tagNames: [...markdownHtmlSchema.tagNames!, 'input'],
    attributes: { ...markdownHtmlSchema.attributes, input: ['checked'] },
    required: { ...markdownHtmlSchema.required, input: { type: 'checkbox', disabled: true } },
} satisfies Options]];

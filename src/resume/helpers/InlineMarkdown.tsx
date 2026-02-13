import Markdown from 'react-markdown';

/**
 * InlineMarkdown - Renders Markdown without wrapping content in block-level elements
 * 
 * Use this component when rendering Markdown inside inline contexts (headings, spans, etc.)
 * to prevent react-markdown from wrapping content in <p> tags, which breaks layout.
 * 
 * Supports HTML (e.g., <img>, <br>, <span>) for backwards compatibility with RichText.
 * Allows data URIs for embedded images (e.g., base64 encoded signatures).
 * 
 * See .claude/rules/component-development.md for full Markdown rendering guidelines.
 * 
 * @example
 * // Good - inline context
 * <h1><InlineMarkdown>**Bold** Title</InlineMarkdown></h1>
 * <span><InlineMarkdown>Some *italic* text</InlineMarkdown></span>
 * 
 * // Bad - would create invalid HTML
 * <h1><Markdown>**Bold** Title</Markdown></h1> // Renders: <h1><p>Bold Title</p></h1>
 */
export default function InlineMarkdown({ children }: { children: string }) {
    return (
        <Markdown 
            components={{ p: ({ children }) => <>{children}</> }}
        >
            {children}
        </Markdown>
    );
}

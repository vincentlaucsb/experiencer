import Markdown, { type Components } from 'react-markdown';
import { markdownHtmlPlugins } from '@/shared/utils/markdownHtmlPolicy';

export type { Components } from 'react-markdown';

/** Renders untrusted Markdown with the shared document-formatting HTML allowlist. */
export default function SafeMarkdown({ children, components }: { children: string; components?: Components }) {
    return <Markdown rehypePlugins={markdownHtmlPlugins} components={components}>{children}</Markdown>;
}

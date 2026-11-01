import rehypeAttrs from 'rehype-attr';
import type { PluggableList } from 'unified';
import { markdownPreviewHtmlPlugins } from './markdownHtmlPolicy';

/** Sanitizes authored content before the editor adds its trusted preview controls. */
export function markdownPreviewPlugins(kind: 'rehype' | 'remark', plugins: PluggableList): PluggableList {
    if (kind === 'remark') return plugins;
    // rehype-attr can turn ordinary text such as `rehype:href=javascript:...`
    // back into attributes after sanitization. It must never run on this content.
    const presentationPlugins = plugins.filter(plugin =>
        (Array.isArray(plugin) ? plugin[0] : plugin) !== rehypeAttrs
    );
    return [...markdownPreviewHtmlPlugins, ...presentationPlugins];
}

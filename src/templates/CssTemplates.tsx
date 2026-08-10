import CssNode from "@/shared/CssTree";
import Entry from "@/resume/Entry";
import Section from "@/resume/Section";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";
import PageBreak from "@/resume/PageBreak";

function getMarkdownCss(): CssNode {
    let markdownCss = new CssNode(MarkdownText.type, {}, '.text-content');

    let listCss = markdownCss.addNode('Lists', {
        'padding-left': 'var(--large-spacing)',
    }, 'ul, ol');

    listCss.addNode('List Item', { 'list-style-type': 'square' }, 'li');

    markdownCss.addNode('Paragraphs', {
        'margin': 'var(--small-spacing) 0'
    }, 'p');

    markdownCss.addNode('Headings', {
        'margin': 'var(--spacing) 0 var(--small-spacing) 0',
        'font-weight': 'bold'
    }, 'h1, h2, h3, h4, h5, h6');

    markdownCss.addNode('Code Blocks', {
        'background-color': '#f5f5f5',
        'padding': 'var(--spacing)',
        'margin': 'var(--spacing) 0',
        'border-radius': '4px'
    }, 'pre');

    markdownCss.addNode('Links', {
        'color': '#0066cc',
        'text-decoration': 'underline'
    }, 'a');

    return markdownCss;
}

function getSectionCss(): CssNode {
    let sectionCss = new CssNode(Section.type, {
        'margin-bottom': 'var(--large-spacing)'
    }, 'section');

    sectionCss.addNode('Title', {
        'font-family': 'var(--sans-serif)',
        'font-weight': 'bold',
        'font-size': '15pt',
        'text-transform': 'uppercase'
    }, '> h2');

    sectionCss.addNode('Content', {
        'margin-top': '8px',
        'margin-left': '8px',
        'padding-left': '16px',
        'padding-right': '8px',
        'border-left': '3px dotted #dddddd',
    }, '> div.content');

    return sectionCss;
}

function getEntryCss(): CssNode {
    let entryCss = new CssNode(Entry.type, {
        'display': 'block'
    }, '.entry');

    entryCss.addNode('Adjacent Entries', {
        'margin-top': 'var(--large-spacing)'
    }, '+ .entry');

    let entryTitleCss = entryCss.addNode('Title Block',
        { 'margin-bottom': 'var(--small-spacing)' }, '> hgroup');

    let entryTitleHeadingCss = entryTitleCss.addNode('Title', {
            'font-family': 'var(--serif)',
            'font-size': '13pt',
        }, '> h3');

    entryTitleHeadingCss.addNode('First Field', {
        'font-weight': 'bold'
    }, 'span.field-0');

    entryTitleHeadingCss.addNode('Middle Fields', {
        'font-weight': 'normal'
    }, 'span.field-middle');

    entryTitleHeadingCss.addNode('Last Field', {
        'font-weight': 'normal'
    }, 'span.field-last');

    let subtitleCss = entryTitleCss.addNode('Subtitle', {
        'display': 'flex',
        'flex-wrap': 'wrap',
        'font-weight': 'normal'
    }, '> h4');

    subtitleCss.addNode('First Field', { 'font-weight': 'bold' }, 'span.field-0');
    subtitleCss.addNode('Middle Fields', {}, 'span.field-middle');
    subtitleCss.addNode('Last Field', {}, 'span.field-last');

    return entryCss;
}

function getHeaderCss() {
    const headerCss = new CssNode('Header', {
        'margin-bottom': 'var(--large-spacing)'
    }, 'header');

    const titleGroup = headerCss.addNode('Title Group', {}, '> hgroup');
    titleGroup.addNode('Title', {
        'font-family': 'var(--serif)',
        'font-weight': 'normal'
    }, '> h1');
    titleGroup.addNode('Subtitle', { 'font-weight': 'normal' }, '> h2');

    return headerCss;
}

function getLinkCss(): CssNode {
    let linkCss = new CssNode(Link.type, {
        'color': '#0066cc',
        'text-decoration': 'underline'
    }, 'a');

    linkCss.addNode('Hover', {
        'color': '#004499',
        'text-decoration': 'none'
    }, ':hover');

    return linkCss;
}

function getPageBreakCss(): CssNode {
    const pageBreakCss = new CssNode('Page Break', {
        'display': 'block',
        'break-after': 'page',
        'page-break-after': 'always',
        'break-inside': 'avoid',
        'page-break-inside': 'avoid'
    }, '.page-break');

    return pageBreakCss;
}

/** Return the default CSS template */
export default function getDefaultCss(): CssNode {
    let defaultCss = new CssNode('Resume CSS', {
        'font-family': 'Merriweather, serif',
        'font-size': '10pt',
        'height': '100%',
        'padding': 'var(--edge-margin)',
    }, '#resume');

    defaultCss.addNode('All Elements', { 'margin': '0' }, '*');

    defaultCss.addNode('Image', {
        'max-width': '100%',
        'max-height': '100%',
        'object-fit': 'scale-down'
    }, 'img');

    let dlCss = defaultCss.addNode('Description List', { }, 'dl');
    dlCss.addNode('Definitions', { 'padding-left': '0.5rem' }, 'dd');

    defaultCss.addNode('Row', {}, '.row');
    defaultCss.addNode('Column', {}, '.column');
    defaultCss.addNode('Grid', {}, '.grid-container');
    defaultCss.addNode(getHeaderCss());
    defaultCss.addNode(getSectionCss());
    defaultCss.addNode(getEntryCss());
    defaultCss.addNode(getMarkdownCss());
    defaultCss.addNode(getLinkCss());
    defaultCss.addNode(getPageBreakCss());
    return defaultCss;
}

export function getRootCss(): CssNode {
    return new CssNode(':root', {
        '--serif': 'Merriweather, serif',
        '--sans-serif': 'Open Sans, sans-serif',
        '--monospace': 'Source Code Pro, monospace',
        '--edge-margin': '0.5in',
        '--small-spacing': '4px',
        '--spacing': '8px',
        '--large-spacing': '16px',
        '--x-large-spacing': '32px',
        '--xx-large-spacing': '48px'
    });
}

import CssNode from "@/shared/CssTree";
import Entry from "@/resume/Entry";
import Section from "@/resume/Section";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";

function getMarkdownCss(): CssNode {
    let markdownCss = new CssNode(MarkdownText.type, {}, '.text-content');

    let listCss = markdownCss.add('Lists', {
        'padding-left': 'var(--large-spacing)',
    }, 'ul, ol');

    listCss.add('List Item', { 'list-style-type': 'square' }, 'li');

    markdownCss.add('Paragraphs', {
        'margin': 'var(--small-spacing) 0'
    }, 'p');

    markdownCss.add('Headings', {
        'margin': 'var(--spacing) 0 var(--small-spacing) 0',
        'font-weight': 'bold'
    }, 'h1, h2, h3, h4, h5, h6');

    markdownCss.add('Code Blocks', {
        'background-color': '#f5f5f5',
        'padding': 'var(--spacing)',
        'margin': 'var(--spacing) 0',
        'border-radius': '4px'
    }, 'pre');

    markdownCss.add('Links', {
        'color': '#0066cc',
        'text-decoration': 'underline'
    }, 'a');

    return markdownCss;
}

function getSectionCss(): CssNode {
    let sectionCss = new CssNode(Section.type, {
        'margin-bottom': 'var(--large-spacing)'
    }, 'section');

    sectionCss.add('Title', {
        'font-family': 'var(--sans-serif)',
        'font-weight': 'bold',
        'font-size': '15pt',
        'text-transform': 'uppercase'
    }, '> h2');

    sectionCss.add('Content', {
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
    }, 'resume-entry');

    entryCss.add('Adjacent Entries', {
        'margin-top': 'var(--large-spacing)'
    }, '+ resume-entry');

    let entryTitleCss = entryCss.add('Title Block',
        { 'margin-bottom': 'var(--small-spacing)' }, '> hgroup');

    let entryTitleHeadingCss = entryTitleCss.add('Title', {
            'font-family': 'var(--serif)',
            'font-size': '13pt',
        }, '> h3');

    entryTitleHeadingCss.add('First Field', {
        'font-weight': 'bold'
    }, 'span.field-0');

    entryTitleHeadingCss.add('Middle Fields', {
        'font-weight': 'normal'
    }, 'span.field-middle');

    entryTitleHeadingCss.add('Last Field', {
        'font-weight': 'normal'
    }, 'span.field-last');

    let subtitleCss = entryTitleCss.add('Subtitle', {
        'display': 'flex',
        'flex-wrap': 'wrap',
        'font-weight': 'normal'
    }, '> h4');

    subtitleCss.add('First Field', { 'font-weight': 'bold' }, 'span.field-0');
    subtitleCss.add('Middle Fields', {}, 'span.field-middle');
    subtitleCss.add('Last Field', {}, 'span.field-last');

    return entryCss;
}

function getHeaderCss() {
    const headerCss = new CssNode('Header', {
        'margin-bottom': 'var(--large-spacing)'
    }, 'header');

    const titleGroup = headerCss.add('Title Group', {}, '> hgroup');
    titleGroup.add('Title', {
        'font-family': 'var(--serif)',
        'font-weight': 'normal'
    }, '> h1');
    titleGroup.add('Subtitle', { 'font-weight': 'normal' }, '> h2');

    return headerCss;
}

function getLinkCss(): CssNode {
    let linkCss = new CssNode(Link.type, {
        'color': '#0066cc',
        'text-decoration': 'underline'
    }, 'a');

    linkCss.add('Hover', {
        'color': '#004499',
        'text-decoration': 'none'
    }, ':hover');

    return linkCss;
}

/** Return the default CSS template */
export default function getDefaultCss(): CssNode {
    let defaultCss = new CssNode('Resume CSS', {
        'font-family': 'Merriweather, serif',
        'font-size': '10pt',
        'height': '100%',
        'padding': 'var(--edge-margin)',
    }, '#resume');

    defaultCss.add('All Elements', { 'margin': '0' }, '*');

    defaultCss.add('Image', {
        'max-width': '100%',
        'max-height': '100%',
        'object-fit': 'scale-down'
    }, 'img');

    let dlCss = defaultCss.add('Description List', { }, 'dl');
    dlCss.add('Definitions', { 'padding-left': '0.5rem' }, 'dd');

    defaultCss.add('Row', {}, 'resume-row');
    defaultCss.add('Column', {}, 'resume-column');
    defaultCss.add('Grid', {}, 'resume-grid');
    defaultCss.addNode(getHeaderCss());
    defaultCss.addNode(getSectionCss());
    defaultCss.addNode(getEntryCss());
    defaultCss.addNode(getMarkdownCss());
    defaultCss.addNode(getLinkCss());
    return defaultCss;
}

export function getRootCss(): CssNode {
    return new CssNode(':root', {
        '--serif': 'Merriweather, serif',
        '--sans-serif': 'Open Sans, sans-serif',
        '--edge-margin': '0.5in',
        '--small-spacing': '4px',
        '--spacing': '8px',
        '--large-spacing': '16px',
        '--x-large-spacing': '32px',
        '--xx-large-spacing': '48px'
    });
}
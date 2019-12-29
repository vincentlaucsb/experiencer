import CssNode from "../utility/CssTree";
import Entry from "../Entry";
import Section from "../Section";
import RichText from "../RichText";

function getRichTextCss(): CssNode {
    let richTextCss = new CssNode(RichText.type, {}, '.rich-text');

    let listCss = richTextCss.add('Lists', {
        'padding-left': 'var(--large-spacing)'
    }, 'ul');

    listCss.add('List Item', { 'list-style-type': 'square' }, 'li');

    return richTextCss;
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
    let entryCss = new CssNode(Entry.type, {}, 'div.entry');

    entryCss.add('Adjacent Entries', {
        'margin-top': 'var(--large-spacing)'
    }, '+ div.entry');

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

    defaultCss.add('Link', { 'color': '#000000' }, 'a, a:hover');

    let dlCss = defaultCss.add('Description List', { }, 'dl');
    dlCss.add('Definitions', { 'padding-left': '0.5rem' }, 'dd');

    defaultCss.add('Row', {}, 'div.row');
    defaultCss.add('Column', {}, 'div.column');
    defaultCss.add('Grid', {}, 'div.grid-container');
    defaultCss.addNode(getHeaderCss());
    defaultCss.addNode(getSectionCss());
    defaultCss.addNode(getEntryCss());
    defaultCss.addNode(getRichTextCss());
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
        '--x-large-spacing': '32px'
    });
}
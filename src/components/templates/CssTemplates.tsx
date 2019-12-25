import CssNode from "../utility/CssTree";
import Entry from "../Entry";
import Section from "../Section";
import RichText from "../RichText";

function getRowCss(): CssNode {
    let rowCss = new CssNode('Row', {

    }, '.row');

    let columnCss = rowCss.add(new CssNode('Column', {

    }, '.column'));

    rowCss.add(new CssNode('First Column', {

    }, '.column-0'));

    rowCss.add(new CssNode('All Columns Except First', {
        'margin-left': '1em'
    }, '.column:not(.column-0)'));

    rowCss.add(new CssNode('Last Column', {

    }, '.column-last'));

    return rowCss;
}

function getRichTextCss(): CssNode {
    let richTextCss = new CssNode(RichText.type, {

    }, '.rich-text');

    let listCss = richTextCss.add(new CssNode('Lists', {
        'padding-left': 'var(--large-spacing)'
    }, 'ul'));

    listCss.add(new CssNode('List Item', {
        'list-style-type': 'square' /** Default: circle */
    }, 'li'));

    return richTextCss;
}

function getSectionCss(): CssNode {
    let sectionCss = new CssNode(Section.type, {
        'margin-bottom': 'var(--large-spacing)'
    }, 'section');

    sectionCss.add(new CssNode('Title', {
        'font-family': 'var(--sans-serif)',
        'font-weight': 'bold',
        'font-size': '15pt',
        'text-transform': 'uppercase'
    }, '> h2'));

    sectionCss.add(new CssNode(
        'Content', {
            'margin-top': '8px',
            'margin-left': '8px',
            'padding-left': '16px',
            'padding-right': '8px',
            'border-left': '3px dotted #dddddd',
        }, '> div.content'
    ));

    return sectionCss;
}

function getEntryCss(): CssNode {
    let entryCss = new CssNode(Entry.type,
        {
            'margin-bottom': 'var(--large-spacing)'
        }, 'div.entry');

    let entryTitleCss = entryCss.add(new CssNode('Title Block',
        {
            'margin-bottom': 'var(--small-spacing)'
        }, '> hgroup'));

    let entryTitleHeadingCss = entryTitleCss.add(
        new CssNode('Title', {
            'font-family': 'var(--serif)',
            'font-size': '13pt',
        }, '> h3'));

    entryTitleHeadingCss.add(new CssNode('First Title Field', {
        'font-weight': 'bold'
    }, 'span.field-0'));

    entryTitleHeadingCss.add(new CssNode('Other Title Fields', {
        'font-weight': 'normal'
    }, ':not(.field-0)'));

    let subtitleCss = entryTitleCss.add(new CssNode('Subtitle', {
        'display': 'flex',
        'flex-wrap': 'wrap',
        'font-weight': 'normal'
    }, '> h4'));

    subtitleCss.add(new CssNode('First Field', {
        'font-weight': 'bold'
    }, 'span.field-0'));

    subtitleCss.add(new CssNode('Middle Fields', {
    }, 'span.field-middle'));

    subtitleCss.add(new CssNode('Last Field', {
    }, 'span.field-last'));

    return entryCss;
}

function getHeaderCss() {
    const headerCss = new CssNode('Header', {
        'margin-bottom': 'var(--large-spacing)'
    }, 'header');

    const titleGroup = headerCss.add(new CssNode(
        'Title Group', {}, '> hgroup'));

    titleGroup.add(new CssNode('Title', {
        'font-family': 'var(--serif)',
        'font-weight': 'normal'
    }, '> h1'));

    const subtitleGroup = titleGroup.add(new CssNode('Subtitle', {
        'font-weight': 'normal'
    }, '> h2'));

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

    defaultCss.cssRoot = new CssNode(':root', {
        '--serif': 'Merriweather, serif',
        '--sans-serif': 'Open Sans, sans-serif',
        '--edge-margin': '0.5in',
        '--small-spacing': '4px',
        '--spacing': '8px',
        '--large-spacing': '16px'
    }, ':root');

    defaultCss.add(new CssNode('All Resume Descendents', {
        'margin': '0'
    }, '*'));

    defaultCss.add(new CssNode('Image', {
        'max-width': '100%',
        'max-height': '100%',
        'object-fit': 'scale-down'
    }, 'img'));

    defaultCss.add(new CssNode('Link', {
        'color': '#000000'
    }, 'a, a:hover'));

    let dlCss = defaultCss.add(new CssNode('Description List', {
    }, 'dl'));

    dlCss.add(new CssNode('Definitions', {
        'padding-left': '0.5rem'
    }, 'dd'));

    /**
    let gridCss = defaultCss.add(new CssNode('Grid', {

    }, 'div.grid-container'));
    */

    defaultCss.add(getHeaderCss());
    defaultCss.add(getSectionCss());
    defaultCss.add(getEntryCss());
    defaultCss.add(getRichTextCss());
    defaultCss.add(getRowCss());
    return defaultCss;
}
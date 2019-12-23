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
        'padding-left': '1.5em' /** Reduced padding */
    }, 'ul'));

    listCss.add(new CssNode('List Item', {
        'list-style-type': 'square' /** Default: circle */
    }, 'li'));

    return richTextCss;
}

function getSectionCss(): CssNode {
    let sectionCss = new CssNode(Section.type, {
        'margin-bottom': '16px'
    }, 'section');

    sectionCss.add(new CssNode('Title', {
        'font-family': 'Verdana, sans-serif',
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
            'margin-bottom': '15px'
        }, 'div.entry');

    let entryTitleCss = entryCss.add(new CssNode('Title Block',
        {
            'margin-bottom': '4px'
        }, '> hgroup'));

    let entryTitleHeadingCss = entryTitleCss.add(
        new CssNode('Title', {
            'font-family': 'Merriweather, serif',
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
        'margin-bottom': '16px'
    }, 'header');

    const titleGroup = headerCss.add(new CssNode(
        'Title Group', {}, '> hgroup'));

    titleGroup.add(new CssNode('Title', {
        'font-family': 'Merriweather, serif',
        'font-weight': 'normal'
    }, '> h1'));

    const subtitleGroup = titleGroup.add(new CssNode('Subtitle', {
        'font-weight': 'normal'
    }, '> h2'));

    return headerCss;
}

/** Return the default CSS template */
export default function getDefaultCss() : CssNode {
    let defaultCss = new CssNode('Resume CSS', {
        'font-family': 'Merriweather, serif',
        'font-size': '10pt',
        'padding': '0.5in',
    }, '#resume');

    defaultCss.add(new CssNode('Links', {
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
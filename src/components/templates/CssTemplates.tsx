﻿import CssNode from "../utility/CssTree";
import Entry from "../Entry";
import Section from "../Section";

function getSectionCss(): CssNode {
    let sectionCss = new CssNode(Section.name, {
        'margin-bottom': '16px'
    }, 'section');

    sectionCss.add(new CssNode('Title', {
        'font-family': 'Verdana, sans-serif',
        'font-weight': 'bold',
        'font-size': '15pt',
        'text-transform': 'uppercase'
    }, 'h2'));

    sectionCss.add(new CssNode(
        'Contents', {
            'margin-top': '8px',
            'margin-left': '8px',
            'padding-left': '16px',
            'padding-right': '8px',
            'border-left': '3px dotted #dddddd',
        }, '.entry-content'
    ));

    return sectionCss;
}

function getEntryCss(): CssNode {
    let entryCss = new CssNode(Entry.name,
        {
            'margin-bottom': '15px'
        }, '.entry');

    let entryTitleCss = entryCss.add(new CssNode('Title Block',
        {
            'margin-bottom': '4px'
        }, '.entry-title'));

    let entryTitleHeadingCss = entryTitleCss.add(
        new CssNode('Title', {
        'font-size': '13pt',
    }, 'h3.title'));

    entryTitleHeadingCss.add(new CssNode('First Title Field', {
        'font-weight': 'bold'
    }, '.field-0'));

    entryTitleHeadingCss.add(new CssNode('Other Title Fields', {
        'font-weight': 'normal'
    }, ':not(.field-0)'));

    entryTitleHeadingCss.add(new CssNode('First Title Field (After)', {
        'content': "','",
        'padding-right': '0.33em'
    }, '.field-0::after'))

    let subtitleCss = entryTitleCss.add(new CssNode('Subtitle', {
        'font-family': 'Verdana, sans-serif',
    }, '.subtitle'));

    subtitleCss.add(new CssNode('Other Subtitle Fields', {
        'margin-left': '1em'
    }, '.field:not(.field-0)'));

    return entryCss;
}

/** Return the default CSS template */
export default function getDefaultCss() : CssNode {
    let defaultCss = new CssNode('Resume CSS', {
        'font-family': 'Georgia, serif',
        'font-size': '10pt',
        'padding': '0.5in',
    }, '#resume');

    defaultCss.add(new CssNode('Links', {
        'color': '#000000'
    }, 'a, a:hover'));

    let headerCss = defaultCss.add(new CssNode('Header', {
        'margin-bottom': '16px'
    }, 'header'));

    let listCss = defaultCss.add(new CssNode('Lists', {
        'padding-left': '1.5em' /** Reduced padding */
    }, 'ul'));

    listCss.add(new CssNode('List Item', {
        'list-style-type': 'square' /** Default: circle */
    }, 'li'));

    let dlCss = defaultCss.add(new CssNode('Description Lists', {
    }, 'dl'));

    dlCss.add(new CssNode('Definitions', {
        'padding-left': '0.5rem'
    }, 'dd'));

    defaultCss.add(getSectionCss());
    defaultCss.add(getEntryCss());
    return defaultCss;
}
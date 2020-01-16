import { BasicResumeNode } from "../utility/Types";
import { assuredHeader } from "./Assured";
import RichText from "../RichText";
import Divider from "../Divider";
import getDefaultCss from "./CssTemplates";
import CssNode from "../utility/CssTree";

const signature = `<img src="data:image/png;base64,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">`;

export function assuredCoverLetterNodes(): Array<BasicResumeNode> {
    let now = new Date();
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    let month = months[now.getMonth()];

    let date = `${month} ${now.getDate()}, ${now.getFullYear()}`;

    return [
        assuredHeader(),
        {
            type: Divider.type,
            htmlId: "content",
            childNodes: [
                {
                    type: RichText.type, 
                    value: date,
                    htmlId: "date"
                },
                {
                    type: RichText.type,
                    value: "Dear Hiring Manager,",
                    htmlId: "salutation"
                },
                {
                    type: RichText.type,
                    htmlId: "body",
                    value: `<p>What do you think of when you think of reliable? In 
an age of planned obsolescence, it's hard to find any good examples. 
</p>

<p>But I want to change that, which is why I am applying to this
position. My name is Joe Blow, and I'm a software engineering 
manager with a proven track record of delivering quality software that won't
crash and burn.
</p>

<p>As a team lead at Boeing, I oversaw a talented multi-national
group of engineers responsible for creating mission critical software for 
the 737 MAX 8 jet. As a result of our efforts, we were able to 
create a revolutionary new commercial airliner that still passed
stringent Federal Aviation Administration testing. It is a plane
that I would let my family fly on, especially my in-laws.
</p>

<p>I am committed to helping great companies like yours build great products.
I look forward to hearing from you soon.</p>`
                },
                {
                    type: RichText.type,
                    htmlId: "closing",
                    value: `<p>Sincerely,</p><p>${signature}<p>Joe Blow</p>`
                }
            ]
        }
    ];
}

export function assuredCoverLetterCss() {
    let css = getDefaultCss().setProperties([
        ["font-family", "var(--sans-serif)"],
        ["font-size", "11pt"]
    ]);

    /** Header */
    const header = css.mustFindNode("Header").setProperties([
        ["background", "#eeeeee"],
        ["padding", "var(--edge-margin)"],
        ["padding-bottom", "var(--large-spacing)"],
    ]).setProperties([["margin-right", "auto"]], 'Title Group'
    ).add('Rich Text', {
        'text-align': 'right',
        'font-size': '10pt'
    }, '.rich-text');

    /** Contact Information */
    let contact = css.add("Contact Information", {
        "grid-template-columns": "1fr 30px",
        "grid-column-gap": "var(--small-spacing)",
        "margin-left": "var(--spacing)",
        "width": "auto",
        "height": "auto",
    }, "#contact, #social-media");

    contact.add('Icon', {
        'height': '24px',
        'vertical-align': 'middle'
    }, 'svg.icon, img.icon');

    /** Letter */
    let content = css.add("#content", {
        "font-family": "var(--serif)",
        "font-size": "12pt",
        "line-height": "1.6",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)"
    }, '#content');

    content.add("Paragraph", {
        "padding-top": "1em",
    }, "p").add(":first-of-type", {
        "padding-top": "0"
    });

    css.add("#date", {
        "margin-top": "2em",
    }, "#date");

    css.add("#salutation", {
        "margin-top": "2em"
    }, "#salutation");

    css.add("#body", {
        "margin-top": "2em"
    }, "#body");

    css.add("#closing", {
        "margin-top": "2em"
    }, "#closing").add("Signature", {
        "height": "80px"
    }, "img");

    return css;
}
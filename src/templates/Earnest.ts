import type { BasicEntryProps } from "@/resume/Entry";
import Group from "@/resume/Group";
import Header, { type BasicHeaderProps } from "@/resume/Header";
import Link from "@/resume/Link";
import {
    DescriptionListItemType,
    DescriptionListType,
    type BasicDescriptionItemProps
} from "@/resume/List";
import MarkdownText from "@/resume/Markdown";
import Row, { type BasicRowProps } from "@/resume/Row";
import CssNode from "@/shared/CssTree";
import type { BasicResumeNode } from "@/types";
import getDefaultCss, { getRootCss, resumeBodyBaseProperties } from "./CssTemplates";
import { makeList } from "./TemplateHelper";

/*
 * Earnest: a one-column résumé in the career-office tradition for students,
 * new graduates, and candidates through their first several years of work.
 * Education leads in the sample because it is usually an early-career
 * applicant's strongest evidence; moving the Education section below
 * Experience needs no style changes. DOM order is reading order. Every rule,
 * tab, dot, and dash is a border, background, or empty pseudo-element; the
 * only generated text is the colon after a fact label and the comma between
 * values, which keep extracted text delimited.
 */

function markdown(value: string): BasicResumeNode {
    return { type: MarkdownText.type, value };
}

function section(title: string, childNodes: BasicResumeNode[]): BasicResumeNode {
    return { type: "Section", value: title, childNodes };
}

/** Builds a description list with one `dd` per value. */
export function earnestDescriptionList(items: Array<[string, string[]]>): BasicResumeNode {
    return {
        type: DescriptionListType,
        childNodes: items.map(([term, definitions]) => ({
            type: DescriptionListItemType,
            value: term,
            definitions
        } as BasicDescriptionItemProps))
    };
}

function entry(titles: string[], details: string[], childNodes: BasicResumeNode[] = []): BasicEntryProps {
    return { type: "Entry", title: titles, subtitle: details, childNodes };
}

/** The shared identity header; the cover letter omits the optional summary. */
export function earnestHeader(includeSummary = true): BasicHeaderProps {
    const contact: BasicResumeNode = {
        type: Group.type,
        htmlId: "earnest-contact",
        childNodes: [{
            type: Row.type,
            justifyContent: "center",
            childNodes: [
                markdown("Columbus, OH"),
                markdown("ana.lytics@mail.example"),
                markdown("(614) 555-0147"),
                {
                    type: Link.type,
                    value: "linkedin.com/in/ana-lytics-example",
                    url: "https://www.linkedin.com/in/ana-lytics-example"
                } as BasicResumeNode
            ]
        } as BasicRowProps]
    };
    const summary: BasicResumeNode = {
        type: Group.type,
        htmlId: "earnest-summary",
        childNodes: [markdown(
            "Information Science senior with an analytics internship and a habit of turning messy data into dashboards teams keep using. Seeking a full-time data analyst role from June 2027."
        )]
    };
    return {
        type: Header.type,
        value: "Ana Lytics",
        subtitle: "Data Analyst · B.S. Information Science, May 2027",
        distribution: "top-to-bottom",
        justifyContent: "flex-start",
        childNodes: includeSummary ? [contact, summary] : [contact]
    };
}

export function earnestNodes(): BasicResumeNode[] {
    return [
        earnestHeader(),
        section("Education", [
            entry(
                ["Lakeshore State University", "Expected May 2027"],
                ["B.S. Information Science, minor in Statistics", "Columbus, OH"],
                [earnestDescriptionList([
                    ["GPA", ["3.72 / 4.00"]],
                    ["Honors", ["Dean’s List, six semesters"]],
                    ["Relevant coursework", ["Database Systems", "Applied Regression", "Data Visualization", "Survey Methods"]]
                ])]
            )
        ]),
        section("Experience", [
            entry(
                ["Northfield Regional Health", "May 2026 – Aug 2026"],
                ["Data Analytics Intern", "Columbus, OH"],
                [makeList([
                    "Rebuilt the weekly bed-occupancy report in Power BI, cutting prep time from six hours to 40 minutes.",
                    "Wrote SQL validation checks that caught 1,200 duplicate visit records before a quarterly state filing.",
                    "Presented a weekend staffing forecast to three nursing directors; two units changed their schedules."
                ])]
            ),
            entry(
                ["Cobalt Grocery Co-op", "Sep 2024 – Present"],
                ["Operations Assistant, part-time", "Columbus, OH"],
                [makeList([
                    "Built a shared inventory tracker that reduced produce waste by 15% over two seasons.",
                    "Trained eight new volunteers on point-of-sale and receiving procedures."
                ])]
            )
        ]),
        section("Projects", [
            entry(
                ["Campus Transit Ridership Dashboard", "Spring 2026"],
                ["Python, pandas, Tableau", "ana-lytics.example/transit"],
                [makeList([
                    "Mapped bus crowding by hour from 18 months of GPS data for a Student Government route proposal."
                ])]
            ),
            entry(
                ["Course Review Sentiment Analysis", "Fall 2025"],
                ["Python, scikit-learn", "Applied Regression course project"],
                [makeList([
                    "Classified 9,000 course reviews by topic and sentiment at 86% accuracy and published the dataset."
                ])]
            )
        ]),
        section("Leadership & Activities", [
            entry(
                ["Women in Data, Lakeshore Chapter", "2025 – Present"],
                ["Vice President"],
                [makeList(["Organized a 120-person weekend datathon with two regional employer sponsors."])]
            ),
            entry(
                ["Statistics Learning Center", "2024 – 2025"],
                ["Peer Tutor", "About ten students a week in introductory statistics"]
            )
        ]),
        section("Skills & Interests", [earnestDescriptionList([
            ["Technical", ["SQL", "Python (pandas, scikit-learn)", "R", "Excel"]],
            ["Tools", ["Power BI", "Tableau", "Git", "Jira"]],
            ["Languages", ["English (native)", "Spanish (conversational)"]],
            ["Interests", ["Trail running", "Community radio", "Sourdough baking"]]
        ])])
    ];
}

/** The section tab: a short accent rule over a full-width hairline, painted as backgrounds. */
export function earnestTabRule(): Record<string, string> {
    return {
        "background-image": "linear-gradient(var(--accent), var(--accent)), linear-gradient(var(--rule), var(--rule))",
        "background-position": "left bottom, left bottom",
        "background-size": "var(--tab-width) var(--tab-height), 100% 1px",
        "background-repeat": "no-repeat",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    };
}

/**
 * Styles a description list as inline `Term: value, value` facts that wrap
 * as whole items, such as GPA, honors, and coursework under a degree.
 */
export function styleInlineFacts(list: CssNode): void {
    // No margin here: the Description List rule already zeroes it, and inside an entry
    // the Entry Details gap must still separate the facts from the title block.
    const facts = list.setProperties({
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "baseline",
        "column-gap": "var(--item-gap)",
        "row-gap": "var(--space-1)"
    });
    const fact = facts.addNode("Facts", {
        "display": "block",
        "min-width": "0",
        "margin": "0",
        "padding": "0"
    }, ".resume-definition");
    fact.addNode("Fact Labels", {
        "display": "inline",
        "margin": "0",
        "padding": "0",
        "font-weight": "700",
        "color": "var(--ink)"
    }, "dt");
    fact.addNode("Fact Label Colons", { "content": "\":\"" }, "dt::after");
    fact.addNode("Fact Values", {
        "display": "inline",
        "margin": "0 0 0 var(--space-2)",
        "padding": "0"
    }, "dd");
}

/** Centered name, headline, and contact line, followed by an optional left-aligned summary. */
function styleHeader(css: CssNode): void {
    const header = css.mustFindNode("Header").setProperties({
        "margin": "0 0 var(--space-5)",
        "padding": "0",
        "text-align": "center"
    });
    const titleGroup = header.mustFindNode("Title Group").setProperties({ "margin": "0" });
    titleGroup.mustFindNode("Title").setProperties({
        "margin": "0",
        "font-family": "var(--serif)",
        "font-size": "calc(var(--font-size) * 2.3)",
        "font-weight": "700",
        "line-height": "1.1",
        "color": "var(--ink)"
    });
    titleGroup.mustFindNode("Subtitle").setProperties({
        "margin": "var(--space-1) 0 0",
        "font-family": "var(--serif)",
        "font-size": "calc(var(--font-size) * 1.08)",
        "font-weight": "400",
        "line-height": "1.3",
        "color": "var(--accent)"
    });

    const contact = header.addNode("Contact", {
        "margin-top": "var(--space-3)",
        "font-size": "calc(var(--font-size) * 0.94)",
        "line-height": "1.35",
        "color": "var(--meta)"
    }, "#earnest-contact");
    const rows = contact.addNode("Contact Rows", {
        "flex-wrap": "wrap",
        "column-gap": "var(--item-gap)",
        "row-gap": "var(--space-1)"
    }, ".row");
    const items = rows.addNode("Contact Items", {
        "display": "flex",
        "align-items": "center",
        "min-width": "0"
    }, "> .text-content, > .link");
    items.addNode("Contact Paragraphs", { "margin": "0" }, "p");
    // A 1px hairline centered in the column gap. Its margins and width net to zero, so items
    // keep their measured width. Blank shells are skipped so a deleted contact leaves no
    // doubled rule. A row that wraps can start a line with a rule; long contact lists should
    // be split into a second Row, which centers on its own line.
    rows.addNode("Contact Separators", {
        "content": "\"\"",
        "flex": "0 0 auto",
        "width": "1px",
        "height": "0.85em",
        "margin-left": "calc(var(--item-gap) / -2 - 0.5px)",
        "margin-right": "calc(var(--item-gap) / 2 - 0.5px)",
        "background": "var(--rule)",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, "> :not(:empty) ~ :not(:empty)::before");

    header.addNode("Summary", {
        "margin-top": "var(--space-4)",
        "text-align": "left"
    }, "#earnest-summary");
}

function styleSections(css: CssNode): void {
    const sectionCss = css.mustFindNode("Section").setProperties({
        "margin": "0 0 var(--space-5)",
        "padding": "0"
    });
    sectionCss.addNode("Last Section", { "margin-bottom": "0" }, ":last-child");
    sectionCss.mustFindNode("Title").setProperties({
        "margin": "0 0 var(--space-3)",
        "padding": "0 0 var(--space-2)",
        "font-family": "var(--serif)",
        "font-size": "calc(var(--font-size) * 0.88)",
        "font-weight": "700",
        "letter-spacing": "0.08em",
        "line-height": "1.2",
        "text-transform": "uppercase",
        "color": "var(--accent)",
        ...earnestTabRule(),
        "break-inside": "avoid",
        "page-break-inside": "avoid",
        "break-after": "avoid",
        "page-break-after": "avoid"
    });
    sectionCss.mustFindNode("Content").setProperties({
        "margin": "0",
        "padding": "0",
        "border": "0"
    });
}

/** Organization and date share the first row; role, location, tools, or course follow on the second. */
function styleEntries(css: CssNode): void {
    const entryCss = css.mustFindNode("Entry").setProperties({
        "display": "block",
        "margin": "0",
        "break-inside": "avoid",
        "page-break-inside": "avoid"
    });
    entryCss.mustFindNode("Adjacent Entries").setProperties({ "margin-top": "var(--space-4)" });

    const titleBlock = entryCss.mustFindNode("Title Block").setProperties({
        "margin": "0",
        "break-after": "avoid",
        "page-break-after": "avoid"
    });
    const title = titleBlock.mustFindNode("Title").setProperties({
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "baseline",
        "column-gap": "var(--space-4)",
        "margin": "0",
        "font-family": "var(--serif)",
        "font-size": "calc(var(--font-size) * 1.04)",
        "font-weight": "700",
        "line-height": "1.3",
        "color": "var(--ink)"
    });
    title.mustFindNode("First Field").setProperties({ "min-width": "0" });
    title.mustFindNode("Middle Fields").setProperties({
        "font-weight": "400",
        "color": "var(--meta)"
    });
    title.mustFindNode("Last Field").setProperties({
        "margin-left": "auto",
        "font-size": "0.9em",
        "font-weight": "400",
        "font-variant-numeric": "lining-nums tabular-nums",
        "color": "var(--meta)",
        "text-align": "right"
    });

    const subtitle = titleBlock.mustFindNode("Subtitle").setProperties({
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "baseline",
        "margin": "0",
        "font-family": "var(--serif)",
        "font-size": "calc(var(--font-size) * 0.96)",
        "font-weight": "400",
        "line-height": "1.3",
        "color": "var(--meta)"
    });
    subtitle.mustFindNode("First Field").setProperties({
        "font-style": "italic",
        "color": "var(--ink)"
    });
    subtitle.addNode("Detail Separators", {
        "content": "\"\"",
        "display": "inline-block",
        "width": "var(--dot-size)",
        "height": "var(--dot-size)",
        "margin": "0 var(--space-3)",
        "vertical-align": "0.24em",
        "border-radius": "50%",
        "background": "currentColor",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, ".field + .field::before");

    entryCss.addNode("Entry Details", { "margin-top": "var(--space-2)" }, "> hgroup ~ *");
    styleInlineFacts(entryCss.addNode("Entry Facts", {}, "dl"));
}

/**
 * Bulleted lists hang a short accent dash in the indent; numbered lists keep their numbers.
 * The dash is a background in the item's padding rather than an inline marker, so a loose
 * Markdown list, whose items wrap their text in paragraphs, keeps it beside the first line.
 */
function styleMarkdown(css: CssNode): void {
    const markdownCss = css.mustFindNode("Markdown");
    markdownCss.mustFindNode("Paragraphs").setProperties({ "margin": "0" });
    markdownCss.addNode("Following Paragraphs", { "margin-top": "var(--space-2)" }, "p + p");
    const lists = markdownCss.mustFindNode("Lists").setProperties({
        "margin": "0",
        "padding-left": "var(--list-indent)"
    });
    const items = lists.mustFindNode("List Item").setProperties({ "margin": "0" });
    items.addNode("Following List Items", { "margin-top": "var(--space-1)" }, "+ li");
    const bullets = markdownCss.addNode("Bulleted Lists", {
        "padding-left": "0",
        "list-style": "none"
    }, "ul");
    bullets.addNode("Bullet Dashes", {
        "padding-left": "var(--list-indent)",
        "background-image": "linear-gradient(var(--accent), var(--accent))",
        // Half the line height centers the dash on the first line at any authored leading.
        "background-position": "0 calc(var(--line-height) * 0.5em)",
        "background-size": "0.45em 1.5px",
        "background-repeat": "no-repeat",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, "> li");
    markdownCss.mustFindNode("Links").setProperties(linkProperties());
}

function linkProperties(): Record<string, string> {
    return {
        "color": "inherit",
        "text-decoration": "underline",
        "text-decoration-color": "var(--rule)",
        "text-decoration-thickness": "1px",
        "text-underline-offset": "2px"
    };
}

/** Term/value rows such as skills: an aligned term column with comma-separated values. */
function styleDescriptionLists(css: CssNode): void {
    const list = css.mustFindNode("Description List").setProperties({
        "margin": "0",
        "padding": "0"
    });
    list.mustFindNode("Definitions").setProperties({
        "margin": "0 var(--space-2) 0 0",
        "padding": "0"
    });
    const rows = list.addNode("Term Rows", {
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "baseline",
        "padding-left": "var(--term-width)",
        "break-inside": "avoid",
        "page-break-inside": "avoid"
    }, ".resume-definition");
    rows.addNode("Following Term Rows", { "margin-top": "var(--space-1)" }, "+ .resume-definition");
    // A term fills at least the column. A longer label widens its own row, up to 40% of the
    // line, instead of splitting a keyword; only a token wider than that cap breaks.
    rows.addNode("Row Terms", {
        "flex": "0 1 auto",
        "box-sizing": "border-box",
        "min-width": "var(--term-width)",
        "max-width": "40%",
        "margin-left": "calc(-1 * var(--term-width))",
        "padding-right": "var(--space-3)",
        "overflow-wrap": "break-word",
        "font-weight": "700",
        "color": "var(--ink)"
    }, "dt");
    // Commas keep wrapped values readable and give extracted text an explicit delimiter.
    rows.addNode("Value Separators", { "content": "\",\"" }, "dd:not(:last-child)::after");
}

/** Applies the Earnest page, header, section, entry, and list treatment shared by both documents. */
export function earnestCss(): CssNode {
    const css = getDefaultCss().setProperties({
        ...resumeBodyBaseProperties,
        "padding": "var(--page-margin-block) var(--page-margin-inline)",
        "font-family": "var(--serif)",
        "font-size": "var(--font-size)",
        "line-height": "var(--line-height)",
        "color": "var(--ink)",
        "background": "var(--paper)"
    });

    css.mustFindNode("Link").setProperties(linkProperties())
        .mustFindNode("Hover").setProperties({ "color": "inherit", "text-decoration-color": "currentColor" });

    styleDescriptionLists(css);
    styleHeader(css);
    styleSections(css);
    styleEntries(css);
    styleMarkdown(css);
    return css;
}

/** Colors, type, and spacing for both documents; alternate palettes override only these variables. */
export function earnestRootCss(): CssNode {
    return getRootCss().setProperties((current) => new Map([
        ...current,
        ["--serif", "\"CMU Serif\", Georgia, serif"],
        ["--font-size", "11pt"],
        ["--line-height", "1.24"],
        ["--ink", "#1a1f1d"],
        ["--meta", "#4c5652"],
        ["--accent", "#1f5a47"],
        ["--rule", "#cdd5d1"],
        ["--paper", "#ffffff"],
        ["--page-margin-block", "0.5in"],
        ["--page-margin-inline", "0.6in"],
        ["--letter-margin-inline", "0.9in"],
        ["--tab-width", "0.32in"],
        ["--tab-height", "2px"],
        ["--item-gap", "1.25em"],
        ["--dot-size", "0.25em"],
        ["--list-indent", "1em"],
        ["--term-width", "8.4em"],
        ["--space-1", "0.15em"],
        ["--space-2", "0.3em"],
        ["--space-3", "0.55em"],
        ["--space-4", "0.7em"],
        ["--space-5", "1.1em"],
        ["--small-spacing", "var(--space-2)"],
        ["--spacing", "var(--space-3)"],
        ["--large-spacing", "var(--space-5)"]
    ]));
}

import type { BasicEntryProps } from "@/resume/Entry";
import Group from "@/resume/Group";
import Header, { type BasicHeaderProps } from "@/resume/Header";
import {
    DescriptionListItemType,
    DescriptionListType,
    type BasicDescriptionItemProps
} from "@/resume/List";
import MarkdownText from "@/resume/Markdown";
import CssNode from "@/shared/CssTree";
import type { BasicResumeNode } from "@/types";
import getDefaultCss, { getRootCss, resumeBodyBaseProperties } from "./CssTemplates";
import { makeList } from "./TemplateHelper";

/*
 * Candor: an Integrity-inspired, headshot-free résumé with a full-height
 * right rail. DOM order is reading order: the main column (name, summary,
 * experience, education) precedes the rail (contact card, skills, and other
 * supporting facts), so PDF extraction reads the career evidence first.
 */

function markdown(value: string): BasicResumeNode {
    return { type: MarkdownText.type, value };
}

function section(title: string, childNodes: BasicResumeNode[], htmlId?: string): BasicResumeNode {
    return htmlId
        ? { type: "Section", value: title, htmlId, childNodes }
        : { type: "Section", value: title, childNodes };
}

/** Builds a description list with one `dd` per value. */
export function candorDescriptionList(items: Array<[string, string[]]>): BasicResumeNode {
    return {
        type: DescriptionListType,
        childNodes: items.map(([term, definitions]) => ({
            type: DescriptionListItemType,
            value: term,
            definitions
        } as BasicDescriptionItemProps))
    };
}

function entry(titles: string[], details: string[], bullets: string[] = []): BasicEntryProps {
    return {
        type: "Entry",
        title: titles,
        subtitle: details,
        childNodes: bullets.length ? [makeList(bullets)] : []
    };
}

/** The shared identity header; the cover letter omits the summary. */
export function candorHeader(includeSummary = true): BasicHeaderProps {
    return {
        type: Header.type,
        value: "Bea Spoke",
        subtitle: "Product Designer",
        distribution: "top-to-bottom",
        justifyContent: "flex-start",
        childNodes: includeSummary ? [{
            type: Group.type,
            htmlId: "candor-summary",
            childNodes: [markdown(
                "Product designer pairing patient research with tidy systems. Five years shaping checkout, booking, and onboarding flows people finish on the first try."
            )]
        }] : []
    };
}

/** The contact card that opens the rail of both documents. */
export function candorContact(): BasicResumeNode {
    return section("Contact", [candorDescriptionList([
        ["Email", ["bea.spoke@mail.example"]],
        ["Phone", ["(503) 555-0142"]],
        ["Location", ["Portland, OR"]],
        ["Portfolio", ["beaspoke.example"]],
        ["LinkedIn", ["linkedin.com/in/bea-example"]]
    ])], "candor-contact");
}

function mainColumn(): BasicResumeNode {
    return {
        type: "Column",
        htmlId: "candor-main",
        childNodes: [
            candorHeader(),
            section("Experience", [
                entry(
                    ["Fernway Outdoor Co.", "2022 – Present"],
                    ["Product Designer", "Portland, OR"],
                    [
                        "Redesigned the gear-rental checkout, cutting abandonment 18% across 40,000 monthly sessions.",
                        "Built a 60-component design system with engineering, reducing UI defects found in QA by a third.",
                        "Ran 30+ moderated usability sessions and turned the findings into a quarterly research roadmap."
                    ]
                ),
                entry(
                    ["Lumen & Lark Studio", "2019 – 2022"],
                    ["UX Designer", "Remote"],
                    [
                        "Designed booking and onboarding flows for 12 small-business clients in hospitality and wellness.",
                        "Introduced lightweight accessibility reviews; every launch since has met WCAG 2.1 AA.",
                        "Prototyped a self-serve scheduling tool that lifted completed bookings 26% for a yoga collective."
                    ]
                ),
                entry(
                    ["Harbor City Library", "2017 – 2019"],
                    ["Digital Services Assistant", "Portland, OR"],
                    [
                        "Rewrote catalog help pages in plain language, halving related questions at the reference desk."
                    ]
                )
            ]),
            section("Selected Projects", [
                entry(
                    ["Trail Conditions Map", "2023"],
                    ["Volunteer Designer", "Friends of Forest Trails"],
                    ["Designed a mobile map of trail closures and hazards that 3,000 hikers check each month."]
                ),
                entry(
                    ["Pantry Check-In Kiosk", "2021"],
                    ["Pro Bono UX Lead", "Eastside Food Share"],
                    ["Simplified a touch-screen intake that cut average check-in time from four minutes to ninety seconds."]
                )
            ]),
            section("Education", [
                entry(
                    ["Cascadia State University", "2017"],
                    ["B.A., Graphic Design", "Minor in Psychology"]
                )
            ])
        ]
    };
}

/** The skills chips shared by the résumé rail and the cover-letter rail. */
export function candorSkills(): BasicResumeNode {
    return section("Skills", [candorDescriptionList([
        ["Research", ["Usability testing", "Interviews", "Journey mapping"]],
        ["Design", ["Interaction design", "Prototyping", "Design systems", "Accessibility"]],
        ["Tools", ["Figma", "Maze", "Dovetail", "HTML & CSS"]]
    ])], "candor-skills");
}

function rail(): BasicResumeNode {
    return {
        type: "Column",
        htmlId: "candor-rail",
        childNodes: [
            candorContact(),
            candorSkills(),
            section("Certifications", [candorDescriptionList([
                ["Accessibility Fundamentals", ["2023"]],
                ["Service Design Practitioner", ["2021"]]
            ])]),
            section("Languages", [candorDescriptionList([
                ["English", ["Native"]],
                ["Spanish", ["Professional"]]
            ])])
        ]
    };
}

export function candorNodes(): BasicResumeNode[] {
    return [mainColumn(), rail()];
}

/** Section kicker: a small tracked label followed by a hairline drawn as an empty pseudo-element. */
function styleSections(css: CssNode): void {
    const sectionCss = css.mustFindNode("Section").setProperties({
        "margin": "0 0 var(--space-6)",
        "padding": "0"
    });
    sectionCss.addNode("Last Section", { "margin-bottom": "0" }, ":last-child");
    const title = sectionCss.mustFindNode("Title").setProperties({
        "display": "flex",
        "align-items": "center",
        "gap": "var(--space-4)",
        "margin": "0 0 var(--space-4)",
        "font-family": "var(--sans-serif)",
        "font-size": "calc(var(--font-size) * 0.92)",
        "font-weight": "700",
        "letter-spacing": "0.08em",
        "line-height": "1.2",
        "text-transform": "uppercase",
        "color": "var(--accent)",
        "break-after": "avoid",
        "page-break-after": "avoid"
    });
    title.addNode("Title Rule", {
        "content": "\"\"",
        "flex": "1 1 auto",
        "height": "1px",
        "background": "var(--rule)",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, "::after");
    styleTimeline(sectionCss.mustFindNode("Content"));
}

/**
 * Section content draws Integrity's timeline as a hairline, and every entry
 * title carries a marker dot centered on that line. The dot is an empty flex
 * item pulled into the gutter with negative margins, so the layout stays in
 * normal flow. Timeline tokens are absolute lengths because they resolve in
 * elements with different font sizes; the dot's em-based `--space-4` term
 * deliberately cancels the title row's matching column gap. The rail resets both.
 */
function styleTimeline(content: CssNode): void {
    content.setProperties({
        "margin": "0 0 0 calc(var(--marker-size) / 2)",
        "padding": "0 0 0 var(--timeline-gap)",
        "border": "0",
        "border-left": "1px solid var(--rule)"
    });
    content.addNode("Timeline Markers", {
        "content": "\"\"",
        "flex": "0 0 auto",
        "align-self": "flex-start",
        "width": "var(--marker-size)",
        "height": "var(--marker-size)",
        "margin-top": "calc((var(--entry-title-line-height) * 1em - var(--marker-size)) / 2)",
        "margin-left": "calc(-1 * var(--timeline-gap) - var(--marker-size) / 2 - 0.5px)",
        "margin-right": "calc(var(--timeline-gap) - var(--marker-size) / 2 + 0.5px - var(--space-4))",
        "border-radius": "50%",
        "background": "var(--marker)",
        "box-shadow": "0 0 0 2px var(--paper)",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, ".entry > hgroup > h3::before");
}

/** Entries share one title row: employer at the left, date at the right. */
function styleEntries(css: CssNode): void {
    const entryCss = css.mustFindNode("Entry").setProperties({
        "display": "block",
        "margin": "0 0 var(--space-5)",
        "break-inside": "avoid",
        "page-break-inside": "avoid"
    });
    entryCss.addNode("Last Entry", { "margin-bottom": "0" }, ":last-child");
    entryCss.mustFindNode("Adjacent Entries").setProperties({ "margin-top": "0" });

    const titleBlock = entryCss.mustFindNode("Title Block").setProperties({
        "margin": "0 0 var(--space-2)",
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
        "font-size": "calc(var(--font-size) * 1.14)",
        "font-weight": "700",
        "line-height": "var(--entry-title-line-height)",
        "color": "var(--ink)"
    });
    title.mustFindNode("First Field").setProperties({ "min-width": "0" });
    title.mustFindNode("Middle Fields").setProperties({
        "font-family": "var(--sans-serif)",
        "font-size": "0.86em",
        "font-weight": "600",
        "color": "var(--accent)"
    });
    title.mustFindNode("Last Field").setProperties({
        "margin-left": "auto",
        "font-family": "var(--sans-serif)",
        "font-size": "0.82em",
        "font-weight": "700",
        "font-variant-numeric": "tabular-nums",
        "letter-spacing": "0.02em",
        "color": "var(--accent)",
        "text-align": "right"
    });

    const subtitle = titleBlock.mustFindNode("Subtitle").setProperties({
        "display": "flex",
        "flex-wrap": "wrap",
        "align-items": "baseline",
        "column-gap": "var(--space-3)",
        "margin": "var(--space-1) 0 0",
        "font-family": "var(--sans-serif)",
        "font-size": "calc(var(--font-size) * 0.95)",
        "font-weight": "400",
        "line-height": "1.3",
        "color": "var(--meta)"
    });
    subtitle.mustFindNode("First Field").setProperties({
        "font-weight": "600",
        "color": "var(--ink)"
    });
    subtitle.addNode("Detail Separators", {
        "content": "\"\"",
        "display": "inline-block",
        "width": "0.32em",
        "height": "0.32em",
        "margin-right": "var(--space-3)",
        "vertical-align": "0.18em",
        "border-radius": "50%",
        "background": "var(--marker)",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, ".field + .field::before");

    const lists = entryCss.addNode("Entry Lists", {
        "margin": "var(--space-2) 0 0",
        "padding-left": "1.1em",
        "list-style-type": "square"
    }, ".text-content ul, .text-content ol");
    lists.addNode("Entry List Items", { "margin": "var(--space-1) 0" }, "li");
    lists.addNode("Entry List Markers", {
        "color": "var(--marker)",
        "font-size": "0.85em"
    }, "li::marker");
}

/** The main column holds the header and career evidence beside the rail. */
function styleMainColumn(css: CssNode): void {
    css.addNode("Main Column", {
        "min-width": "0",
        "padding": "var(--page-margin) var(--column-gap) var(--page-margin) var(--page-margin)"
    }, "#candor-main");
}

/**
 * The rail is a full-height warm panel. Its contact card inverts to the
 * accent color; the skills list renders each value as a soft chip, and other
 * description lists read as term/value rows.
 */
function styleRail(css: CssNode): void {
    const railCss = css.addNode("Rail", {
        "min-width": "0",
        "padding": "0 0 var(--page-margin)",
        "font-size": "calc(var(--font-size) * 0.94)",
        "line-height": "1.4",
        "background": "var(--panel)",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, "#candor-rail");

    const railSections = railCss.addNode("Rail Sections", {
        "margin": "var(--space-6) 0 0",
        "padding": "0 var(--rail-padding)",
        "break-inside": "avoid",
        "page-break-inside": "avoid"
    }, "section");
    railSections.addNode("Rail Section Rules", { "background": "var(--panel-rule)" }, "> h2::after");
    const railContent = railSections.addNode("Rail Section Content", {
        "margin": "0",
        "padding": "0",
        "border": "0"
    }, "> .content");
    railContent.addNode("Rail Entry Markers", { "display": "none" }, ".entry > hgroup > h3::before");

    railCss.addNode("Rail Paragraphs", { "margin": "0 0 var(--space-2)" }, "p");
    const railLists = railCss.addNode("Rail Lists", {
        "margin": "0",
        "padding-left": "1em",
        "list-style-type": "square"
    }, "ul");
    railLists.addNode("Rail List Items", { "margin": "0 0 var(--space-2)" }, "li");
    railLists.addNode("Rail List Markers", { "color": "var(--marker)" }, "li::marker");

    railCss.addNode("Rail Description Lists", { "margin": "0", "padding": "0" }, "dl");
    const rows = railCss.addNode("Rail Rows", {
        "display": "flex",
        "flex-wrap": "wrap",
        "justify-content": "space-between",
        "column-gap": "var(--space-3)",
        "padding": "var(--space-2) 0",
        "border-bottom": "1px solid var(--panel-rule)"
    }, ".resume-definition");
    rows.addNode("Rail Row Terms", { "font-weight": "600", "color": "var(--ink)" }, "dt");
    rows.addNode("Rail Row Values", {
        "margin": "0 0 0 auto",
        "padding": "0",
        "color": "var(--meta)",
        "text-align": "right"
    }, "dd");

    const contact = railCss.addNode("Contact Card", {
        "margin": "0",
        "padding": "var(--page-margin) var(--rail-padding) var(--space-6)",
        "color": "var(--card-ink)",
        "background": "var(--accent)",
        "print-color-adjust": "exact",
        "-webkit-print-color-adjust": "exact"
    }, "#candor-contact");
    const contactTitle = contact.addNode("Contact Title", { "color": "inherit" }, "> h2");
    contactTitle.addNode("Contact Title Rule", {
        "background": "currentColor",
        "opacity": "0.4"
    }, "::after");
    const contactItems = contact.addNode("Contact Items", {
        "display": "block",
        "padding": "0",
        "margin": "0 0 var(--space-3)",
        "border": "0"
    }, ".resume-definition");
    contactItems.addNode("Last Contact Item", { "margin-bottom": "0" }, ":last-child");
    contactItems.addNode("Contact Labels", {
        "color": "inherit",
        "font-size": "0.8em",
        "font-weight": "600",
        "letter-spacing": "0.08em",
        "text-transform": "uppercase",
        "opacity": "0.78"
    }, "dt");
    contactItems.addNode("Contact Values", {
        "margin": "0",
        "padding": "0",
        "font-weight": "500",
        "color": "inherit",
        "text-align": "left",
        "overflow-wrap": "anywhere"
    }, "dd");

    const skills = railCss.addNode("Skills", {}, "#candor-skills");
    const skillGroups = skills.addNode("Skill Groups", {
        "display": "flex",
        "flex-wrap": "wrap",
        "justify-content": "flex-start",
        "gap": "var(--space-2)",
        "padding": "0",
        "margin": "0 0 var(--space-4)",
        "border": "0"
    }, ".resume-definition");
    skillGroups.addNode("Last Skill Group", { "margin-bottom": "0" }, ":last-child");
    skillGroups.addNode("Skill Categories", {
        "flex": "0 0 100%",
        "font-weight": "700",
        "color": "var(--ink)"
    }, "dt");
    skillGroups.addNode("Skill Chips", {
        "max-width": "100%",
        "margin": "0",
        "padding": "0.1em 0.6em",
        "font-size": "0.94em",
        "line-height": "1.4",
        "color": "var(--ink)",
        "text-align": "left",
        "background": "var(--paper)",
        "border": "1px solid var(--panel-rule)",
        "border-radius": "1em"
    }, "dd");
}

/** Applies the Candor page, header, section, entry, and rail treatment shared by both documents. */
export function candorCss(): CssNode {
    const css = getDefaultCss().setProperties({
        ...resumeBodyBaseProperties,
        "display": "grid",
        "grid-template-columns": "minmax(0, 1fr) var(--rail-width)",
        "min-height": "100%",
        "padding": "0",
        "font-family": "var(--sans-serif)",
        "font-size": "var(--font-size)",
        "line-height": "var(--line-height)",
        "color": "var(--ink)",
        "background": "var(--paper)"
    });

    css.mustFindNode("Link").setProperties({
        "color": "inherit",
        "text-decoration": "underline",
        "text-decoration-thickness": "1px",
        "text-underline-offset": "2px"
    }).mustFindNode("Hover").setProperties({ "color": "inherit", "text-decoration": "none" });
    css.mustFindNode(["Markdown", "Links"]).setProperties({ "color": "inherit" });

    const header = css.mustFindNode("Header").setProperties({
        "margin": "0 0 var(--space-6)",
        "padding": "0"
    });
    const titleGroup = header.mustFindNode("Title Group").setProperties({ "margin": "0" });
    titleGroup.mustFindNode("Title").setProperties({
        "margin": "0",
        "font-family": "var(--serif)",
        "font-size": "calc(var(--font-size) * 2.8)",
        "font-weight": "700",
        "line-height": "1.05",
        "color": "var(--ink)"
    });
    titleGroup.mustFindNode("Subtitle").setProperties({
        "margin": "var(--space-3) 0 0",
        "font-family": "var(--sans-serif)",
        "font-size": "calc(var(--font-size) * 1.02)",
        "font-weight": "700",
        "letter-spacing": "0.08em",
        "line-height": "1.2",
        "text-transform": "uppercase",
        "color": "var(--marker)"
    });
    const summary = header.addNode("Summary", {
        "margin-top": "var(--space-5)",
        "padding-left": "var(--space-4)",
        "font-size": "calc(var(--font-size) * 1.04)",
        "line-height": "1.5",
        "color": "var(--meta)",
        "border-left": "2px solid var(--marker)"
    }, "#candor-summary");
    summary.addNode("Summary Paragraph", { "margin": "0" }, "p");

    styleSections(css);
    styleEntries(css);
    styleMainColumn(css);
    styleRail(css);
    css.mustFindNode("Column").setProperties({ "min-width": "0" });
    return css;
}

/** Colors, type, and spacing for both documents; alternate palettes override only these variables. */
export function candorRootCss(): CssNode {
    return getRootCss().setProperties((current) => new Map([
        ...current,
        ["--serif", "\"CMU Serif\", Georgia, serif"],
        ["--sans-serif", "\"Source Sans 3\", system-ui, sans-serif"],
        ["--font-size", "10pt"],
        ["--line-height", "1.38"],
        ["--ink", "#23263a"],
        ["--meta", "#585c6c"],
        ["--accent", "#33478c"],
        ["--marker", "#b4552f"],
        ["--panel", "#f4ede3"],
        ["--panel-rule", "#dccfbd"],
        ["--rule", "#cdd1dc"],
        ["--paper", "#ffffff"],
        ["--card-ink", "#ffffff"],
        ["--page-margin", "0.5in"],
        ["--rail-width", "2.5in"],
        ["--rail-padding", "0.28in"],
        ["--column-gap", "0.36in"],
        ["--timeline-gap", "0.17in"],
        ["--marker-size", "0.075in"],
        ["--entry-title-line-height", "1.25"],
        ["--space-1", "0.15em"],
        ["--space-2", "0.3em"],
        ["--space-3", "0.5em"],
        ["--space-4", "0.75em"],
        ["--space-5", "1.1em"],
        ["--space-6", "1.6em"],
        ["--small-spacing", "var(--space-2)"],
        ["--spacing", "var(--space-3)"],
        ["--large-spacing", "var(--space-5)"]
    ]));
}

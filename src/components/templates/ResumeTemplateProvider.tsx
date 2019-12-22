import Section, { SectionHeaderPosition, BasicSectionProps } from "../Section";
import { assignIds } from "../Helpers";
import Header from "../Header";
import Entry, { BasicEntryProps } from "../Entry";
import RichText from "../RichText";
import { BasicResumeNode } from "../utility/NodeTree";
import Column from "../Column";
import Row from "../Row";
import { randyMarshCss, randyMarsh } from "./RandyMarsh";
import getDefaultCss from "./CssTemplates";
import { ResumeSaveData } from "../controls/ResumeState";
import { assuredNodes, assuredCss } from "./Assured";
import CssNode from "../utility/CssTree";

export default class ResumeTemplateProvider {
    static defaultCss = `#resume * {
    /* Set all margins to zero, and then re-set them later */
    margin: 0;
}

#resume img {
    /** Prevent images from overflowing */
    max-width: 100%;
    max-height: 100%;
}

/** Sections with Header on Left **/
section.header-left h2 {
    width: 20%;
    flex-shrink: 0;
    flex-grow: 0;
}`;
   

    static templates = {
        "Assured": () => {
            let data: ResumeSaveData = {
                builtinCss: assuredCss(),
                children: assignIds(assuredNodes()),
                css: `#resume * {\n    /* Set all margins to zero, and then re-set them later */\n    margin: 0;\n}\n\n#resume img {\n    /** Prevent images from overflowing */\n    max-width: 100%;\n    max-height: 100%;\n}\n\n#resume .entry hgroup h4.subtitle .field-1:not(.field-last):before {\n    content: \"|\";\n    padding: 0 0.5em;\n}\n\n#resume .entry hgroup h4.subtitle .field-last {\n    margin-left: auto;\n    text-align: right;\n}\n\n/** Sections with Header on Left **/\nsection.header-left h2 {\n    width: 20%;\n    flex-shrink: 0;\n    flex-grow: 0;\n}\n\n#resume header hgroup {\n    font-family: Merriweather, serif;\n}\n\n#resume header .rich-text {\n    margin-left: 2em;\n    text-align: right;\n    font-size: 10pt;\n}\n\n#resume header .rich-text:first-of-type {\n    margin-left: auto;\n}\n\n#resume header img {\n    height: 24px;\n    vertical-align: middle;\n}\n\n#resume #sidebar h4.subtitle .field {\n    white-space: nowrap;\n}\n\n#resume #sidebar section {\n    margin-bottom: 16px;\n}\n\n#resume h3.title .field-0 {\n    margin-right: auto;\n}`
            };

            return data;
        },

        "Integrity": () => {
            let data: ResumeSaveData = {
                builtinCss: randyMarshCss().dump(),
                children: assignIds([ randyMarsh() ]),
                css: `${ResumeTemplateProvider.defaultCss}

#resume #sidebar h2 {
    color: #43353f;
}`
            };

            return data;
        }
    }
}
import { assignIds } from "../Helpers";
import { randyMarshCss, randyMarsh } from "./RandyMarsh";
import { ResumeSaveData } from "../controls/ResumeState";
import { assuredNodes, assuredCss } from "./Assured";

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
#resume section.header-left h2 {
    width: 20%;
    flex-shrink: 0;
    flex-grow: 0;
}
`;
   
    static templates = {
        "Assured": () => {
            let data: ResumeSaveData = {
                builtinCss: assuredCss().dump(),
                children: assignIds(assuredNodes()),
                css: `${ResumeTemplateProvider.defaultCss}

#resume header .rich-text {
    text-align: right;
    font-size: 10pt;
}

#resume header .icon {
    height: 24px;
    vertical-align: middle;
}
`
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
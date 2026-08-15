import { assignIds } from "@/shared/utils/assignIds";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";
import { streamlineNodes, streamlineCss, streamlineRootCss } from "./Streamline";
import { streamlineCoverLetterNodes, streamlineCoverLetterCss } from "./StreamlineCoverLetter";
import { ResumeSaveData } from "@/types";
import { assuredCoverLetterNodes, assuredCoverLetterCss } from "./AssuredCoveredLetter";
import { integrityCoverLetterNodes, integrityCoverLetterCss } from "./IntegrityCoverLetter";
import PageSize from "@/types/PageSize";
import { withTemplateFonts } from "@/shared/fonts/templateFonts";

/** Creates ID-assigned save data while allowing development renderers to inject fixture dates. */
export function createResumeTemplates(coverLetterDate?: string) {
    return {
        "Assured": withTemplateFonts({
            builtinCss: assuredCss().dump(),
            childNodes: assignIds(assuredNodes()),
            rootCss: assuredRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Assured: Cover Letter": withTemplateFonts({
            builtinCss: assuredCoverLetterCss().dump(),
            childNodes: assignIds(assuredCoverLetterNodes(coverLetterDate)),
            rootCss: assuredRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Integrity": withTemplateFonts({
            builtinCss: randyMarshCss().dump(),
            childNodes: assignIds(randyMarsh()),
            rootCss: randyMarshRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Integrity: Cover Letter": withTemplateFonts({
            builtinCss: integrityCoverLetterCss().dump(),
            childNodes: assignIds(integrityCoverLetterNodes(coverLetterDate)),
            rootCss: randyMarshRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Streamline": withTemplateFonts({
            builtinCss: streamlineCss().dump(),
            childNodes: assignIds(streamlineNodes()),
            rootCss: streamlineRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Streamline: Cover Letter": withTemplateFonts({
            builtinCss: streamlineCoverLetterCss().dump(),
            childNodes: assignIds(streamlineCoverLetterNodes(coverLetterDate)),
            rootCss: streamlineRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData)
    };
}

/** Provides the interactive product's current-date built-in template catalog. */
export default class ResumeTemplates {
    static templates = createResumeTemplates();
}

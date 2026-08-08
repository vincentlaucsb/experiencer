import { assignIds } from "@/shared/utils/assignIds";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";
import { streamlineNodes, streamlineCss, streamlineRootCss } from "./Streamline";
import { streamlineCoverLetterNodes, streamlineCoverLetterCss } from "./StreamlineCoverLetter";
import { ResumeSaveData } from "@/types";
import { assuredCoverLetterNodes, assuredCoverLetterCss } from "./AssuredCoveredLetter";
import PageSize from "@/types/PageSize";
import { withTemplateFonts } from "@/shared/fonts/templateFonts";

/** Provides ID-assigned save data for the built-in OSS templates. */
export default class ResumeTemplates {
    static templates = {
        "Assured": withTemplateFonts({
            builtinCss: assuredCss().dump(),
            childNodes: assignIds(assuredNodes()),
            rootCss: assuredRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Assured: Cover Letter": withTemplateFonts({
            builtinCss: assuredCoverLetterCss().dump(),
            childNodes: assignIds(assuredCoverLetterNodes()),
            rootCss: assuredRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData),

        "Integrity": withTemplateFonts({
            builtinCss: randyMarshCss().dump(),
            childNodes: assignIds(randyMarsh()),
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
            childNodes: assignIds(streamlineCoverLetterNodes()),
            rootCss: streamlineRootCss().dump(),
            pageSize: PageSize.Letter
        } as ResumeSaveData)
    }
}

import { assignIds } from "@/shared/utils/assignIds";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";
import { streamlineNodes, streamlineCss, streamlineRootCss } from "./Streamline";
import { streamlineCoverLetterNodes, streamlineCoverLetterCss } from "./StreamlineCoverLetter";
import { ResumeSaveData } from "@/types";
import { assuredCoverLetterNodes, assuredCoverLetterCss } from "./AssuredCoveredLetter";

export default class ResumeTemplates {
    static templates = {
        "Assured": {
            builtinCss: assuredCss().dump(),
            childNodes: assignIds(assuredNodes()),
            rootCss: assuredRootCss().dump()
        } as ResumeSaveData,

        "Assured: Cover Letter": {
            builtinCss: assuredCoverLetterCss().dump(),
            childNodes: assignIds(assuredCoverLetterNodes()),
            rootCss: assuredRootCss().dump()
        } as ResumeSaveData,

        "Integrity": {
            builtinCss: randyMarshCss().dump(),
            childNodes: assignIds(randyMarsh()),
            rootCss: randyMarshRootCss().dump()
        } as ResumeSaveData,

        "Streamline": {
            builtinCss: streamlineCss().dump(),
            childNodes: assignIds(streamlineNodes()),
            rootCss: streamlineRootCss().dump()
        } as ResumeSaveData,

        "Streamline: Cover Letter": {
            builtinCss: streamlineCoverLetterCss().dump(),
            childNodes: assignIds(streamlineCoverLetterNodes()),
            rootCss: streamlineRootCss().dump()
        } as ResumeSaveData
    }
}
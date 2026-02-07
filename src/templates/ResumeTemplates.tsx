import { assignIds } from "@/shared/utils/Helpers";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";
import { ResumeSaveData } from "@/shared/utils/Types";
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
        } as ResumeSaveData
    }
}
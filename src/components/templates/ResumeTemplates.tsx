import { assignIds } from "../Helpers";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";
import { ResumeSaveData } from "../utility/Types";

export default class ResumeTemplates {
    static templates = {
        "Assured": {
            builtinCss: assuredCss().dump(),
            childNodes: assignIds(assuredNodes()),
            rootCss: assuredRootCss().dump()
        } as ResumeSaveData,

        "Integrity": {
            builtinCss: randyMarshCss().dump(),
            childNodes: assignIds(randyMarsh()),
            rootCss: randyMarshRootCss().dump()
        } as ResumeSaveData
    }
}
import { assignIds } from "../Helpers";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { ResumeSaveData } from "../controls/ResumeState";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";

export default class ResumeTemplateProvider {
    static templates = {
        "Assured": () => {
            let data: ResumeSaveData = {
                builtinCss: assuredCss().dump(),
                childNodes: assignIds(assuredNodes()),
                rootCss: assuredRootCss().dump()
            };

            return data;
        },

        "Integrity": () => {
            let data: ResumeSaveData = {
                builtinCss: randyMarshCss().dump(),
                childNodes: assignIds(randyMarsh()),
                rootCss: randyMarshRootCss().dump()
            };

            return data;
        }
    }
}
import { assignIds } from "../Helpers";
import { randyMarshCss, randyMarsh, randyMarshRootCss } from "./RandyMarsh";
import { ResumeSaveData } from "../controls/ResumeState";
import { assuredNodes, assuredCss, assuredRootCss } from "./Assured";

export default class ResumeTemplateProvider {
    static templates = {
        "Assured": () => {
            let data: ResumeSaveData = {
                builtinCss: assuredCss().dump(),
                children: assignIds(assuredNodes()),
                rootCss: assuredRootCss().dump()
            };

            return data;
        },

        "Integrity": () => {
            let data: ResumeSaveData = {
                builtinCss: randyMarshCss().dump(),
                children: assignIds(randyMarsh()),
                rootCss: randyMarshRootCss().dump()
            };

            return data;
        }
    }
}
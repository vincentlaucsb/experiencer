import { assignIds } from "../Helpers";
import { randyMarshCss, randyMarsh } from "./RandyMarsh";
import { ResumeSaveData } from "../controls/ResumeState";
import { assuredNodes, assuredCss } from "./Assured";

export default class ResumeTemplateProvider {
    static templates = {
        "Assured": () => {
            let data: ResumeSaveData = {
                builtinCss: assuredCss().dump(),
                children: assignIds(assuredNodes()),
                css: ''
            };

            return data;
        },

        "Integrity": () => {
            let data: ResumeSaveData = {
                builtinCss: randyMarshCss().dump(),
                children: assignIds([ randyMarsh() ]),
                css: ''
            };

            return data;
        }
    }
}
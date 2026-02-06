import React from "react";
import { IdType } from "./utility/Types";

export interface IResumeContext {
    isPrinting: boolean;
    updateSelectedRef: (ref: React.RefObject<any>) => void;

    /** Tell parent we have been clicked */
    updateClicked: (id: IdType) => void;
}

const defaultResumeContext: IResumeContext = {
    isPrinting: false,
    updateSelectedRef: (_) => { },

    // Push a node ID to the list of nodes that were clicked
    updateClicked: (_) => { }
}

const ResumeContext = React.createContext(defaultResumeContext);

export default ResumeContext;
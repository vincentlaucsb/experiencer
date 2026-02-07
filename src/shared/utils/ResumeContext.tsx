import React from "react";
import { IdType } from "@/types";

export interface IResumeContext {
    isPrinting: boolean;

    /** Tell parent we have been clicked */
    updateClicked: (id: IdType) => void;
}

const defaultResumeContext: IResumeContext = {
    isPrinting: false,

    // Push a node ID to the list of nodes that were clicked
    updateClicked: (_) => { }
}

const ResumeContext = React.createContext(defaultResumeContext);

export default ResumeContext;
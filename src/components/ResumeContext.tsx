import React from "react";
import { IdType } from "./utility/Types";

export interface IResumeContext {
    isEditingSelected: boolean;
    selectedUuid?: string;
    updateSelectedRef: (ref: React.RefObject<any>) => void;

    /** Tell parent we have been clicked */
    updateClicked: (id: IdType) => void;
}

const defaultResumeContext: IResumeContext = {
    isEditingSelected: false,
    selectedUuid: undefined,
    updateSelectedRef: (_) => { },

    // Push a node ID to the list of nodes that were clicked
    updateClicked: (_) => { }
}

const ResumeContext = React.createContext(defaultResumeContext);

export default ResumeContext;
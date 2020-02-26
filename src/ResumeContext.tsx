import React from "react";
import { IdType } from "./components/utility/Types";

interface IResumeContext {
    isEditingSelected: boolean;
    selectedUuid?: string;
    updateClicked: (id: IdType) => void;
}

const defaultResumeContext: IResumeContext = {
    isEditingSelected: false,
    selectedUuid: undefined,

    // Push a node ID to the list of nodes that were clicked
    updateClicked: (_) => { }
}

const ResumeContext = React.createContext(defaultResumeContext);

export default ResumeContext;
import React from "react";

interface IResumeContext {
    isEditingSelected: boolean;
    selectedUuid?: string;
}

const defaultResumeContext: IResumeContext = {
    isEditingSelected: false,
    selectedUuid: undefined
}

const ResumeContext = React.createContext(defaultResumeContext);

export default ResumeContext;
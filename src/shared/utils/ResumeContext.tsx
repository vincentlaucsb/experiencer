import React from "react";

export interface IResumeContext {
    isPrinting: boolean;
}

const defaultResumeContext: IResumeContext = {
    isPrinting: false,
}

const ResumeContext = React.createContext(defaultResumeContext);

export default ResumeContext;
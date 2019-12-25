import React from "react";

interface LandingProps {
    className?: string;
    loadLocal: () => void;
}

export default function Landing(props: LandingProps) {
    return <div id="landing">
        <h2>Getting Started</h2>
        <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>
        <p>Click on the <strong>New</strong> button in the top left to get started. Once you start
            editing your resume, a <strong>Help</strong> button with more information will appear (also in the top left).</p>
        <ul>
            <li onClick={() => props.loadLocal()}>Return to editing resume</li>
            <li>New</li>
            <li>Load</li>
        </ul>
    </div>
}
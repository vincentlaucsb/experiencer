import HelpPage, { HelpPageActions } from "./HelpPage";
import React from "react";
import { Button } from "react-bootstrap";

export default function StartHelp(props: HelpPageActions) {
    return <HelpPage title="Getting Started" {...props}>
        <h3>Selecting a Template</h3>
        <ul>
            <li>To create a resume, click the <strong>New</strong> button in the upper left of your screen.</li>
            <li>A menu with different template options will pop up on the right. Don't get too hung up on any specific template, as you
            can always change the details of your layout later.
            </li>
            <li>Click on <Button size="sm">Use this Template</Button> to start editing.</li>
        </ul>
    
        <h3>Editing Your Resume</h3>
        <ul>
            <li>You can edit different parts of the resume by clicking on them and using the Editing Toolbar that appears.</li>
            <li>Every resume component is different, but they all have basic controls such as the ability to move them up and down,
                and delete them.</li>
        </ul>
    </HelpPage>
}
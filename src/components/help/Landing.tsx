import React from "react";
import { Button } from "react-bootstrap";

interface LandingProps {
    className?: string;
}

export default function Landing(props: LandingProps) {
    return <div id="help" className={props.className}>
        <h2>Getting Started</h2>
        <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>

        <h3>Creating and Editing Resumes</h3>
        <ul>
            <li>Getting Started
                            <ul>
                    <li>Selecting a Template
                                    <ul>
                            <li>To create a resume, click the <strong>New</strong> button in the upper left of your screen.</li>
                            <li>A menu with different template options will pop up on the right. Don't get too hung up on any specific template, as you
                                can always change the details of your layout later.
                                        </li>
                            <li>Click on <Button size="sm">Use this Template</Button> to start editing.</li>
                        </ul>
                    </li>
                    <li>Editing Your Resume
                                    <ul>
                            <li>You can edit different parts of the resume by clicking on them and using the Editing Toolbar that appears.</li>
                            <li>Every resume component is different, but they all have basic controls such as the ability to move them up and down,
                                            and delete them.</li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li>Printing Your Resume
                            <ul>
                    <li>At any time while editing your resume, you can toggle back and forth between editing and <strong>Print Mode</strong> by
                                    using the shortcut <strong>Shift + P</strong>.</li>
                    <li><strong>Print Mode</strong> displays a print-friendly version of your resume without any margins (unless you add them
                                    yourself).</li>
                </ul>
            </li>
        </ul>
    </div>
}
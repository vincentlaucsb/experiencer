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
            <li>Saving an HTML or PDF Copy
                            <ul>
                    <li>HTML: To save an HTML copy, switch into Print Mode and then use your browser's "Save As" or "Save Page As" functionality.</li>
                    <li>PDF: To save a PDF copy, begin by switching into Print Mode and using your browser's "Print" function.
                                    <ul>
                            <li>If on Windows, you can select "Microsoft Print to PDF" as your printer to save a PDF copy. This works on Edge, Firefox, Chrome, and so on.</li>
                            <li>You may want to adjust your browser's print settings to remove unnecessary headers and adjust margins.</li>
                            <li>For <strong>Scale</strong>, "Shrink to Fit" or "100%" should work fine.</li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li>Saving Your Resume For Later
                            <ul>
                    <li>Click the <strong>Save to File</strong> button in the top left of your screen at any time to save your resume
                        for editing later.
                                </li>
                    <li>After typing in your desired file name, click the <Button size="sm" variant="outline-dark">Save</Button> button to download your file.</li>
                    <li>When you return, you can click the <strong>Load</strong> button in the top left (next to the Save to File button)
                                    to load your resume.</li>
                </ul>
            </li>
        </ul>
    </div>
}
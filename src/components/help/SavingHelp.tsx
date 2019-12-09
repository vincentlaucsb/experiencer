import HelpPage, { HelpPageActions } from "./HelpPage";
import React from "react";
import { Button } from "react-bootstrap";

export default function SavingHelp(props: HelpPageActions) {
    return <HelpPage title="Saving and Printing" {...props}>
        <h3>Printing</h3>
        <ul>
            <li>At any time while editing your resume, you can toggle back and forth between editing and <strong>Print Mode</strong> by
            using the shortcut <strong>Shift + P</strong>.</li>
            <li><strong>Print Mode</strong> displays a print-friendly version of your resume without any margins (unless you add them
            yourself).</li>
        </ul>

        <h3>Saving an HTML or PDF Copy</h3>
        <ul>
            <li><strong>HTML:</strong> To save an HTML copy, switch into Print Mode and then use your browser's "Save As" or "Save Page As" functionality.</li>
            <li><strong>PDF:</strong> To save a PDF copy, begin by switching into Print Mode and using your browser's "Print" function.
                <ul>
                <li>If on Windows, you can select "Microsoft Print to PDF" as your printer to save a PDF copy. This works on Edge, Firefox, Chrome, and so on.</li>
                <li>You may want to adjust your browser's print settings to remove unnecessary headers and adjust margins.</li>
                <li>For <strong>Scale</strong>, "Shrink to Fit" or "100%" should work fine.</li>
                </ul>
            </li>
        </ul>

        <h3>Editing Later</h3>
        <ul>
            <li>Click the <strong>Save to File</strong> button in the top left of your screen at any time to save your resume
            for editing later.
            </li>
            <li>After typing in your desired file name, click the <Button size="sm" variant="outline-dark">Save</Button> button to download your file.</li>
            <li>When you return, you can click the <strong>Load</strong> button in the top left (next to the Save to File button)
            to load your resume.</li>
        </ul>
    </HelpPage>
}
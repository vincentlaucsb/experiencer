import * as React from "react";
import Popover from 'react-tiny-popover';
import { Button } from "./Buttons";

interface htmlIdAdderProps {
    htmlId?: string;
    cssClasses?: string;
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;
}

export default function HtmlIdAdder(props: htmlIdAdderProps) {
    let [htmlId, setHtmlId] = React.useState(props.htmlId || "");
    let [cssClasses, setCssClasses] = React.useState(props.cssClasses || "");
    let [isOpen, setOpen] = React.useState(false);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHtmlId(event.target.value);
    }

    const onCssChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCssClasses(event.target.value);
    }

    const expanded = (
        <form id="html-id-adder">
            <input type="text" onChange={onChange} value={htmlId} />
            <input type="text" onChange={onCssChange} value={cssClasses} />

            <Button onClick={() => {
                props.addHtmlId(htmlId);
                props.addCssClasses(cssClasses);
                setOpen(false);
            }}>Save</Button>
        </form>
    );

    return (
        <Popover
            containerClassName="resume-popover"
            isOpen={isOpen}
            position="bottom"
            content={expanded}>
            <Button
                onClick={() => setOpen(!isOpen)}>
                Set HTML ID
            </Button>
        </Popover>
    );
}
import * as React from "react";
import Popover from 'react-tiny-popover';
import { Button } from "./Buttons";

interface htmlIdAdderProps {
    htmlId?: string;
    addHtmlId: (htmlId: string) => void;
}

export default function HtmlIdAdder(props: htmlIdAdderProps) {
    let [htmlId, setHtmlId] = React.useState(props.htmlId || "");
    let [isOpen, setOpen] = React.useState(false);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHtmlId(event.target.value);
    }

    const expanded = (
        <form id="css-id-adder">
            <input type="text" onChange={onChange} value={htmlId} />
            <Button onClick={() => {
                props.addHtmlId(htmlId);
                setOpen(false);
            }}>Save</Button>
        </form>
    );

    return (
        <Popover
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
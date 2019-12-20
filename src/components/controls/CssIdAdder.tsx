import * as React from "react";
import Popover from 'react-tiny-popover';
import { Button } from "./Buttons";

interface CssIdAdderProps {
    cssId?: string;
    addHtmlId: (htmlId: string) => void;
}

export default function CssIdAdder(props: CssIdAdderProps) {
    let [cssId, setCssId] = React.useState(props.cssId || "");
    let [isOpen, setOpen] = React.useState(false);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCssId(event.target.value);
    }

    const expanded = (
        <form id="css-id-adder">
            <input type="text" onChange={onChange} value={cssId} />
            <Button onClick={() => {
                props.addHtmlId(cssId);
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
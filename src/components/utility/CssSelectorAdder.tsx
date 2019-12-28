import { Button } from "../controls/Buttons";
import TextField from "../controls/inputs/TextField";
import React from "react";
import Popover from "react-tiny-popover";
import { AddIcon } from "../controls/InterfaceIcons";

export interface CssSelectorAdderProps {
    addSelector: (name: string, selector: string) => void;
    selector: string;
}

export default function CssSelectorAdder(props: CssSelectorAdderProps) {
    let [isOpen, setOpen] = React.useState(false);
    let [selector, setSelector] = React.useState("");
    let [name, setName] = React.useState("");

    const handleSubmit = (event) => {
        props.addSelector(name, selector);
    };

    let form = (
        <div onClick={(event) => event.stopPropagation()}
            style={{ background: "white" }}>
            <h3>Add Selector</h3>
            <h4>
                {props.selector} <TextField
                    value={selector}
                    onChange={(text) => setSelector(text)}
                />
            </h4>
            <p>Name: <TextField
                value={name}
                onChange={(text) => setName(text)}
                />
            </p>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );

    return (
        <Popover containerClassName="css-selector-adder"
            content={form} isOpen={isOpen}>
            <Button onClick={() => { setOpen(!isOpen) }}>
                <AddIcon />
            </Button>
        </Popover>
    )
}
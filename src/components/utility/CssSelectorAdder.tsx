import { Button } from "../controls/Buttons";
import ResumeTextField from "../controls/inputs/TextField";
import React from "react";
import Popover from "react-tiny-popover";

export interface CssSelectorAdderProps {
    addSelector: (name: string, selector: string) => void;
    selector: string;
}

export default function CssSelectorAdder(props: CssSelectorAdderProps) {
    let [isOpen, setOpen] = React.useState(false);
    let [selector, setSelector] = React.useState("");
    let [name, setName] = React.useState("");
    let [isEditing, setEditing] = React.useState(false);

    const handleSubmit = (event) => {
        props.addSelector(name, selector);
    };

    let form = (
        <div onClick={(event) => event.stopPropagation()}
            style={{ background: "white" }}>
            <h3>Add Selector</h3>
            <h4>
                {props.selector} <ResumeTextField
                    isEditing={isEditing}
                    value={selector}
                    onChange={(text) => setSelector(text)}
                    onClick={() => {
                        setEditing(!isEditing);
                    }}
                    onEnterDown={() => {
                        setEditing(!isEditing);
                    }}
                />
            </h4>
            <p>Name: <ResumeTextField
                isEditing={isEditing}
                value={name}
                onChange={(text) => setName(text)}
                onClick={() => {
                    setEditing(!isEditing);
                }}
                onEnterDown={() => {
                    setEditing(!isEditing);
                }}
                />
            </p>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );

    return (
        <Popover content={form} isOpen={isOpen}>
            <Button onClick={(event) => {
                setOpen(!isOpen);
                event.stopPropagation();
            }}> +</Button>
        </Popover>
    )
}
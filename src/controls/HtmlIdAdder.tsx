import * as React from "react";
import { Popover } from 'react-tiny-popover';
import { Button } from "./Buttons";
import ToolbarButton from "./toolbar/ToolbarButton";

import "./HtmlIdAdder.scss";

interface htmlIdAdderProps {
    htmlId?: string;
    cssClasses?: string;
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;
}

function sanitizeHtmlId(value: string) {
    return value.replace(/#/g, '').replace(/\s+/g, '');
}

export default function HtmlIdAdder(props: htmlIdAdderProps) {
    let [htmlId, setHtmlId] = React.useState(props.htmlId || "");
    let [cssClasses, setCssClasses] = React.useState(props.cssClasses || "");
    let [isOpen, setOpen] = React.useState(false);;
    let [idValid, setIdValid] = React.useState(true);
    let [classesValid, setClassesValid] = React.useState(true);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextHtmlId = sanitizeHtmlId(event.target.value);
        setHtmlId(nextHtmlId);

        if (nextHtmlId.length === 0) {
            setIdValid(true);
            return;
        }

        try {
            document.querySelector(`#${nextHtmlId}`);
            setIdValid(true);
        }
        catch {
            setIdValid(false);
        }
    }

    const onCssChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCssClasses(event.target.value);

        try {
            const classNames = ((event.target.value).split(' ')).map((className) => className.trim()).join('.');
            document.querySelector(`.${classNames}`);
            setClassesValid(true);
        }
        catch {
            setClassesValid(false);
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
        if (idValid) {
            props.addHtmlId(htmlId);
        }

        if (classesValid) {
            props.addCssClasses(cssClasses);
        }

        setOpen(false);

        event.preventDefault();
    }

    const htmlIdInputClass = idValid ? "" : "invalid";
    const classNameInputClass = classesValid ? "" : "invalid";

    const expanded = (
        <form
            className="pure-form pure-form-aligned"
            data-testid="html-id-adder-form"
            id="html-id-adder"
            onSubmit={handleSubmit}
        >
            <div className="pure-control-group" id="html-id-group">
                <label htmlFor="html-id">ID</label>
                <div className="html-id-input">
                    <span className="html-id-prefix" data-testid="html-id-prefix" aria-hidden="true">#</span>
                    <input
                        data-testid="html-id-input"
                        id="html-id"
                        className={htmlIdInputClass}
                        type="text"
                        onChange={onChange}
                        value={htmlId}
                    />
                </div>
            </div>

            <div className="pure-control-group" id="css-classes-group">
                <label htmlFor="css-classes">Classes</label>
                <input
                    data-testid="css-classes-input"
                    id="css-classes"
                    className={classNameInputClass}
                    type="text"
                    onChange={onCssChange}
                    value={cssClasses}
                />
            </div>

            <div className="pure-controls">
                <Button data-testid="html-id-save" type="submit">Save</Button>
            </div>
        </form>
    );

    return (
        <Popover
            containerClassName="resume-popover"
            isOpen={isOpen}
            positions={"bottom"}
            content={expanded}>
            <span data-testid="html-id-adder-trigger">
                <ToolbarButton
                    onClick={() => setOpen(!isOpen)}
                    icon="ui-tag"
                    text="Add ID/Classes"
                />
            </span>
        </Popover>
    );
}
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
    let [isOpen, setOpen] = React.useState(false);;
    let [idValid, setIdValid] = React.useState(true);
    let [classesValid, setClassesValid] = React.useState(true);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHtmlId(event.target.value);

        try {
            document.querySelector(`#${event.target.value}`);
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
        <form className="pure-form pure-form-aligned" id="html-id-adder" onSubmit={handleSubmit}>
            <div className="pure-control-group">
                <label htmlFor="html-id">ID</label>
                <input id="html-id" className={htmlIdInputClass} type="text" onChange={onChange} value={htmlId} />
            </div>

            <div className="pure-control-group">
                <label htmlFor="css-classes">Classes</label>
                <input id="css-classes" className={classNameInputClass} type="text" onChange={onCssChange} value={cssClasses} />
            </div>

            <div className="pure-controls">
                <Button type="submit">Save</Button>
            </div>
        </form>
    );

    return (
        <Popover
            containerClassName="resume-popover"
            isOpen={isOpen}
            position="bottom"
            content={expanded}>
            <Button
                className="button-text"
                onClick={() => setOpen(!isOpen)}>
                <i className="icofont-ui-tag" />
                Add ID/Classes
            </Button>
        </Popover>
    );
}
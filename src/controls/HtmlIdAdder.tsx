import * as React from "react";
import { Popover } from 'react-tiny-popover';
import { Button } from "./Buttons";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import ToolbarButton from "./toolbar/ToolbarButton";
import { getCssClassesError, getHtmlIdError } from '@/shared/utils/validateNodeCssNames';

import "./HtmlIdAdder.scss";

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
    const idError = getHtmlIdError(htmlId);
    const classesError = getCssClassesError(cssClasses);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (idError || classesError) return;
        props.addHtmlId(htmlId);
        props.addCssClasses(cssClasses);
        setOpen(false);
    }

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
                        {...nonCredentialInputAttributes}
                        data-testid="html-id-input"
                        id="html-id"
                        className={idError ? 'invalid' : ''}
                        aria-invalid={Boolean(idError)}
                        aria-describedby={idError ? 'html-id-error' : undefined}
                        type="text"
                        onChange={event => setHtmlId(event.target.value)}
                        value={htmlId}
                    />
                </div>
            </div>
            {idError && <span id="html-id-error" role="alert" className="input-validation-error">{idError}</span>}

            <div className="pure-control-group" id="css-classes-group">
                <label htmlFor="css-classes">Classes</label>
                <input
                    {...nonCredentialInputAttributes}
                    data-testid="css-classes-input"
                    id="css-classes"
                    className={classesError ? 'invalid' : ''}
                    aria-invalid={Boolean(classesError)}
                    aria-describedby={classesError ? 'css-classes-error' : undefined}
                    type="text"
                    onChange={event => setCssClasses(event.target.value)}
                    value={cssClasses}
                />
                {classesError && <span id="css-classes-error" role="alert" className="input-validation-error">{classesError}</span>}
            </div>

            <div className="pure-controls">
                <Button data-testid="html-id-save" type="submit" variant="primary" disabled={Boolean(idError || classesError)}>Save</Button>
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

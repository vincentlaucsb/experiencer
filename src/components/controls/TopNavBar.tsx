import { Action } from "../ResumeComponent";
import React from "react";
import { ButtonProps, ButtonGroup, Button, Navbar, Nav } from "react-bootstrap";
import FileLoader from "./FileLoader";
import FileSaver from "./FileSaver";
import GitHub from '../../icons/mark-github.svg';
import { EditorMode } from "../LoadComponent";
import { isUndefined } from "util";

interface TopNavBarProps {
    mode: EditorMode;

    /** Loading and Saving */
    loadData: (data: object) => void;
    saveFile: (filename: string) => void;

    /** Clipboard Actions */
    copyClipboard?: Action;
    pasteClipboard?: Action;
    unselect?: Action;

    /** Sidebar Actions */
    changeTemplate: Action;
    toggleStyleEditor: Action;
}

/** The top nav bar for the resume editor */
export default class TopNavBar extends React.Component<TopNavBarProps> {
    constructor(props) {
        super(props);
    }

    get isEditingStyle(): boolean {
        return this.props.mode == 'editingStyle';
    }

    get isPrinting(): boolean {
        return this.props.mode == 'printing';
    }

    /** Conditionally render buttons
     * @param onClick Click action if button is enabled
     */
    getProps(onClick?: any) {
        const enabled = !isUndefined(onClick);

        let props = {
            disabled: !enabled,
            variant: "outline-light" as ButtonProps["variant"]
        };

        if (enabled) {
            props['onClick'] = onClick;
        }

        return props;
    }

    render() {
        const copyProps = this.getProps(this.props.copyClipboard);
        const pasteProps = this.getProps(this.props.pasteClipboard);
        const unselectProps = this.getProps(this.props.unselect);

        // Highlight "Edit Style" button conditionally
        const editStyleProps = {
            onClick: this.props.toggleStyleEditor,
            variant: this.isEditingStyle ? "light" : "outline-light" as ButtonProps["variant"]
        };

        if (!this.isPrinting) {
            return <Navbar bg="dark" variant="dark" sticky="top">
                <Navbar.Brand>
                    Experiencer
                </Navbar.Brand>
                <Nav>
                    <Nav.Link onClick={this.props.changeTemplate}>New</Nav.Link>
                    <FileLoader loadData={this.props.loadData} />
                    <FileSaver saveFile={this.props.saveFile} />
                </Nav>
                <Nav className="mr-auto">
                    <Nav.Link onClick={() => this.setState({ mode: 'landing' })}>Help</Nav.Link>
                </Nav>

                <ButtonGroup className="mr-2">
                    <Button {...copyProps}>Copy</Button>
                    <Button {...pasteProps}>Paste</Button>
                    <Button {...unselectProps}>Unselect</Button>
                </ButtonGroup>
                <ButtonGroup className="mr-2">
                    <Button {...editStyleProps}>Edit Style</Button>
                </ButtonGroup>

                <Nav>
                    <Nav.Link href="https://github.com/vincentlaucsb/experiencer"><img src={GitHub} style={{ filter: "invert(1)", height: "30px" }} alt="GitHub" /></Nav.Link>
                </Nav>
            </Navbar>
        }

        return <></>
    }
}
import React from "react";
import PureMenu, { PureMenuItem } from "../controls/menus/PureMenu";
import FileLoader from "../controls/FileLoader";
import Modal from "../controls/Modal";
import { Globals, Action } from "../utility/Types";
import { Button } from "../controls/Buttons";

interface LandingProps {
    className?: string;
    loadLocal: () => void;
    loadData: (data: object) => void;
    new: () => void;
}

function MenuItem (props: {
    children: React.ReactNode;
    icon: string;
    onClick: Action;
}) {
    return <PureMenuItem>
        <Button onClick={props.onClick}>
            <i className={`icofont-${props.icon}`} />
            {props.children}
        </Button>
    </PureMenuItem>
};

export default function Landing(props: LandingProps) {
    let [isOpen, setOpen] = React.useState(false);
    let modalContent = <FileLoader close={() => setOpen(false)} loadData={props.loadData} />

    const returnButton = (localStorage.getItem(Globals.localStorageKey)) ?
        <MenuItem onClick={props.loadLocal} icon="hand-drawn-alt-left">
            Return to editing resume
        </MenuItem> : <></>

    return (
        <>
            <Modal title="Load File" isOpen={isOpen} close={() => setOpen(false)} className="landing-modal">
                {modalContent}
            </Modal>
            <div id="landing">
                <h2>Getting Started</h2>
                <p>Welcome to Experiencer, a powerful tool that can help you create attractive resumes.</p>
                <p>Click on the <strong>New</strong> button in the top left to get started. Once you start
                    editing your resume, a <strong>Help</strong> button with more information will appear (also in the top left).</p>
                <PureMenu divProps={{ className: "landing-menu" }}>
                    {returnButton}
                    <MenuItem onClick={() => props.new()} icon="paper">New</MenuItem>
                    <MenuItem onClick={() => setOpen(true)} icon="folder-open">Load</MenuItem>
                </PureMenu>
            </div>
        </>
    );
}
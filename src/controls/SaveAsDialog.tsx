import * as React from "react";

import FileSaver from "@/controls/FileSaver";
import Modal from "@/controls/Modal";
import { saveFile as saveResumeFile } from "@/shared/stores/saveResume";
import {
    saveAsDialogStore,
    type SaveAsDialogStore
} from "@/shared/stores/saveAsDialogStore";

export interface SaveAsDialogProps {
    isEditing: boolean;
    saveFile?: (filename: string) => void;
    store?: SaveAsDialogStore;
}

/** Renders the shared Save As dialog and bridges editing availability into its store. */
export default function SaveAsDialog(props: SaveAsDialogProps) {
    const store = props.store ?? saveAsDialogStore;
    const snapshot = React.useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getSnapshot
    );

    React.useEffect(() => {
        store.setAvailable(props.isEditing);
        return () => store.setAvailable(false);
    }, [props.isEditing, store]);

    return (
        <Modal
            isOpen={props.isEditing && snapshot.isOpen}
            title="Save File"
            close={store.close}
            className="top-nav-modal"
        >
            <FileSaver
                close={store.close}
                saveFile={props.saveFile ?? saveResumeFile}
            />
        </Modal>
    );
}

import React from "react";

import { Button } from "@/controls/Buttons";
import Modal from "@/controls/Modal";

export type PngExportPhase = "loading" | "ready" | "error";
export type PngCopyPhase = "idle" | "copying" | "copied" | "error";

export interface PngExportModalProps {
    isOpen: boolean;
    phase: PngExportPhase;
    imageUrl?: string;
    errorMessage?: string;
    copyPhase: PngCopyPhase;
    onClose: () => void;
    onCopy: () => void;
    onDownload: () => void;
}

/** Presents PNG export progress and actions while leaving capture orchestration to the host. */
export default function PngExportModal(props: PngExportModalProps) {
    return (
        <Modal
            className="png-export-modal"
            close={props.onClose}
            isOpen={props.isOpen}
            title="Resume screenshot"
        >
            <div className="png-export-content">
                <p className="png-export-purpose">
                    PNG is primarily for quick visual review, including AI-assisted review. Use PDF for final presentation or printing.
                </p>
                {props.phase === "loading" ? (
                    <div className="png-export-status" role="status" aria-live="polite" aria-busy="true">
                        <p>Generating PNG…</p>
                        <p className="png-export-status-detail">This may take a few seconds.</p>
                        <Button type="button" onClick={props.onClose} autoFocus>
                            Cancel
                        </Button>
                    </div>
                ) : props.phase === "error" ? (
                    <div className="png-export-status" role="alert">
                        <p>{props.errorMessage ?? "Could not generate the PNG."}</p>
                        <Button type="button" onClick={props.onClose} autoFocus>
                            Close
                        </Button>
                    </div>
                ) : (
                    <div className="png-export-result">
                        <div className="png-export-image-frame">
                            <img src={props.imageUrl} alt="Resume screenshot preview" />
                        </div>
                        <div className="png-export-actions">
                            <Button
                                type="button"
                                onClick={props.onCopy}
                                disabled={props.copyPhase === "copying"}
                            >
                                {props.copyPhase === "copying" ? "Copying…" : "Copy to Clipboard"}
                            </Button>
                            <Button type="button" variant="primary" onClick={props.onDownload}>
                                Download
                            </Button>
                            <Button type="button" onClick={props.onClose}>
                                Close
                            </Button>
                        </div>
                        {props.copyPhase === "copied" && (
                            <p className="png-export-feedback" role="status">Copied to clipboard.</p>
                        )}
                        {props.copyPhase === "error" && (
                            <p className="png-export-feedback" role="alert">
                                Clipboard access was unavailable. Try downloading the PNG instead.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}

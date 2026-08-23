import {
    ResumeHotKeyMap,
    ResumeHotKeys,
    type ResumeHotKeysProps
} from "@/controls/ResumeHotkeys";
import { saveAsDialogStore } from "@/shared/stores/saveAsDialogStore";

const props: ResumeHotKeysProps = {
    copyClipboard: jest.fn(),
    cutClipboard: jest.fn(),
    delete: jest.fn(),
    reset: jest.fn()
};

afterEach(() => saveAsDialogStore.reset());

test("maps Ctrl + Shift + S to the shared Save As command", () => {
    saveAsDialogStore.setAvailable(true);
    const preventDefault = jest.fn();
    const hotkeys = new ResumeHotKeys(props);

    hotkeys.getHandlers().SAVE_AS({ preventDefault });

    expect(ResumeHotKeyMap.SAVE_AS).toEqual(expect.objectContaining({
        sequence: "ctrl+shift+s"
    }));
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(saveAsDialogStore.getSnapshot().isOpen).toBe(true);
});

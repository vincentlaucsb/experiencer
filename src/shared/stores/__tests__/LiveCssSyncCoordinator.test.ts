import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import {
    LiveCssSyncCoordinator,
    type LiveCssSyncDependencies
} from "@/shared/stores/LiveCssSyncCoordinator";
import type { ScopedLiveCssTreeChange } from "@/shared/utils/liveCssBaseline";
import type { LiveCssTreeChange } from "@/shared/utils/liveCssSync";

function createChange(
    tree: "resume" | "root" = "resume",
    path: ReadonlyArray<string> = ["Entry"],
    value = "grid"
): ScopedLiveCssTreeChange {
    return {
        tree,
        status: "changed",
        name: path[path.length - 1] || "Resume CSS",
        path,
        selector: ".entry",
        previousDeclarations: new Map([["display", "block"]]),
        declarations: new Map([["display", value]]),
        added: [],
        changed: ["display"],
        removed: []
    };
}

function createCoordinator(initialChanges: ScopedLiveCssTreeChange[] = []) {
    let changes = initialChanges;
    let scheduledRefresh: (() => void) | undefined;
    const dependencies: LiveCssSyncDependencies = {
        inspectAll: jest.fn(() => changes),
        inspectSection: jest.fn(() => []),
        filter: jest.fn((nextChanges) => nextChanges),
        applyAll: jest.fn(),
        notify: jest.fn(),
        scheduler: {
            setInterval: jest.fn((callback) => {
                scheduledRefresh = callback;
                return "live-css-timer";
            }),
            clearInterval: jest.fn()
        },
        pollIntervalMs: 1000
    };

    return {
        coordinator: new LiveCssSyncCoordinator(dependencies),
        dependencies,
        refresh: () => scheduledRefresh?.(),
        setChanges: (nextChanges: ScopedLiveCssTreeChange[]) => {
            changes = nextChanges;
        }
    };
}

describe("LiveCssSyncCoordinator", () => {
    test("owns one polling lifecycle across connected views", () => {
        const { coordinator, dependencies } = createCoordinator();

        const disconnectFirst = coordinator.connect();
        const disconnectSecond = coordinator.connect();

        expect(dependencies.inspectAll).toHaveBeenCalledTimes(1);
        expect(dependencies.scheduler.setInterval).toHaveBeenCalledWith(
            coordinator.refresh,
            1000
        );
        expect(dependencies.scheduler.setInterval).toHaveBeenCalledTimes(1);

        disconnectFirst();
        expect(dependencies.scheduler.clearInterval).not.toHaveBeenCalled();
        disconnectSecond();
        disconnectSecond();
        expect(dependencies.scheduler.clearInterval).toHaveBeenCalledWith("live-css-timer");
        expect(dependencies.scheduler.clearInterval).toHaveBeenCalledTimes(1);
    });

    test("reconciles equivalent scans without publishing duplicate state", () => {
        const firstChange = createChange();
        const { coordinator, refresh, setChanges } = createCoordinator([firstChange]);
        const listener = jest.fn();
        coordinator.subscribe(listener);
        const disconnect = coordinator.connect();

        expect(coordinator.getSnapshot()).toMatchObject({ changeCount: 1, reviewOpen: false });
        expect(listener).toHaveBeenCalledTimes(1);

        setChanges([createChange()]);
        refresh();
        expect(listener).toHaveBeenCalledTimes(1);

        setChanges([createChange("root", [], "flex")]);
        refresh();
        expect(coordinator.getSnapshot().changes[0].tree).toBe("root");
        expect(listener).toHaveBeenCalledTimes(2);
        disconnect();
    });

    test("owns review state and imports all trees through one transaction port", () => {
        const changes = [createChange("root", []), createChange("resume")];
        const { coordinator, dependencies } = createCoordinator(changes);
        const disconnect = coordinator.connect();

        coordinator.openReview();
        expect(coordinator.getSnapshot().reviewOpen).toBe(true);

        coordinator.importAll();

        expect(dependencies.applyAll).toHaveBeenCalledWith(changes);
        expect(dependencies.applyAll).toHaveBeenCalledTimes(1);
        expect(dependencies.notify).toHaveBeenCalledWith("Imported 2 live CSS changes.");
        expect(coordinator.getSnapshot()).toEqual({
            changes: [],
            changeCount: 0,
            reviewOpen: false
        });
        disconnect();
    });

    test("imports the selected section and descendants through one command update", () => {
        const root = new CssNode("Resume CSS", {}, "body");
        root.addNode("Entry", { display: "block" }, ".entry");
        const { tree: _rootTree, ...rootChange } = createChange("resume", []);
        const { tree: _entryTree, ...entryChange } = createChange("resume", ["Entry"], "grid");
        const sectionChanges: LiveCssTreeChange[] = [rootChange, entryChange];
        const { coordinator, dependencies } = createCoordinator();
        (dependencies.inspectSection as jest.Mock).mockReturnValue(sectionChanges);
        const commands = {
            replaceProperties: jest.fn()
        } as unknown as CssEditorCommands;

        const count = coordinator.importSection(
            "root",
            new ReadonlyCssNode(root),
            commands
        );

        expect(dependencies.filter).toHaveBeenCalledWith(
            sectionChanges.map((change) => ({ ...change, tree: "root" }))
        );
        expect(commands.replaceProperties).toHaveBeenCalledTimes(1);
        expect(commands.replaceProperties).toHaveBeenCalledWith(
            sectionChanges.map((change) => ({ ...change, tree: "root" }))
        );
        expect(count).toBe(2);
        expect(dependencies.notify).toHaveBeenCalledWith("Imported 2 live CSS changes.");
    });

    test("reports an unchanged section without creating an update", () => {
        const { coordinator, dependencies } = createCoordinator();
        const commands = {
            replaceProperties: jest.fn()
        } as unknown as CssEditorCommands;
        const root = new ReadonlyCssNode(new CssNode("Resume CSS", {}, "body"));

        expect(coordinator.importSection("resume", root, commands)).toBe(0);
        expect(commands.replaceProperties).not.toHaveBeenCalled();
        expect(dependencies.notify).toHaveBeenCalledWith(
            "This CSS section already matches the live stylesheet."
        );
    });
});

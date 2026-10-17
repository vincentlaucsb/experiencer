import { preserveNativeTextContextMenu } from "@/shared/utils/nativeTextContextMenu";

function setup() {
    document.body.innerHTML = `<div id="host"><section id="node"><input id="text" /><input id="file" type="file" /><span id="label">Label</span></section></div>`;
    const node = document.getElementById("node")!;
    const reached: string[] = [];
    // Stands in for a node menu: it cancels the browser menu for its subtree.
    const listener = (event: Event) => { reached.push(`${event.type}:${(event.target as Element).id}`); event.preventDefault(); };
    node.addEventListener("contextmenu", listener);
    node.addEventListener("mousedown", listener);
    const dispose = preserveNativeTextContextMenu(document.getElementById("host")!);
    const fire = (id: string, type: "contextmenu" | "mousedown", button = 2) => {
        const event = new MouseEvent(type, { bubbles: true, cancelable: true, button });
        document.getElementById(id)!.dispatchEvent(event);
        return event.defaultPrevented;
    };
    return { reached, dispose, fire };
}

test("text controls keep the browser menu while other targets reach node menus", () => {
    const { reached, fire } = setup();
    expect(fire("text", "contextmenu")).toBe(false);
    expect(fire("text", "mousedown")).toBe(false);
    expect(fire("text", "mousedown", 0)).toBe(true);
    expect(fire("file", "contextmenu")).toBe(true);
    expect(fire("label", "contextmenu")).toBe(true);
    expect(reached).toEqual(["mousedown:text", "contextmenu:file", "contextmenu:label"]);
});

test("disposing restores node menus for text controls", () => {
    const { dispose, fire } = setup();
    dispose();
    expect(fire("text", "contextmenu")).toBe(true);
});

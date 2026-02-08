import ResumeNodeDefinition from "./ResumeNodeDefinition";
import { arrayNormalize } from "@/shared/utils/arrayHelpers";
import { BasicResumeNode, NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";

export interface NodeInformation {
    text: string;
    node: BasicResumeNode & Record<string, any>;
    icon?: string;
}

type DefaultNodeValue = BasicResumeNode & Record<string, any>;
type ToolbarOptionsFunction = (
    updateNode: (key: string, value: NodeProperty) => void,
    node: ResumeNode
) => ToolbarItemData[];

/** Stores schema information */
export default class ComponentTypes {
    private _childTypes: Map<string, Array<string> | undefined> = new Map();
    private _defaultChildTypes: string[] = [];
    private _defaultValues: Map<string, DefaultNodeValue> = new Map();
    private _displayText: Map<string, string> = new Map();
    private _icons: Map<string, string | undefined> = new Map();
    private _registeredTypes: Set<string> = new Set();
    private _toolbarOptions: Map<string, ToolbarOptionsFunction> = new Map();

    private constructor() {}

    /**
     * Get allowed child types for a given node type
     * @param type The node type
     * @returns A string (single type) or array of strings (multiple types)
     */
    childTypes(type: string) : string | Array<string> {
        return this._childTypes.get(type) ||
            this._defaultChildTypes;
    }

    /**
     * Get the CSS selector path for a given node type
     * @param type The node type
     * @returns Array with the CSS path (typically just [type])
     */
    cssName(type: string) : string[] {
        return [type];
    }

    /**
     * Get the default/template node data for a given type
     * @param type The node type to create a template for
     * @returns NodeInformation containing display text, template node, and optional icon
     * @throws Error if the node type is not registered
     */
    defaultValue(type: string) : NodeInformation {
        if (this._registeredTypes.has(type)) {
            return {
                text: this._displayText.get(type) || type,
                node: this._defaultValues.get(type) || { type },
                icon: this._icons.get(type)
            };
        }

        throw new Error(`Couldn't find information for component named ${type}`);
    }

    /**
     * Get toolbar options for a given node
     * @param node The node instance
     * @param updateNode Callback to update node properties
     * @returns Array of toolbar item definitions
     */
    toolbarOptions(
        node: ResumeNode,
        updateNode: (key: string, value: NodeProperty) => void
    ) : ToolbarItemData[] {
        return this._toolbarOptions.get(node.type)?.(updateNode, node) || [];
    }

    private static _instance: ComponentTypes;

    /**
     * Get the singleton ComponentTypes instance
     */
    static get instance() {
        if (!this._instance) {
            this._instance = new ComponentTypes();
        }

        return this._instance;
    }

    /**
     * Register a new node type with its schema definition
     * @param def The node definition containing type, display text, children, defaults, icon, and optional toolbar options
     */
    registerNodeType(def: ResumeNodeDefinition) {
        if (this._registeredTypes.has(def.type)) return;

        this._registeredTypes.add(def.type);

        this._childTypes.set(def.type, def.childTypes ? 
            arrayNormalize(def.childTypes) : undefined);

        const defaultValue = { ...def.defaultValue, type: def.type };
        this._defaultValues.set(def.type, defaultValue);
        this._displayText.set(def.type, def.text);
        this._icons.set(def.type, def.icon);
        
        if (def.isDefaultChildType)
            this._defaultChildTypes.push(def.type);

        if (def.toolbarOptions)
            this._toolbarOptions.set(def.type, def.toolbarOptions);
    }
}

export class AliasTypes {
    static readonly BulletedList = 'Bulleted List';
}
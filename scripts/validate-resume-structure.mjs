import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "src", "resume", "schema", "resume-structure.json");
const schemaPath = path.join(root, "src", "resume", "schema", "resume-structure.schema.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const fail = (message) => {
    throw new Error(`Invalid resume structure manifest: ${message}`);
};
const validateSchema = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
if (!validateSchema(manifest)) {
    fail(validateSchema.errors
        .map((error) => `${error.instancePath || "/"} ${error.message}`)
        .join("; "));
}
const kinds = new Map();
for (const definition of manifest.nodeKinds ?? []) {
    if (!definition.kind || kinds.has(definition.kind)) fail(`duplicate or blank kind '${definition.kind ?? ""}'`);
    kinds.set(definition.kind, definition);
}
if (!manifest.version || !manifest.rootKind || kinds.size === 0) fail("missing version, root kind, or node kinds");
for (const child of manifest.rootChildren ?? []) {
    if (!kinds.has(child)) fail(`unknown root child '${child}'`);
}
for (const definition of kinds.values()) {
    if (definition.aliasOf && !kinds.has(definition.aliasOf)) fail(`unknown alias target '${definition.aliasOf}'`);
    for (const child of definition.children?.kinds ?? []) {
        if (!kinds.has(child)) fail(`unknown child '${child}' on '${definition.kind}'`);
    }
    for (const [name, field] of Object.entries({ ...manifest.commonFields, ...definition.fields })) {
        if (!new Set(["string", "boolean", "stringArray", "integerArray"]).has(field.type)) {
            fail(`unknown field type '${field.type}' on '${definition.kind}.${name}'`);
        }
        if (field.enum && field.type !== "string") fail(`enum requires string field '${definition.kind}.${name}'`);
    }
    if (definition.defaults?.childNodes) {
        for (const child of definition.defaults.childNodes) {
            if (!kinds.has(child.type)) fail(`unknown default child '${child.type}' on '${definition.kind}'`);
            const direct = definition.children.kinds.includes(child.type);
            const inheritedDefault = definition.children.mode === "defaultPlus"
                && Boolean(kinds.get(child.type)?.defaultChild);
            if (!direct && !inheritedDefault) {
                fail(`incompatible default child '${child.type}' on '${definition.kind}'`);
            }
        }
    }
}

process.stdout.write(`Validated resume structure manifest ${manifest.version} (${kinds.size} node kinds).\n`);

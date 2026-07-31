import { arrayNormalize } from "@/shared/utils/arrayHelpers";

type Operation = {
    kind: "plus" | "minus";
    types: string[];
};

/** Derives node-specific child policies from the fully registered default set. */
export default class DefaultChildren {
    private readonly operations: Operation[];

    private constructor(operations: Operation[] = []) {
        this.operations = operations;
    }

    static create(): DefaultChildren {
        return new DefaultChildren();
    }

    plus(types: string | string[]): DefaultChildren {
        return new DefaultChildren([
            ...this.operations,
            {
                kind: "plus",
                types: [...arrayNormalize(types)],
            },
        ]);
    }

    minus(types: string | string[]): DefaultChildren {
        return new DefaultChildren([
            ...this.operations,
            {
                kind: "minus",
                types: [...arrayNormalize(types)],
            },
        ]);
    }

    resolve(defaultChildTypes: string[]): string[] {
        let resolved = [...defaultChildTypes];

        this.operations.forEach((operation) => {
            if (operation.kind === "plus") {
                const prependedTypes = [...new Set(operation.types)];

                // Push additional types to the front
                resolved = [
                    ...prependedTypes,
                    ...resolved.filter((type) => !prependedTypes.includes(type))
                ];
                
                return;
            }

            const excluded = new Set(operation.types);
            resolved = resolved.filter((type) => !excluded.has(type));
        });

        return resolved;
    }
}

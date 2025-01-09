/**
 * Deeply merges the properties of the `source` object into the `target` object.
 * If a property is an object in both `target` and `source`, it recursively merges their properties.
 *
 * @param target - The target object to merge properties into.
 * @param source - The source object whose properties will be merged into the target.
 *
 * @returns A new object with the merged properties of both `target` and `source`.
 */
export const deepMerge = (
    // biome-ignore lint/suspicious/noExplicitAny: This is necessary to merge objects
    target: any,
    // biome-ignore lint/suspicious/noExplicitAny: This is necessary to merge objects
    source: any,
) => {
    // Iterate through `source` properties
    for (const key of Object.keys(source)) {
        // If an `Object` set property to merge of `target` and `source` properties
        if (source[key] instanceof Object && target[key] !== undefined) {
            // Merge the properties of the `source` and `target` properties
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }

    // Spread the `source` properties to the `target` properties and return
    return { ...target, ...source };
};

/**
 * Deeply merges the properties of the `source` object into the `target` object.
 * If a property is an object in both `target` and `source`, it recursively merges their properties.
 *
 * @param target - The target object to merge properties into.
 * @param source - The source object whose properties will be merged into the target.
 *
 * @returns A new object with the merged properties of both `target` and `source`.
 */
export declare const deepMerge: (target: any, source: any) => any;

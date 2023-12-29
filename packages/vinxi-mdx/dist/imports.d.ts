type MdxModule = typeof import("@mdx-js/mdx");
export declare function requireMdx(cwd: string): MdxModule;
export declare function resolveMdxImport(cwd: string): string;
export declare function requireFrom(name: string, cwd: string): any;
/**
 * Search the node_modules of `cwd` and its ancestors until a package is found.
 * Skip global `node_modules` and `vite/node_modules` (since `vite` might be
 * a local clone).
 */
export declare function resolveImport(name: string, cwd: string): string | undefined;
export declare function resolveImport(name: string, cwd: string, throwOnMissing: true): string;
/**
 * Throw an error if the given `name` cannot be found from `cwd`.
 * Otherwise, return the `name`.
 */
export declare function assertImportExists(name: string, cwd: string): string;
export type NamedImports = {
    [packageName: string]: string | string[];
};
export declare function inferNamedImports(root: string): NamedImports;
export {};
//# sourceMappingURL=imports.d.ts.map
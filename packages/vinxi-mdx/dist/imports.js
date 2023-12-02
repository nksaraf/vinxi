import resolve from "resolve";
const importCache = {};
export function requireMdx(cwd) {
    return require(resolveMdxImport(cwd));
}
export function resolveMdxImport(cwd) {
    return resolveImport("@mdx-js/mdx", cwd) || require.resolve("@mdx-js/mdx");
}
export function requireFrom(name, cwd) {
    return require(resolveImport(name, cwd, true));
}
export function resolveImport(name, cwd, throwOnMissing) {
    const cacheKey = cwd + "\0" + name;
    if (!importCache[cacheKey]) {
        try {
            importCache[cacheKey] = resolve.sync(name, { basedir: cwd });
        }
        catch (e) {
            if (throwOnMissing) {
                throw new Error(`[vite-plugin-mdx] "${name}" must be installed`);
            }
        }
    }
    return importCache[cacheKey];
}
/**
 * Throw an error if the given `name` cannot be found from `cwd`.
 * Otherwise, return the `name`.
 */
export function assertImportExists(name, cwd) {
    return resolveImport(name, cwd, true) && name;
}
export function inferNamedImports(root) {
    return resolveImport("preact", root)
        ? { preact: ["h"], "@mdx-js/preact": ["mdx"] }
        : { react: "React" };
}
//# sourceMappingURL=imports.js.map
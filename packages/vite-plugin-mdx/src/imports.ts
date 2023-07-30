import resolve from "resolve";

const importCache: {
	[cacheKey: string]: string | undefined;
} = {};

type MdxModule = typeof import("@mdx-js/mdx");

export function requireMdx(cwd: string): MdxModule {
	return require(resolveMdxImport(cwd));
}

export function resolveMdxImport(cwd: string) {
	return resolveImport("@mdx-js/mdx", cwd) || require.resolve("@mdx-js/mdx");
}

export function requireFrom(name: string, cwd: string) {
	return require(resolveImport(name, cwd, true));
}

/**
 * Search the node_modules of `cwd` and its ancestors until a package is found.
 * Skip global `node_modules` and `vite/node_modules` (since `vite` might be
 * a local clone).
 */
export function resolveImport(name: string, cwd: string): string | undefined;
export function resolveImport(
	name: string,
	cwd: string,
	throwOnMissing: true,
): string;
export function resolveImport(
	name: string,
	cwd: string,
	throwOnMissing?: boolean,
) {
	const cacheKey = cwd + "\0" + name;
	if (!importCache[cacheKey]) {
		try {
			importCache[cacheKey] = resolve.sync(name, { basedir: cwd });
		} catch (e) {
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
export function assertImportExists(name: string, cwd: string) {
	return resolveImport(name, cwd, true) && name;
}

export type NamedImports = {
	[packageName: string]: string | string[];
};

export function inferNamedImports(root: string): NamedImports {
	return resolveImport("preact", root)
		? { preact: ["h"], "@mdx-js/preact": ["mdx"] }
		: { react: "React" };
}

import type { Plugin } from "vite";

import { mergeArrays } from "./common.js";
import type { NamedImports } from "./imports.js";
import { createTransformer } from "./transform.js";
import type { MdxOptions, MdxPlugin } from "./types.js";
import { viteMdxTransclusion } from "./viteMdxTransclusion/index.js";
import { VFile, type VFileCompatible } from "vfile";

export type { MdxOptions, MdxPlugin };

export default function viteMdx(
	mdxOptions?: MdxOptions | ((filename: string) => MdxOptions),
) {
	return createPlugin(mdxOptions || {});
}

viteMdx.withImports = (namedImports: NamedImports) =>
	function mdx(mdxOptions?: MdxOptions | ((filename: string) => MdxOptions)) {
		return createPlugin(mdxOptions || {}, namedImports);
	};

function createPlugin(
	mdxOptions: MdxOptions | ((filename: string) => MdxOptions),
	namedImports?: NamedImports,
) {
	let getMdxOptions: ((filename: string) => MdxOptions) | undefined;
	let globalMdxOptions: any = mdxOptions;
	if (typeof mdxOptions === "function") {
		getMdxOptions = mdxOptions;
		globalMdxOptions = {};
	}

	// Ensure plugin arrays exist for other Vite plugins to manipulate.
	globalMdxOptions.remarkPlugins ??= [];
	globalMdxOptions.rehypePlugins ??= [];

	let reactRefresh: Plugin | undefined;
	let transformMdx:
		| ((
				code_mdx: VFileCompatible,
				mdxOptions?: MdxOptions | undefined,
		  ) => Promise<string>)
		| undefined;

	const mdxPlugin: MdxPlugin = {
		name: "vite-plugin-mdx",
		// I can't think of any reason why a plugin would need to run before mdx; let's make sure `vite-plugin-mdx` runs first.
		enforce: "pre",
		mdxOptions: globalMdxOptions,
		configResolved({ root, plugins }) {
			// @vitejs/plugin-react-refresh has been upgraded to @vitejs/plugin-react,
			// and the name of the plugin performing `transform` has been changed from 'react-refresh' to 'vite:react-babel',
			// to be compatible, we need to look for both plugin name.
			// We should also look for the other plugins names exported from @vitejs/plugin-react in case there are some internal refactors.
			const reactRefreshPlugins = plugins.filter(
				(p) =>
					p.name === "react-refresh" ||
					p.name === "vite:react-babel" ||
					p.name === "vite:react-refresh" ||
					p.name === "vite:react-jsx",
			);
			reactRefresh = reactRefreshPlugins.find((p) => p.transform);
			transformMdx = createTransformer(root, namedImports);
		},
		async transform(code, id, ssr) {
			const [path, query] = id.split("?");
			if (/\.mdx?$/.test(path)) {
				if (!transformMdx)
					throw new Error(
						"vite-plugin-mdx: configResolved hook should be called before calling transform hook",
					);

				const mdxOptions = mergeOptions(
					globalMdxOptions,
					getMdxOptions?.(path),
				);

				const input = new VFile({ value: code, path })

				code = await transformMdx(input, { ...mdxOptions });
				// @ts-ignore
				const refreshResult = await reactRefresh?.transform!.call(
					this,
					code,
					path + ".js",
					ssr,
				);

				return (
					refreshResult || {
						code,
						map: { mappings: "" },
					}
				);
			}
		},
	};

	return [
		mdxPlugin,
		// Let .mdx files import other .mdx and .md files without an import
		// specifier to automatically inline their content seamlessly.
		viteMdxTransclusion(globalMdxOptions, getMdxOptions),
	];
}

function mergeOptions(globalOptions: MdxOptions, localOptions?: MdxOptions) {
	return {
		...globalOptions,
		...localOptions,
		remarkPlugins: mergeArrays(
			globalOptions.remarkPlugins,
			localOptions?.remarkPlugins,
		),
		rehypePlugins: mergeArrays(
			globalOptions.rehypePlugins,
			localOptions?.rehypePlugins,
		),
	};
}

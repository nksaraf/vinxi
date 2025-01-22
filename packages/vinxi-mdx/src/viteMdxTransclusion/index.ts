import LRUCache from "@alloc/quick-lru";
import fs from "fs";
import { isAbsolute } from "path";
import { FSWatcher, type Plugin, type ResolvedConfig, normalizePath } from "vite";

import { mergeArrays } from "../common.js";
import type { MdxOptions, MdxPlugin } from "../types.js";
import { ImportMap } from "./ImportMap.js";
import { createMdxAstCompiler } from "./createMdxAstCompiler.js";
import { type MdxAstCache, remarkTransclusion } from "./remarkTransclusion.js";

/**
 * With transclusion enabled, an `.mdx` file can import other `.mdx` or `.md`
 * files without an import specifier.
 *
 *     import "../other.mdx"
 *
 * The file extension is required.
 *
 * The imported file is inlined into its importer, but the imported file can
 * still have its own Remark plugins.
 *
 */
export function viteMdxTransclusion(
	globalMdxOptions: MdxPlugin["mdxOptions"],
	getMdxOptions?: (filename: string) => MdxOptions,
): Plugin {
	/**
	 * To recompile an importer when its transcluded files are changed,
	 * we need to track the relationships between them.
	 */
	let importMap: ImportMap;
	/**
	 * To avoid redundant parsing and processing, we cache the MDX syntax trees
	 * of transcluded files to serve as a fast path when an importer is recompiled.
	 */
	let astCache: MdxAstCache;

	let resolvedConfig: ResolvedConfig | undefined;
	let watcher: FSWatcher | undefined;

	const plugin: Plugin = {
		name: "mdx:transclusion",
		configResolved(config) {
			resolvedConfig = config;
		},
		configureServer(server) {
			watcher = server.watcher;
			importMap = new ImportMap();
			astCache = new LRUCache({
				maxAge: 30 * 6e4, // 30 minutes
				maxSize: 100,
			});

			// When a transcluded file changes, recompile its importers.
			// Also, clean up the import map when an importer is deleted.
			watcher.on("all", (event, filePath) => {
				if (/\.mdx?$/.test(filePath)) {
					if (event === "unlink") {
						importMap.deleteImporter(filePath);
					}
					const importers = importMap.importers.get(filePath);
					if (importers) {
						astCache.delete(filePath);
						importers.forEach((importer) => {
							// @ts-ignore
							watcher!.emit("change", importer);
						});
					}
				}
			});
		},
		buildStart() {
			if (!resolvedConfig)
				throw new Error(
					"vite-plugin-mdx: configResolved hook should be called before calling buildStart hook",
				);
			const { root, logger } = resolvedConfig;
			globalMdxOptions.remarkPlugins.push(
				remarkTransclusion({
					astCache,
					importMap,
					resolve: async (id, importer) => {
						const resolved = await this.resolve(id, importer);
						if (resolved) {
							id = normalizePath(resolved.id);
							// Ensure files outside the Vite project root are watched.
							if (watcher && isAbsolute(id) && !id.startsWith(root + "/")) {
								watcher.add(id);
							}
							return id;
						}
						logger.warn(`Failed to resolve "${id}" imported by "${importer}"`);
					},
					readFile: (filePath) => fs.promises.readFile(filePath, "utf8"),
					getCompiler: (filePath) =>
						createMdxAstCompiler(
							root,
							mergeArrays(
								globalMdxOptions.remarkPlugins,
								getMdxOptions?.(filePath).remarkPlugins,
							),
						),
				}),
			);
		},
	};
	return plugin;
}

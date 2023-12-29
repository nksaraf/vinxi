var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LRUCache from "@alloc/quick-lru";
import fs from "fs";
import { isAbsolute } from "path";
import { normalizePath } from "vite";
import { mergeArrays } from "../common";
import { ImportMap } from "./ImportMap";
import { createMdxAstCompiler } from "./createMdxAstCompiler";
import { remarkTransclusion } from "./remarkTransclusion";
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
export function viteMdxTransclusion(globalMdxOptions, getMdxOptions) {
    /**
     * To recompile an importer when its transcluded files are changed,
     * we need to track the relationships between them.
     */
    let importMap;
    /**
     * To avoid redundant parsing and processing, we cache the MDX syntax trees
     * of transcluded files to serve as a fast path when an importer is recompiled.
     */
    let astCache;
    let resolvedConfig;
    let watcher;
    const plugin = {
        name: "mdx:transclusion",
        configResolved(config) {
            resolvedConfig = config;
        },
        configureServer(server) {
            watcher = server.watcher;
            importMap = new ImportMap();
            astCache = new LRUCache({
                maxAge: 30 * 6e4,
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
                            watcher.emit("change", importer);
                        });
                    }
                }
            });
        },
        buildStart() {
            if (!resolvedConfig)
                throw new Error("vite-plugin-mdx: configResolved hook should be called before calling buildStart hook");
            const { root, logger } = resolvedConfig;
            globalMdxOptions.remarkPlugins.push(remarkTransclusion({
                astCache,
                importMap,
                resolve: (id, importer) => __awaiter(this, void 0, void 0, function* () {
                    const resolved = yield this.resolve(id, importer);
                    if (resolved) {
                        id = normalizePath(resolved.id);
                        // Ensure files outside the Vite project root are watched.
                        if (watcher && isAbsolute(id) && !id.startsWith(root + "/")) {
                            watcher.add(id);
                        }
                        return id;
                    }
                    logger.warn(`Failed to resolve "${id}" imported by "${importer}"`);
                }),
                readFile: (filePath) => fs.promises.readFile(filePath, "utf8"),
                getCompiler: (filePath) => createMdxAstCompiler(root, mergeArrays(globalMdxOptions.remarkPlugins, getMdxOptions === null || getMdxOptions === void 0 ? void 0 : getMdxOptions(filePath).remarkPlugins)),
            }));
        },
    };
    return plugin;
}
//# sourceMappingURL=index.js.map
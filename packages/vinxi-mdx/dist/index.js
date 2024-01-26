var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mergeArrays } from "./common";
import { createTransformer } from "./transform";
import { viteMdxTransclusion } from "./viteMdxTransclusion";
import { VFile } from "vfile";
export default function viteMdx(mdxOptions) {
    return createPlugin(mdxOptions || {});
}
viteMdx.withImports = (namedImports) => function mdx(mdxOptions) {
    return createPlugin(mdxOptions || {}, namedImports);
};
function createPlugin(mdxOptions, namedImports) {
    var _a, _b;
    let getMdxOptions;
    let globalMdxOptions = mdxOptions;
    if (typeof mdxOptions === "function") {
        getMdxOptions = mdxOptions;
        globalMdxOptions = {};
    }
    // Ensure plugin arrays exist for other Vite plugins to manipulate.
    (_a = globalMdxOptions.remarkPlugins) !== null && _a !== void 0 ? _a : (globalMdxOptions.remarkPlugins = []);
    (_b = globalMdxOptions.rehypePlugins) !== null && _b !== void 0 ? _b : (globalMdxOptions.rehypePlugins = []);
    let reactRefresh;
    let transformMdx;
    const mdxPlugin = {
        name: "vite-plugin-mdx",
        // I can't think of any reason why a plugin would need to run before mdx; let's make sure `vite-plugin-mdx` runs first.
        enforce: "pre",
        mdxOptions: globalMdxOptions,
        configResolved({ root, plugins }) {
            // @vitejs/plugin-react-refresh has been upgraded to @vitejs/plugin-react,
            // and the name of the plugin performing `transform` has been changed from 'react-refresh' to 'vite:react-babel',
            // to be compatible, we need to look for both plugin name.
            // We should also look for the other plugins names exported from @vitejs/plugin-react in case there are some internal refactors.
            const reactRefreshPlugins = plugins.filter((p) => p.name === "react-refresh" ||
                p.name === "vite:react-babel" ||
                p.name === "vite:react-refresh" ||
                p.name === "vite:react-jsx");
            reactRefresh = reactRefreshPlugins.find((p) => p.transform);
            transformMdx = createTransformer(root, namedImports);
        },
        transform(code, id, ssr) {
            return __awaiter(this, void 0, void 0, function* () {
                const [path, query] = id.split("?");
                if (/\.mdx?$/.test(path)) {
                    if (!transformMdx)
                        throw new Error("vite-plugin-mdx: configResolved hook should be called before calling transform hook");
                    const mdxOptions = mergeOptions(globalMdxOptions, getMdxOptions === null || getMdxOptions === void 0 ? void 0 : getMdxOptions(path));
                    const input = new VFile({ value: code, path });
                    code = yield transformMdx(input, Object.assign({}, mdxOptions));
                    // @ts-ignore
                    const refreshResult = yield (reactRefresh === null || reactRefresh === void 0 ? void 0 : reactRefresh.transform.call(this, code, path + ".js", ssr));
                    return (refreshResult || {
                        code,
                        map: { mappings: "" },
                    });
                }
            });
        },
    };
    return [
        mdxPlugin,
        // Let .mdx files import other .mdx and .md files without an import
        // specifier to automatically inline their content seamlessly.
        viteMdxTransclusion(globalMdxOptions, getMdxOptions),
    ];
}
function mergeOptions(globalOptions, localOptions) {
    return Object.assign(Object.assign(Object.assign({}, globalOptions), localOptions), { remarkPlugins: mergeArrays(globalOptions.remarkPlugins, localOptions === null || localOptions === void 0 ? void 0 : localOptions.remarkPlugins), rehypePlugins: mergeArrays(globalOptions.rehypePlugins, localOptions === null || localOptions === void 0 ? void 0 : localOptions.rehypePlugins) });
}
//# sourceMappingURL=index.js.map
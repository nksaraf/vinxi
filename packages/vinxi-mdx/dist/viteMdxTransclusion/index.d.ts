import { Plugin } from "vite";
import { MdxOptions, MdxPlugin } from "../types";
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
export declare function viteMdxTransclusion(globalMdxOptions: MdxPlugin["mdxOptions"], getMdxOptions?: (filename: string) => MdxOptions): Plugin;
//# sourceMappingURL=index.d.ts.map
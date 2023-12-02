import type { Plugin } from "vite";
import { NamedImports } from "./imports";
import { MdxOptions, MdxPlugin } from "./types";
export { MdxOptions, MdxPlugin };
declare function viteMdx(mdxOptions?: MdxOptions | ((filename: string) => MdxOptions)): Plugin[];
declare namespace viteMdx {
    var withImports: (namedImports: NamedImports) => (mdxOptions?: MdxOptions | ((filename: string) => MdxOptions)) => Plugin[];
}
export default viteMdx;
//# sourceMappingURL=index.d.ts.map
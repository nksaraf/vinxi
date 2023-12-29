import mdx from "@mdx-js/mdx";
import type { Pluggable } from "unified";
import type { Plugin as VitePlugin } from "vite";
export type RemarkPlugin = Pluggable | false;
export type RehypePlugin = Pluggable | false;
export interface MdxOptions extends Omit<mdx.CompileOptions, "remarkPlugins" | "rehypePlugins"> {
    remarkPlugins?: Readonly<RemarkPlugin>[];
    rehypePlugins?: Readonly<RehypePlugin>[];
}
export interface MdxPlugin extends VitePlugin {
    mdxOptions: MdxOptions & {
        remarkPlugins: RemarkPlugin[];
        rehypePlugins: RehypePlugin[];
    };
}
//# sourceMappingURL=types.d.ts.map
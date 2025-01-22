import type { CompileOptions } from "@mdx-js/mdx";
import type { Pluggable } from "unified";
import type { Plugin as VitePlugin } from "vite";

export type RemarkPlugin = Pluggable | false;
export type RehypePlugin = Pluggable | false;

export interface MdxOptions
	extends Omit<CompileOptions, "remarkPlugins" | "rehypePlugins"> {
	remarkPlugins?: Readonly<RemarkPlugin>[];
	rehypePlugins?: Readonly<RehypePlugin>[];
}

export interface MdxPlugin extends VitePlugin {
	mdxOptions: MdxOptions & {
		// Plugin arrays always exist when accessed by Vite plugin.
		remarkPlugins: RemarkPlugin[];
		rehypePlugins: RehypePlugin[];
	};
}

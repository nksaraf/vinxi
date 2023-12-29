import { RemarkPlugin } from '../types';
/**
 * Almost identical to the `createMdxAstCompiler` export of `@mdx-js/mdx`
 * but without the `mdxAstToMdxHast` transformer.
 *
 * We can get rid of this once https://github.com/mdx-js/mdx/issues/1512
 * is addressed.
 */
export declare function createMdxAstCompiler(cwd: string, remarkPlugins: Readonly<RemarkPlugin>[]): any;
//# sourceMappingURL=createMdxAstCompiler.d.ts.map
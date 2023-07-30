import { requireFrom, resolveMdxImport } from '../imports'
import { RemarkPlugin } from '../types'

/**
 * Almost identical to the `createMdxAstCompiler` export of `@mdx-js/mdx`
 * but without the `mdxAstToMdxHast` transformer.
 *
 * We can get rid of this once https://github.com/mdx-js/mdx/issues/1512
 * is addressed.
 */
export function createMdxAstCompiler(
  cwd: string,
  remarkPlugins: Readonly<RemarkPlugin>[]
) {
  // In order to support PNPM and local clones of this plugin,
  // we need to resolve these dependencies from the `@mdx-js/mdx`
  // package installed by the user.
  const mdxRoot = resolveMdxImport(cwd)
  const unified = requireFrom('unified', mdxRoot)
  const remarkParse = requireFrom('remark-parse', mdxRoot)
  const remarkMdx = requireFrom('remark-mdx', mdxRoot)
  const squeeze = requireFrom('remark-squeeze-paragraphs', mdxRoot)

  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(squeeze)
    .use(remarkPlugins)
    .freeze()
}

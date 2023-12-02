import type { Processor, Transformer } from 'unified';
import type { Content } from 'mdast';
import LRUCache from '@alloc/quick-lru';
import { ImportMap } from './ImportMap';
export type MdxAstCache = LRUCache<string, Content[]>;
export declare function remarkTransclusion({ resolve, readFile, getCompiler, importMap, astCache }: {
    resolve(id: string, importer?: string): Promise<string | undefined>;
    readFile(filePath: string): Promise<string>;
    getCompiler(filePath: string): Processor;
    importMap?: ImportMap;
    astCache?: MdxAstCache;
}): () => Transformer;
//# sourceMappingURL=remarkTransclusion.d.ts.map
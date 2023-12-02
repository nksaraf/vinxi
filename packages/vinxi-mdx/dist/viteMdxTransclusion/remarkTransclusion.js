var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const importRE = /^import ['"](.+)['"]\s*$/;
const mdxRE = /\.mdx?$/;
export function remarkTransclusion({ resolve, readFile, getCompiler, importMap, astCache }) {
    return () => (ast, file) => __awaiter(this, void 0, void 0, function* () {
        if (!isRootNode(ast))
            return;
        const importer = file.path;
        importMap === null || importMap === void 0 ? void 0 : importMap.deleteImporter(importer);
        const imports = findMdxImports(ast);
        if (imports.length) {
            const splices = yield Promise.all(imports.map(({ id, index }) => __awaiter(this, void 0, void 0, function* () {
                const importedPath = yield resolve(id, importer);
                if (!importedPath) {
                    // Strip unresolved imports.
                    return [index, 1, []];
                }
                importMap === null || importMap === void 0 ? void 0 : importMap.addImport(importedPath, importer);
                let ast = astCache === null || astCache === void 0 ? void 0 : astCache.get(importedPath);
                if (!ast) {
                    const importedFile = {
                        path: importedPath,
                        contents: yield readFile(importedPath)
                    };
                    const compiler = getCompiler(importedPath);
                    const parsedFile = compiler.parse(importedFile);
                    const compiledFile = yield compiler.run(parsedFile, importedFile);
                    ast = compiledFile.children;
                    astCache === null || astCache === void 0 ? void 0 : astCache.set(importedPath, ast);
                }
                // Inject the AST of the imported markdown.
                return [index, 1, ast];
            })));
            // Apply splices in reverse to ensure preceding indices are stable.
            let { children } = ast;
            for (const [index, deleteCount, inserted] of splices.reverse())
                children = children
                    .slice(0, index)
                    .concat(inserted, children.slice(index + deleteCount));
            ast.children = children;
        }
    });
}
function findMdxImports(ast) {
    const imports = [];
    ast.children.forEach((node, index) => {
        var _a;
        // "import" type is used by @mdx-js/mdx@2.0.0-next.8 and under
        if (node.type === 'mdxjsEsm' || node.type === 'import') {
            // mdx ast nodes indeed have a value prop:
            // https://github.com/mdx-js/specification#import
            // but @types/unist doesn't declare it
            const id = (_a = importRE.exec(node.value)) === null || _a === void 0 ? void 0 : _a[1];
            if (id && mdxRE.test(id)) {
                imports.push({ id, node, index });
            }
        }
    });
    return imports;
}
function isRootNode(node) {
    return node.type === 'root';
}
//# sourceMappingURL=remarkTransclusion.js.map
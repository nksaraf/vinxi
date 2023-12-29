var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { transform } from "esbuild";
import { assertImportExists, inferNamedImports } from "./imports";
export function createTransformer(root, namedImports = inferNamedImports(root)) {
    const imports = Object.entries(namedImports).map(([packageName, imported]) => {
        assertImportExists(packageName, root);
        return Array.isArray(imported)
            ? `import { ${imported.join(", ")} } from '${packageName}'`
            : `import ${imported} from '${packageName}'`;
    });
    return function transform(code_mdx, mdxOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const mdx = yield import("@mdx-js/mdx");
            let code_jsx = yield mdx.compile(code_mdx, mdxOptions);
            let code = !mdxOptions.jsx
                ? yield jsxToES2019(code_jsx.toString())
                : code_jsx.toString();
            return imports.concat("", code).join("\n");
        });
    };
}
function jsxToES2019(code_jsx) {
    return __awaiter(this, void 0, void 0, function* () {
        // We use `esbuild` ourselves instead of letting Vite doing the esbuild transform,
        // because there don't seem to be a way to change the esbuild options for specific
        // files only: https://vitejs.dev/config/#esbuild
        /* Uncomment this to inspect the type `TransformOptions`
      type TransformOptions = Pick<Parameters<typeof esBuild.transform>, 1>[1];
      let t: TransformOptions;
      t!.format
      t!.jsxFactory
      //*/
        let { code: code_es2019 } = yield transform(code_jsx, {
            loader: "jsx",
            jsxFactory: "mdx",
            target: "es2019",
        });
        // TODO stabilize this bugfix
        code_es2019 = code_es2019.replace("export default function MDXContent", "export default MDXContent; function MDXContent");
        return code_es2019;
    });
}
//# sourceMappingURL=transform.js.map
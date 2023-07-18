import { ExportSpecifier, ImportSpecifier } from "es-module-lexer";

declare const glob: (path: any) => string[];
declare function cleanPath(src: any, config: any): any;
declare function analyzeModule(
	src: any,
): readonly [
	imports: readonly ImportSpecifier[],
	exports: readonly ExportSpecifier[],
	facade: boolean,
];

declare class BaseFileSystemRouter {
	config: any;
	routes: any[];
	getRoutes(): Promise<any[]>;
}

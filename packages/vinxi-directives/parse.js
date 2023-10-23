import * as acorn from "acorn";
import tsPlugin from "acorn-typescript";
import { parse as recastParse } from "recast";

export { parse as parseLoose } from "acorn-loose";

/** @typedef {acorn.Node & { comments: any[]; tokens: any[] }} AST */
/** @type {any} */
const parserTSPlugin = tsPlugin();
const parser = acorn.Parser.extend(parserTSPlugin);
export function parseAdvanced(code) {
	return recastParse(code, {
		parser: {
			parse(source) {
				var comments = [];
				var tokens = [];

				/** @type {AST} */
				let ast;

				// @ts-ignore
				ast = parser.parse(source, {
					allowHashBang: true,
					allowImportExportEverywhere: true,
					allowReturnOutsideFunction: true,
					locations: true,
					onComment: comments,
					onToken: tokens,
					// additional options
					ecmaVersion: 2024,
					sourceType: "module",
				});

				if (!ast.comments) {
					ast.comments = comments;
				}

				if (!ast.tokens) {
					ast.tokens = tokens;
				}
				return ast;
			},
		},
	});
}

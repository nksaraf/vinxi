import * as acorn from "acorn";
import jsx from "acorn-jsx";
import * as acornLoose from "acorn-loose";
import tsPlugin from "acorn-typescript";
import { parse as recastParse } from "recast";

/** @typedef {acorn.Node & { comments: any[]; tokens: any[] }} AST */
/** @type {any} */
const parserTSPlugin = tsPlugin();
const parser = acorn.Parser.extend(parserTSPlugin).extend(jsx());
const looseParser = acornLoose.LooseParser.extend(jsx());

export function parseLoose(code) {
	return parser.parse(code, {
		ecmaVersion: "2024",
		sourceType: "module",
	});
}
export function parseAdvanced(code) {
	return recastParse(
		code,
		{ parser: require("./babel.cjs") },
		// 	, {
		// 	parser: {
		// 		parse(source) {
		// 			var comments = [];
		// 			var tokens = [];

		// 			/** @type {AST} */
		// 			let ast;

		// 			// @ts-ignore
		// 			ast = parser.parse(source, {
		// 				allowHashBang: true,
		// 				allowImportExportEverywhere: true,
		// 				allowReturnOutsideFunction: true,
		// 				locations: true,
		// 				onComment: comments,
		// 				onToken: tokens,
		// 				// additional options
		// 				ecmaVersion: 2024,
		// 				sourceType: "module",
		// 			});

		// 			if (!ast.comments) {
		// 				ast.comments = comments;
		// 			}

		// 			if (!ast.tokens) {
		// 				ast.tokens = tokens;
		// 			}
		// 			return ast;
		// 		},
		// 	},
		// }
	);
}

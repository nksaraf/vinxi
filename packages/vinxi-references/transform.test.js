import * as acorn from "acorn";
import tsPlugin from "acorn-typescript";
import { generateCode, parseModule } from "magicast";
import { print, parse as recastParse } from "recast";
import { prettyPrint } from "recast";
import { describe, expect, it } from "vitest";

import {
	decorateExports,
	wrapExports,
	wrapExportsPlugin,
} from "./transform-references.js";

function parse(code) {
	return recastParse(code, {
		parser: {
			parse(source) {
				var comments = [];
				var tokens = [];

				const ast = acorn.Parser.extend(tsPlugin()).parse(source, {
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
const js = (args) => prettyPrint(parse(args)).code;

function transformSSR(
	code,
	plugin,
	args = {
		id: "test",
		runtime: {
			module: "test",
			function: "runtimeFunction",
		},
		hash: (s) => s,
		options: {
			ssr: true,
		},
	},
) {
	return js(
		plugin({
			code,
			ast: parse(code),
			...args,
		}),
	);
}

describe("wrap exports", () => {
	it("wraps named export of anonymous function", () => {
		expect(
			transformSSR(`export const namedExport = function() {}`, wrapExports),
		).toMatchInlineSnapshot(`
			"import { runtimeFunction } from \\"test\\";
			export const namedExport = runtimeFunction(function() {}, \\"test\\", \\"namedExport\\");"
		`);
	});

	it("wraps named export of anonymous async function", () => {
		expect(
			transformSSR(
				`export const namedExport = async function() {}`,
				wrapExports,
			),
		).toMatchInlineSnapshot(`
			"import { runtimeFunction } from \\"test\\";
			export const namedExport = runtimeFunction(async function() {}, \\"test\\", \\"namedExport\\");"
		`);
	});

	it("wraps named export of arrow function expression", () => {
		expect(
			transformSSR(`export const namedExport = () => {}`, wrapExports),
		).toMatchInlineSnapshot(`
			"import { runtimeFunction } from \\"test\\";
			export const namedExport = runtimeFunction(() => {}, \\"test\\", \\"namedExport\\");"
		`);
	});

	it("wraps named export of  async arrow function expressions", () => {
		expect(
			transformSSR(`export const namedExport = async () => {}`, wrapExports),
		).toMatchInlineSnapshot(`
			"import { runtimeFunction } from \\"test\\";
			export const namedExport = runtimeFunction(async () => {}, \\"test\\", \\"namedExport\\");"
		`);
	});
});

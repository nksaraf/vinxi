import * as acorn from "acorn";
import tsPlugin from "acorn-typescript";
import { generateCode, parseModule } from "magicast";
import { print, parse as recastParse } from "recast";

import {
	decorateExports,
	wrapExports,
	wrapExportsPlugin,
} from "./transform-references.js";

const code = `
"use client";

import { createSignal } from "solid-js";

export default function Toggle(props: { children: any }) {
  const [open, setOpen] = createSignal(true);

  return (
    <>
      <div class="toggle" classList={{ open: open() }}>
        <a onClick={() => setOpen(o => !o)}>{open() ? "[-]" : "[+] comments collapsed"}</a>
      </div>
      <ul class="comment-children" style={{ display: open() ? "block" : "none" }}>
        {props.children}
      </ul>
    </>
  );
}
`;

const ast = recastParse(code, {
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

// const ast = parse(code, {
// 	ecmaVersion: "2024",
// 	sourceType: "module",
// }).body;

console.log(
	wrapExportsPlugin({
		runtime: {
			module: "test",
			function: "createClientReference",
		},
		hash: (s) => s,
		apply: () => true,
		onModuleFound: () => {},
		pragma: "use client",
	}).apply(code, "test", { ssr: true }),
	wrapExports({
		code,
		ast,
		id: "test",
		runtime: {
			module: "test",
			function: "createClientReference",
		},
		hash: (s) => s,

		options: {
			ssr: true,
		},
	}),
);

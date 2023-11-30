import { prettyPrint } from "recast";
import { describe, expect, it } from "vitest";

import { parseAdvanced } from "./parse.js";
import { shimExportsPlugin } from "./shim-exports.js";
import { decorateExports } from "./transform.js";
import { wrapExports } from "./wrap-exports.js";
import { wrapExportsPlugin } from "./wrap-exports.js";

const testFixtures = import.meta.glob("./fixtures/**/*.ts", {
	as: "raw",
});

const js = (args) => prettyPrint(parseAdvanced(args)).code;

async function transformSSR(
	code,
	plugin,
	args = {
		id: "test",
		runtime: {
			module: "~/runtime",
			function: "createReference",
		},
		hash: (s) => s,
		options: {
			ssr: true,
		},
		onModuleFound: (mod) => {},
		apply: (code, id, options) => {
			return options.ssr;
		},
		pragma: "use runtime",
	},
) {
	const instance = plugin({
		...args,
	});

	// const applied = await instance.apply(code, args.id, args.options);
	// if (applied === false) {
	// 	return code;
	// }
	return js(await instance.transform(code, args.id, args.options));
}
async function transformClient(
	code,
	plugin,
	args = {
		id: "test",
		runtime: {
			module: "~/runtime",
			function: "createReference",
		},
		hash: (s) => s,
		options: {
			ssr: true,
		},
		onModuleFound: (mod) => {},
		apply: (code, id, options) => {
			return !options.ssr;
		},
		pragma: "use runtime",
	},
) {
	const instance = plugin({
		...args,
	});

	// const applied = await instance.apply(code, args.id, args.options);
	// if (applied === false) {
	// 	return code;
	// }
	return js(await instance.transform(code, args.id, args.options));
}

async function runTest(name, transform, f) {
	it(name + "-" + f, async () => {
		const code = await testFixtures[`./fixtures/${name}.ts`]();
		const expected = await testFixtures[
			`./fixtures/${name}${f ? "." + f : ""}.snapshot.ts`
		]();
		console.log(await transform(code));
		expect(js(await transform(code))).toEqual(js(expected));
	});
}

runTest("wrap-exports", (code) => transformSSR(code, wrapExportsPlugin));
runTest("wrap-exports-fn", (code) => transformSSR(code, wrapExportsPlugin));
runTest("shim-exports", (code) => transformSSR(code, shimExportsPlugin));
runTest("shim-exports-fn", (code) => transformSSR(code, shimExportsPlugin));
runTest("example-1", (code) => transformSSR(code, wrapExportsPlugin));
runTest("example-2", (code) => transformSSR(code, wrapExportsPlugin), "wrap");
runTest("example-2", (code) => transformSSR(code, shimExportsPlugin), "shim");

import { prettyPrint } from "recast";
import { describe, expect, it } from "vitest";

import { parseAdvanced } from "./parse.js";
import {
	decorateExports,
	shimExportsPlugin,
	wrapExports,
	wrapExportsPlugin,
} from "./transform.js";

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

async function runTest(name, transform) {
	it(name, async () => {
		const code = await testFixtures[`./fixtures/${name}.ts`]();
		const expected = await testFixtures[`./fixtures/${name}.snapshot.ts`]();
		expect(js(await transform(code))).toEqual(js(expected));
	});
}

runTest("wrap-exports", (code) => transformSSR(code, wrapExportsPlugin));
runTest("shim-exports", (code) => transformSSR(code, shimExportsPlugin));
runTest("shim-exports-fn", (code) => transformSSR(code, shimExportsPlugin));

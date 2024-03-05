import { prettyPrint } from "recast";
import { describe, expect, it, vi } from "vitest";

import { parseAdvanced } from "./parse.js";
import {
	decorateExports,
	decorateExportsPlugin,
} from "./plugins/decorate-exports.js";
import { shimExportsPlugin } from "./plugins/shim-exports.js";
import { wrapExports } from "./plugins/wrap-exports.js";
import { wrapExportsPlugin } from "./plugins/wrap-exports.js";

const testFixtures = import.meta.glob("./fixtures/**/*.ts", {
	as: "raw",
});

const js = (args) => prettyPrint(parseAdvanced(args.code, {})).code;

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
	const onModuleFound = vi.fn();
	const instance = plugin({
		...args,
		onModuleFound,
	});

	let result = await instance.transform(code, args.id, args.options);
	const data = js(result);
	// expect(onModuleFound.mock.calls.length).toBeGreaterThan(0);
	return data;
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
		expect(await transform(code)).toEqual(js({ code: expected }));
	});
}

runTest("wrap-exports", (code) => transformSSR(code, wrapExportsPlugin));
runTest("wrap-exports-fn", (code) => transformSSR(code, wrapExportsPlugin));
runTest("shim-exports", (code) => transformSSR(code, shimExportsPlugin));
runTest("decorate-exports", (code) =>
	transformSSR(code, decorateExportsPlugin),
);
runTest("shim-exports-fn", (code) => transformSSR(code, shimExportsPlugin));
runTest("example-1", (code) => transformSSR(code, wrapExportsPlugin));
runTest("example-2", (code) => transformSSR(code, wrapExportsPlugin), "wrap");
runTest("example-2", (code) => transformSSR(code, shimExportsPlugin), "shim");
runTest("example-3", (code) => transformSSR(code, wrapExportsPlugin), "wrap");
runTest("example-3", (code) => transformSSR(code, shimExportsPlugin), "shim");
runTest("example-4", (code) => transformSSR(code, shimExportsPlugin), "shim");
runTest("example-4", (code) => transformSSR(code, wrapExportsPlugin), "wrap");
runTest(
	"example-4-fn",
	(code) => transformSSR(code, wrapExportsPlugin),
	"wrap",
);
runTest(
	"example-4-fn",
	(code) => transformSSR(code, shimExportsPlugin),
	"shim",
);
runTest("example-5", (code) => transformSSR(code, shimExportsPlugin), "shim");
runTest("example-5", (code) => transformSSR(code, wrapExportsPlugin), "wrap");

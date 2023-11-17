import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function doc(src) {
	const require = createRequire(import.meta.url);
	const mod = require("@vinxi/deno-doc");
	const resolve = require("resolve");
	// const path = require("path");
	const Module = require("module");
	const fs = require("fs");

	const input = (
		src instanceof URL
			? src
			: pathToFileURL(
					path.isAbsolute(src) ? src : path.join(process.cwd(), src),
			  )
	).toString();

	const resolveFrom = (fromDirectory, moduleId, silent) => {
		if (typeof fromDirectory !== "string") {
			throw new TypeError(
				`Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDirectory}\``,
			);
		}

		if (typeof moduleId !== "string") {
			throw new TypeError(
				`Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``,
			);
		}

		try {
			fromDirectory = fs.realpathSync(fromDirectory);
		} catch (error) {
			if (error.code === "ENOENT") {
				fromDirectory = path.resolve(fromDirectory);
			} else if (silent) {
				return;
			} else {
				throw error;
			}
		}

		const fromFile = path.join(fromDirectory, "noop.js");

		const resolveFileName = () =>
			Module._resolveFilename(moduleId, {
				id: fromFile,
				filename: fromFile,
				paths: Module._nodeModulePaths(fromDirectory),
			});

		if (silent) {
			try {
				return resolveFileName();
			} catch (error) {
				return;
			}
		}

		return resolveFileName();
	};

	function resolvePackage(specifier, referrer) {
		try {
			const resolved = resolve.sync(specifier, {
				preserveSymlinks: false,
				basedir: path.dirname(new URL(referrer).pathname),
				packageFilter: (pkg, _pkgPath) => {
					if (pkg.types?.length) {
						pkg.main = pkg.types;
					}
					return pkg;
				},
				extensions: [".ts", ".tsx", ".d.ts"],
			});
			return "file://" + resolved;
		} catch (e) {
			console.error(e);
			return null;
		}
	}

	function resolveFn(specifier, referrer) {
		if (specifier.startsWith(".") || specifier.startsWith("/")) {
			if (!specifier.endsWith(".ts") && !specifier.endsWith(".tsx")) {
				for (const p of [
					specifier + ".ts",
					specifier + ".tsx",
					specifier + ".d.ts",
					specifier + "/index.ts",
					specifier + "/index.tsx",
					specifier + "/index.d.ts",
				]) {
					let p1 = path.dirname(new URL(referrer).pathname);
					fs.existsSync(path.join(p1, p));
					if (fs.existsSync(path.join(p1, p))) {
						let resolved = path.join(path.dirname(referrer), p);
						return resolved;
					}
				}
			}
		} else {
			return resolvePackage(specifier, referrer);
		}
	}
	return await mod.doc(
		input,
		false,
		async (id) => {
			// if (!id.startsWith("file://")) {
			// 	return null;
			// }
			if (id.endsWith(".css")) {
				return {
					kind: "module",
					specifier: id.replace(/\.css$/, ".css.ts"),
					content: `export default {}`,
				};
			}
			const test = await fs.promises.readFile(fileURLToPath(id), {
				encoding: "utf-8",
			});
			return {
				kind: "module",
				specifier: id,
				content: test,
			};
		},
		resolveFn,
	);
}

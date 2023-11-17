"use strict";

import { isBuiltin } from "node:module";

import { join, resolve } from "../path.js";

const skip = [
	"react/jsx-dev-runtime",
	"react",
	"@vinxi/react-server-dom/runtime",
];

async function getViteModuleNode(vite, file, ssr) {
	if (file.startsWith("node:") || isBuiltin(file)) {
		return null;
	}

	const resolvedId = await vite.pluginContainer.resolveId(file, undefined, {
		ssr: ssr,
	});

	if (!resolvedId) {
		console.log("not found");
		return;
	}

	const id = resolvedId.id;

	const normalizedPath = resolve(id);

	try {
		let node = await vite.moduleGraph.getModuleById(normalizedPath);

		if (!node) {
			const absolutePath = resolve(file);
			node = await vite.moduleGraph.getModuleByUrl(normalizedPath);
			if (!node) {
				if (ssr) {
					await vite.moduleGraph.ensureEntryFromUrl(normalizedPath, ssr);
					node = await vite.moduleGraph.getModuleById(normalizedPath);
				} else {
					await vite.moduleGraph.ensureEntryFromUrl(normalizedPath);
					node = await vite.moduleGraph.getModuleById(normalizedPath);
				}
			}

			if (!node.transformResult && !ssr) {
				await vite.transformRequest(normalizedPath);
				node = await vite.moduleGraph.getModuleById(normalizedPath);
			}

			if (ssr && !node.ssrTransformResult) {
				if (skip.includes(file)) {
					return null;
				}
				await vite.ssrLoadModule(file);
				node = await vite.moduleGraph.getModuleById(normalizedPath);
			}
		} else {
			if (!node.transformResult && !ssr) {
				await vite.transformRequest(normalizedPath);
				node = await vite.moduleGraph.getModuleById(normalizedPath);
			}

			if (ssr && !node.ssrTransformResult) {
				if (skip.includes(file)) {
					return null;
				}
				await vite.ssrLoadModule(normalizedPath);
				node = await vite.moduleGraph.getModuleById(normalizedPath);
			}
		}
		return node;
	} catch (e) {
		console.error(e);
		return null;
	}
}

async function findDeps(vite, node, deps, ssr) {
	// since `ssrTransformResult.deps` contains URLs instead of `ModuleNode`s, this process is asynchronous.
	// instead of using `await`, we resolve all branches in parallel.
	const branches = [];

	async function add(node) {
		if (!deps.has(node)) {
			deps.add(node);
			await findDeps(vite, node, deps, ssr);
		}
	}

	async function add_by_url(url, ssr) {
		const node = await getViteModuleNode(vite, url, ssr);

		if (node) {
			await add(node);
		}
	}

	if (node.url.endsWith(".css")) {
		return;
	}
	if (ssr && node.ssrTransformResult) {
		if (node.ssrTransformResult.deps) {
			node.ssrTransformResult.deps.forEach((url) =>
				branches.push(add_by_url(url, ssr)),
			);
		}

		// if (node.ssrTransformResult.dynamicDeps) {
		//   node.ssrTransformResult.dynamicDeps.forEach(url => branches.push(add_by_url(url)));
		// }
	} else if (!ssr) {
		node.importedModules.forEach((node) =>
			branches.push(add_by_url(node.url, ssr)),
		);
	}

	await Promise.all(branches);
}

// Vite doesn't expose this so we just copy the list for now
// https://github.com/vitejs/vite/blob/3edd1af56e980aef56641a5a51cf2932bb580d41/packages/vite/src/node/plugins/css.ts#L96
const STYLE_ASSET_REGEX = /\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/;
const MODULE_STYLE_ASSET_REGEX =
	/\.module\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/;

/**
 *
 * @param {import('vite').ViteDevServer} vite
 * @param {*} match
 * @returns
 */
async function findDependencies(vite, match, ssr) {
	const deps = new Set();
	try {
		for (const file of match) {
			const node = await getViteModuleNode(vite, file, ssr);
			if (node) {
				await findDeps(vite, node, deps, ssr);
			}
		}
	} catch (e) {
		console.error(e);
	}

	return deps;
}

/**
 *
 * @param {import('vite').ViteDevServer} vite
 * @param {*} match
 * @returns
 */
async function findStylesInModuleGraph(vite, match, ssr) {
	const styles = {};
	const dependencies = await findDependencies(vite, match, ssr);

	for (const dep of dependencies) {
		const parsed = new URL(dep.url, "http://localhost/");
		const query = parsed.searchParams;

		if (STYLE_ASSET_REGEX.test(dep.file ?? "")) {
			try {
				const mod = await vite.ssrLoadModule(dep.url);
				// if (module_STYLE_ASSET_REGEX.test(dep.file)) {
				// 	styles[dep.url] = env.cssModules?.[dep.file];
				// } else {
				styles[join(vite.config.root, dep.url)] = mod.default;
				// }
			} catch {
				// this can happen with dynamically imported modules, I think
				// because the Vite module graph doesn't distinguish between
				// static and dynamic imports? TODO investigate, submit fix
			}
		}
	}
	return styles;
}

export default findStylesInModuleGraph;

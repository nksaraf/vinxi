"use strict";

import { join, resolve } from "../path.js";

import { isBuiltin } from "node:module";

const skip = [
	"react/jsx-dev-runtime",
	"react",
	"@vinxi/react-server-dom/runtime",
];

async function getViteModuleNode(vite, file, ssr) {
	if (file.startsWith("node:") || isBuiltin(file)) {
		return null;
	}

	let nodePath = file;

	let node = await vite.moduleGraph.getModuleById(nodePath);
	if (!node) {
		const resolvedId = await vite.pluginContainer.resolveId(file, undefined, {
			ssr: ssr,
		});

		if (!resolvedId) {
			console.log("not found");
			return;
		}
		nodePath = resolvedId.id;
		node = await vite.moduleGraph.getModuleById(nodePath);
	}

	if (!node) {
		nodePath = resolve(nodePath);
		node = await vite.moduleGraph.getModuleByUrl(nodePath);
	}

	// Only not sure what to do with absolutePath as this is currently also not used.
	// https://github.com/nksaraf/vinxi/blob/06700abbbbae34015faeba84830797daf4f54817/packages/vinxi/lib/manifest/collect-styles.js#L35

	// if (!node) {
	// 	nodePath = resolve(file); // absolute path
	// 	node = await vite.moduleGraph.getModuleByUrl(nodePath);
	// }

	if (!node) {
		await vite.moduleGraph.ensureEntryFromUrl(nodePath, ssr);
		node = await vite.moduleGraph.getModuleById(nodePath);
	}

	if (nodePath.includes('node_modules')) {
		return;
	}

	let prev = vite.config.logger.error;
	vite.config.logger.error = () => {};
	try {
		if (!node.transformResult && !ssr) {
			await vite.transformRequest(nodePath);
			node = await vite.moduleGraph.getModuleById(nodePath);
		}

		if (ssr && !node.ssrTransformResult) {
			if (skip.includes(file)) {
				return null;
			}
			await vite.ssrLoadModule(file);
			node = await vite.moduleGraph.getModuleById(nodePath);
		}

		vite.config.logger.error = prev;
		return node;
	} catch (e) {
		vite.config.logger.error = prev;
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

// Vite doesn't expose these so we just copy the list for now
// https://github.com/vitejs/vite/blob/d6bde8b03d433778aaed62afc2be0630c8131908/packages/vite/src/node/constants.ts#L49C23-L50
const cssFileRegExp =
	/\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
// https://github.com/vitejs/vite/blob/d6bde8b03d433778aaed62afc2be0630c8131908/packages/vite/src/node/plugins/css.ts#L160
const cssModulesRegExp = new RegExp(`\\.module${cssFileRegExp.source}`);

const isCssFile = (/** @type {string} */ file) => cssFileRegExp.test(file);
export const isCssModulesFile = (/** @type {string} */ file) =>
	cssModulesRegExp.test(file);

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

		if (isCssFile(dep.url ?? "")) {
			try {
				const mod = await vite.ssrLoadModule(dep.url);
				if (isCssModulesFile(dep.file)) {
					styles[join(vite.config.root, dep.url)] = vite.cssModules?.[dep.file];
				} else {
					styles[join(vite.config.root, dep.url)] = mod.default;
				}
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

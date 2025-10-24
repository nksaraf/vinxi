import { log } from "console";

import { join, relative } from "../path.js";
import { createViteManifest } from "./create-vite-manifest.js";
import findAssetsInViteManifest from "./vite-manifest.js";

/**
 * @param {{ src: string, pick: string[] }} route
 * @returns {string}
 */
function toRouteId(route) {
	return `${route.src}?${route.pick.map((p) => `pick=${p}`).join("&")}`;
}

/**
 * @param {import('../service-mode.js').Service} service
 * @returns {Promise<(string | undefined)[]>}
 */
async function getEntries(service) {
	return [
		service.handler,
		...(
			((await service.internals.routes?.getRoutes()) ?? []).map((r) =>
				Object.entries(r)
					.filter(([r, v]) => v && r.startsWith("$") && !r.startsWith("$$"))
					.map(([, v]) => toRouteId(v)),
			) ?? []
		).flat(),
	];
}

/**
 *
 * @param {import('../vite-dev.d.ts').ViteConfig} config
 * @param {*} bundle
 * @param {*} format
 * @returns
 */
export async function createSPAManifest(config, bundle, format) {
	const manifest = createViteManifest(config, bundle, format);
	/** @type {Record<string, any>} */
	let routeManifest = {};
	if (config.service && config.service.internals.routes) {
		const entries = await getEntries(config.service);

		log(entries);

		for (const route of entries) {
			routeManifest[relative(config.service.root, route)] = {
				output: join(
					config.base,
					manifest[relative(config.service.root, route)].file,
				),
				assets: findAssetsInViteManifest(
					manifest,
					relative(config.service.root, route),
				)
					.filter((asset) => asset.endsWith(".css"))
					.map((asset) => ({
						tag: "link",
						attrs: {
							href: join(config.base, asset),
							key: join(config.base, asset),
							rel: "stylesheet",
							fetchPriority: "high",
						},
					})),
			};
		}
	}
	return routeManifest;
}

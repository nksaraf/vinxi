import { loadConfig } from "c12";
import chokidar from "chokidar";

import { createApp } from "./app.js";

/**
 *
 * @param {string | undefined} configFile
 * @returns {Promise<import("./app.js").App>}
 */
export async function loadApp(configFile = undefined) {
	/** @type {{ config: import("./app.js").App }}*/
	try {
		let { config: app } = await loadConfig(
			configFile
				? {
						configFile,
						jitiOptions: {
							esmResolve: true,
							nativeModules: ["acorn"],
						},
				  }
				: {
						name: "app",
						jitiOptions: {
							esmResolve: true,
							nativeModules: ["acorn"],
						},
				  },
		);

		if (!app.config) {
			const { config } = await loadConfig({
				name: "vite",
				jitiOptions: {
					esmResolve: true,
					nativeModules: ["acorn"],
				},
			});

			if (config.config) {
				console.warn("Found vite.config.js with app config");
				// @ts-expect-error trying to send c12's config as app
				return config;
			} else {
				console.warn("No app config found. Assuming SPA app.");
				return createApp({
					routers: [
						{
							name: "public",
							mode: "static",
							dir: "./public",
						},
						{
							name: "client",
							mode: "spa",
							handler: "./index.html",
							target: "browser",
							plugins: () => config.plugins ?? [],
						},
					],
				});
			}
		}

		return app;
	} catch (e) {
		console.error(e);

		return undefined;
	}
}

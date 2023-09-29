import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineNuxtConfig({
	extends: "@nuxt-themes/docus",
	nitro: {
		routeRules: {
			"/**": {
				headers: {
					"Cross-Origin-Opener-Policy": "same-origin",
					"Cross-Origin-Embedder-Policy": "credentialless",
				},
			},
		},
	},
	vite: {
		define: {
			"process.env.NODE_DEBUG": "false",
		},
		server: {
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
		},
		plugins: [
			nodePolyfills({
				globals: true,
			}),
		],
	},
});

import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Vinxi",
	description: "Vinxi Documentation",
	// rewrites: {
	// 	"/guide/using-plugins": "https://vitejs.dev/guide/using-plugins.html",
	// },

	themeConfig: {
		logo: "/favicon.ico",
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Guide", link: "/guide/getting-started" },
			{ text: "Reference", link: "/reference" },
		],

		sidebar: [
			{
				text: "Guide",
				items: [
					{ text: "Why Vinxi", link: "/guide/why-vinxi" },
					{ text: "Get Started", link: "/guide/getting-started" },
					{
						text: "Create your first app",
						link: "/guide/create-your-first-app",
					},
					{
						text: "Upgrade existing Vite app",
						link: "/guide/add-to-existing-vite-app",
					},
					{
						text: "Build Your Own Framework",
						link: "/guide/build-your-own-framework",
					},
					{
						text: "Configuring Vinxi",
						items: [
							{ text: "Vite Plugins", link: "/guide/vite-plugins" },
							{ text: "Path Aliases", link: "/guide/aliases" },
							{ text: "Route Rules", link: "/guide/route-rules" },
							{
								text: "File System Routing",
								link: "/guide/file-system-routing",
							},
						],
					},
				],
			},
			{
				text: "APIs",
				items: [
					{ text: "App API", link: "/api/app" },
					{
						text: "Router API",
						link: "/api/router",
						items: [
							{ text: `"static"`, link: "/api/router/static" },
							{ text: `"http"`, link: "/api/router/http" },
							{ text: `"spa"`, link: "/api/router/spa" },
							{ text: `"client"`, link: "/api/router/client" },
							{ text: `custom`, link: "/api/router/custom" },
						],
					},
					{ text: "vinxi CLI", link: "/api/cli" },
					{
						text: "Server API",
						// link: "/api/server/runtime",
						items: [
							{ text: "Request", link: "/api/server/request" },
							{ text: "Response", link: "/api/server/response" },
							{ text: "Cookies", link: "/api/server/cookies" },
							{ text: "Session", link: "/api/server/session" },
						],
					},
					{ text: "Manifest API", link: "/api/manifest" },
				],
			},
			{
				text: "Resources",
				items: [
					{ text: "A Story", link: "/guide/a-story" },
					{ text: "Philosophy", link: "/guide/philosophy" },
				],
			},
		],
		outline: {
			level: [2, 3],
		},

		socialLinks: [{ icon: "github", link: "https://github.com/nksaraf/vinxi" }],
	},
	markdown: {
		codeTransformers: [
			transformerTwoslash({
				explicitTrigger: true,
			}),
		],
	},
});

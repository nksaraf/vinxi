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
				link: "/guide",
				items: [
					{ text: "Why Vinxi", link: "/guide/why-vinxi" },
					{ text: "Getting Started", link: "/guide/getting-started" },
					{
						text: "Build Your Own Framework",
						link: "/guide/build-your-own-framework",
					},
					{
						text: "Core Concepts",
						items: [
							{ text: "What is an App", link: "/guide/what-is-an-app" },
							{ text: "What is a Router", link: "/guide/what-is-a-router" },
						],
					},
					{
						text: "Extending Vinxi",
						items: [
							{ text: "Vite Plugins", link: "/guide/vite-plugins" },
							{ text: "Path Aliases", link: "/guide/aliases" },
						],
					},
					{ text: "A Story", link: "/guide/a-story" },
					{ text: "Philosophy", link: "/guide/philosophy" },
				],
			},
			{
				text: "APIs",
				link: "/api",
				items: [
					{ text: "App API", link: "/api/app" },
					{ text: "vinxi CLI", link: "/api/cli" },
					{
						text: "Server API",
						link: "/api/server/runtime",
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
		],
		outline: {
			level: [2, 3],
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/vuejs/vitepress" },
		],
	},
	markdown: {
		codeTransformers: [
			transformerTwoslash({
				explicitTrigger: true,
				
			}),
		],
	},
});

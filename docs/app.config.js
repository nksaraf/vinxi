import { remarkCodeHike } from "@code-hike/mdx";
import { slugifyWithCounter } from "@sindresorhus/slugify";
import pkg from "@vinxi/plugin-mdx";
import reactRefresh from "@vitejs/plugin-react";
import acorn from "acorn";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { createApp, resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/fs-router";
import { config } from "vinxi/plugins/config";
import tsconfigPaths from "vite-tsconfig-paths";

const getText = (node) => {
	if (node.type === "text") {
		return node.value;
	} else if (node.children) {
		return node.children.map(getText).join("");
	} else {
		return "";
	}
};
function rehypeSlugify() {
	return (tree) => {
		let slugify = slugifyWithCounter();
		visit(tree, "element", (node) => {
			if (node.tagName === "h2" && !node.properties.id) {
				console.log(getText(node));
				node.properties.id = slugify(getText(node));
			}
		});
	};
}

const { default: mdx } = pkg;

function rehypeAddMDXExports(getExports) {
	return (tree) => {
		let exports = Object.entries(getExports(tree));

		for (let [name, value] of exports) {
			for (let node of tree.children) {
				if (
					node.type === "mdxjsEsm" &&
					new RegExp(`export\\s+const\\s+${name}\\s*=`).test(node.value)
				) {
					return;
				}
			}

			let exportStr = `export const ${name} = ${value}`;

			tree.children.push({
				type: "mdxjsEsm",
				value: exportStr,
				data: {
					estree: acorn.parse(exportStr, {
						sourceType: "module",
						ecmaVersion: "latest",
					}),
				},
			});
		}
	};
}

function getSections(node) {
	let sections = [];

	for (let child of node.children ?? []) {
		if (child.type === "element" && child.tagName === "h2") {
			console.log(child);
			sections.push(`{
        title: ${JSON.stringify(getText(child))},
        id: ${JSON.stringify(child.properties.id)},
      }`);
		} else if (child.children) {
			sections.push(...getSections(child));
		}
	}
	console.log(sections);

	return sections;
}

class WouterFileSystemRouter extends BaseFileSystemRouter {
	toPath(src) {
		const routePath = cleanPath(src, this.config)
			// remove the initial slash
			.slice(1)
			.replace(/index$/, "")
			.replace(/\[([^\/]+)\]/g, (_, m) => {
				if (m.length > 3 && m.startsWith("...")) {
					return `*${m.slice(3)}`;
				}
				if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
					return `:${m.slice(1, -1)}?`;
				}
				return `:${m}`;
			});

		return routePath?.length > 0 ? `/${routePath}` : "/";
	}

	toRoute(src) {
		let path = this.toPath(src);
		return {
			$component: {
				src: src,
				pick: src.match(/\.mdx?$/) ? [] : ["default", "$css"],
			},
			$$sections: src.match(/\.mdx?$/)
				? {
						src: src,
						pick: ["sections"],
				  }
				: undefined,
			path,
			filePath: src,
		};
	}
}

function wouterFileRouter(config) {
	return (router, app) =>
		new WouterFileSystemRouter(
			{
				dir: resolve.absolute(config.dir, router.root),
				extensions: config.extensions ?? [
					"js",
					"jsx",
					"ts",
					"tsx",
					"mdx",
					"md",
				],
			},
			router,
			app,
		);
}

export default createApp({
	server: {
		routeRules: {
			"**/*": {
				headers: {
					"Cross-Origin-Embedder-Policy": "require-corp",
					"Cross-Origin-Opener-Policy": "same-origin",
				},
			},
		},
	},
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
			routes: wouterFileRouter({ dir: "./app/pages" }),
			target: "browser",
			plugins: () => [
				config("headers", {
					server: {
						"Cross-Origin-Embedder-Policy": "require-corp",
						"Cross-Origin-Opener-Policy": "same-origin",
					},
				}),
				tsconfigPaths(),
				mdx.withImports({
					react: "React",
				})({
					providerImportSource: "@mdx-js/react",
					rehypePlugins: [
						rehypeSlugify,
						[
							rehypeAddMDXExports,
							(tree) => ({
								sections: `[${getSections(tree).join()}]`,
							}),
						],
					],
					remarkPlugins: [[remarkCodeHike, { theme: "material-palenight" }]],
				}),
				reactRefresh({}),
			],
		},
	],
});

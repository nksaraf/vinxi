/// <reference types="vinxi/server" />
/// <reference types="@cloudflare/workers-types"	/>
import { renderAsset } from "@vinxi/react";
import React, { Suspense } from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import { createCall, createFetch } from "unenv/runtime/fetch/index";
import {
	H3Event,
	eventHandler,
	lazyEventHandler,
	sendStream,
	toNodeListener,
} from "vinxi/runtime/server";
import { createApp } from "vinxi/runtime/server";

import App from "./app";

declare global {
	interface ImportMetaEnv {
		KV: KVNamespace;
	}
}

export default lazyEventHandler(async () => {
	const handler = eventHandler(async (event) => {
		const { env } = import.meta.env.DEV
			? globalThis.cloudflare
			: event.context.cloudflare;
		const clientManifest = import.meta.env.MANIFEST["client"];
		const assets = await clientManifest.inputs[clientManifest.handler].assets();
		console.log(
			await env.KV.put(
				"counter",
				JSON.stringify(Number((await env.KV.get("counter")) ?? 0) + 1),
			),
		);

		const counter = JSON.parse((await env.KV.get("counter")) ?? "0");
		const stream = await renderToReadableStream(
			<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>}>
				{counter}
			</App>,
			{
				bootstrapModules: [
					clientManifest.inputs[clientManifest.handler].output.path,
				],
				bootstrapScriptContent: `window.manifest = ${JSON.stringify(
					await clientManifest.json(),
				)}`,
			},
		);

		event.node.res.setHeader("Content-Type", "text/html");
		return stream;
	});

	if (import.meta.env.DEV) {
		const { Miniflare } = await import("miniflare");
		const { default: viteServer } = await import("#vite-dev-server");
		const { createServer } = await import("../dev-server");

		const mf = new Miniflare({
			script: `
        export default {
          fetch: async (request, env) => {
            return await serve(request, env, globalThis);
          }
        }

        export const WebSocketDurableObject = WebSocketDurableObject1;
      `,
			globals: {
				WebSocketDurableObject1: class DO {
					state;
					env;
					promise;
					constructor(state, env) {
						this.state = state;
						this.env = env;
						this.promise = this.createProxy(state, env);
					}

					async createProxy(state, env) {
						const { WebSocketDurableObject } = await vite.ssrLoadModule(
							"~start/entry-server",
						);
						return new WebSocketDurableObject(state, env);
					}

					async fetch(request) {
						console.log("DURABLE_OBJECT", request.url);

						try {
							let dObject = await this.promise;
							return await dObject.fetch(request);
						} catch (e) {
							console.log("error", e);
						}
					}
				},
				serve: async (req, e, g) => {
					const {
						Request,
						Response,
						fetch,
						crypto,
						Headers,
						ReadableStream,
						WritableStream,
						WebSocketPair,
						TransformStream,
					} = g;
					Object.assign(globalThis, {
						Request,
						Response,
						fetch,
						crypto,
						Headers,
						ReadableStream,
						WritableStream,
						TransformStream,
						WebSocketPair,
					});

					console.log(
						"🔥",
						req.headers.get("Upgrade") === "websocket"
							? "WEBSOCKET"
							: req.method,
						req.url,
					);

					if (req.headers.get("Upgrade") === "websocket") {
						const url = new URL(req.url);
						console.log(url.search);
						const durableObjectId = e.DO_WEBSOCKET.idFromName(
							url.pathname + url.search,
						);
						const durableObjectStub = e.DO_WEBSOCKET.get(durableObjectId);
						const response = await durableObjectStub.fetch(req);
						return response;
					}

					const request = req;

					try {
						const url = new URL(request.url);

						// https://deno.land/api?s=Body
						let body;
						if (request.body) {
							body = await request.arrayBuffer();
						}

						const app = createApp();
						app.use(handler);

						console.log(e);
						globalThis.cloudflare = { env: e };

						const f = createFetch(createCall(toNodeListener(app)));

						const d = await f(url.pathname + url.search, {
							host: url.hostname,
							protocol: url.protocol,
							headers: request.headers,
							method: request.method,
							redirect: request.redirect,
							body,
						});

						console.log(d);

						// const req = new IncomingMessage();
						return d;
					} catch (e) {
						console.log("error", e);
						return new Response(e.toString(), { status: 500 });
					}
				},
			},
			modules: true,
			kvPersist: true,
			compatibilityFlags: ["streams_enable_constructors"],
			kvNamespaces: ["KV"],
			// ...miniflareOptions,
		});

		console.log("🔥", "starting miniflare");

		const listener = await createServer(viteServer, mf, {});
		return eventHandler(async (event) => {
			// const clientManifest = import.meta.env.MANIFEST["client"];
			// const assets = await clientManifest.inputs[clientManifest.handler].assets();
			// const events = {};
			// const stream = await new Promise(async (resolve) => {
			// 	const stream = renderToPipeableStream(
			// 		<App
			// 			assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>}
			// 		/>,
			// 		{
			// 			onShellReady() {
			// 				resolve(stream);
			// 			},
			// 			bootstrapModules: [
			// 				clientManifest.inputs[clientManifest.handler].output.path,
			// 			],
			// 			bootstrapScriptContent: `window.manifest = ${JSON.stringify(
			// 				await clientManifest.json(),
			// 			)}`,
			// 		},
			// 	);
			// });

			// // @ts-ignore
			// stream.on = (event, listener) => {
			// 	events[event] = listener;
			// };

			const response = await listener(event.node.req, event.node.res);

			// event.node.res.setHeader("Content-Type", "text/html");
			return response;
		});
	} else {
		return handler;
	}
});

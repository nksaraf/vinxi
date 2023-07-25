/// <reference types="vinxi/server" />
import viteServer from "#vite-dev-server";
import { renderAsset } from "@vinxi/react";
import * as ReactServerDOM from "@vinxi/react-server-dom-vite/client";
import { createModuleLoader } from "@vinxi/react-server-dom-vite/runtime";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { H3Event, eventHandler, fetchWithEvent } from "vinxi/runtime/server";

import { Readable, Writable } from "node:stream";

const modulePromiseCache = new Map();

export default eventHandler(async (event) => {
	globalThis.__vite__ = createModuleLoader(
		import.meta.env.DEV
			? viteServer
			: {
					loadModule: async (id) => {
						if (globalThis.$$chunks[id + ".js"]) {
							return globalThis.$$chunks[id + ".js"];
						}
						console.log(id);
						return await import(
							import.meta.env.MANIFEST["ssr"].chunks[id].output.path
						);
					},
			  },
	);

	const readable = new Readable({
		objectMode: true,
	});
	readable._read = () => {};
	readable.headers = {};

	const writableStream = new Writable({
		write(chunk, encoding, callback) {
			console.log("chunk", chunk);

			readable.push(chunk);
			callback();
		},
	});
	writableStream.setHeader = () => {};

	writableStream.on("finish", () => {
		// parentPort?.postMessage(
		//   JSON.stringify({
		//     chunk: "end",
		//     id: rest.id,
		//   })
		// );
		console.log("finish");

		readable.push(null);
		readable.destroy();
	});

	event.node.req.url = `/_rsc` + event.node.req.url;

	$handle(new H3Event(event.node.req, writableStream));

	const clientManifest = import.meta.env.MANIFEST["client"];

	const events = {};
	console.log("element", "here");

	const element = await ReactServerDOM.createFromNodeStream(readable);

	console.log("element", element);

	const stream = await renderToPipeableStream(element, {
		bootstrapModules: [
			clientManifest?.inputs[clientManifest.handler].output.path,
		].filter(Boolean) as string[],
		bootstrapScriptContent: `
			window.base = "${import.meta.env.BASE_URL}"; window.manifest= ${JSON.stringify(
			await import.meta.env.MANIFEST["client"].json(),
		)}`,

		// 	{
		onAllReady: () => {
			events["end"]?.();
		},
		// 		bootstrapModules: [
		// 			clientManifest.inputs[clientManifest.handler].output.path,
		// 		],
		// 		bootstrapScriptContent: `window.manifest = ${JSON.stringify(
		// 			await clientManifest.json(),
		// 		)}`,
		// 	},
	});

	// const clientManifest = import.meta.env.MANIFEST["client"];
	// const assets = await clientManifest.inputs[clientManifest.handler].assets();
	// const events = {};
	// const stream = renderToPipeableStream(
	// 	<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>} />,
	// 	{
	// 		onAllReady: () => {
	// 			events["end"]?.();
	// 		},
	// 		bootstrapModules: [
	// 			clientManifest.inputs[clientManifest.handler].output.path,
	// 		],
	// 		bootstrapScriptContent: `window.manifest = ${JSON.stringify(
	// 			await clientManifest.json(),
	// 		)}`,
	// 	},
	// );

	// @ts-ignore
	stream.on = (event, listener) => {
		console.log("on", "event", event);

		events[event] = listener;
	};

	console.log("render");

	event.node.res.setHeader("Content-Type", "text/html");
	return stream;
});

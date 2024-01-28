/// <reference types="vinxi/types/server" />
import viteServer from "#vite-dev-server";
import { renderAsset } from "@vinxi/react";
import * as ReactServerDOM from "@vinxi/react-server-dom/client";
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { H3Event, eventHandler, fetchWithEvent } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

import { Readable, Writable } from "node:stream";

import App from "./app";

export default eventHandler(async (event) => {
	globalThis.__vite__ = createModuleLoader(viteServer);

	const readable = new Readable({
		objectMode: true,
	});
	readable._read = () => {};
	readable.headers = {};

	const writableStream = new Writable({
		write(chunk, encoding, callback) {
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

		readable.push(null);
		readable.destroy();
	});

	event.node.req.url = `/_rsc` + event.node.req.url;

	$handle(new H3Event(event.node.req, writableStream));

	const clientManifest = getManifest("client");

	const events = {};

	const element = await ReactServerDOM.createFromNodeStream(readable);

	const stream = renderToPipeableStream(element, {
		bootstrapModules: [
			clientManifest?.inputs[clientManifest.handler].output.path,
		].filter(Boolean) as string[],
		bootstrapScriptContent: `
			window.base = "${import.meta.env.BASE_URL}";`,
		// 	{
		// onAllReady: () => {
		// 	events["end"]?.();
		// },
		// 		bootstrapModules: [
		// 			clientManifest.inputs[clientManifest.handler].output.path,
		// 		],
		// 		bootstrapScriptContent: `window.manifest = ${JSON.stringify(
		// 			await clientManifest.json(),
		// 		)}`,
		// 	},
	});

	// const clientManifest = getManifest("client");
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
	event.node.res.setHeader("Content-Type", "text/html");
	return stream;
});

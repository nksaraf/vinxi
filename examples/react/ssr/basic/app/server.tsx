/// <reference types="vinxi/types/server" />
import { renderAsset } from "@vinxi/react";
import { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { defineWebSocket, eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

import App from "./app";

export default eventHandler({
	handler: async (event) => {
		const clientManifest = getManifest("client");
		const assets = await clientManifest.inputs[clientManifest.handler].assets();
		const events = {};
		const stream = await new Promise(async (resolve) => {
			const stream = renderToPipeableStream(
				<App
					assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>}
				/>,
				{
					onShellReady() {
						resolve(stream);
					},
					bootstrapModules: [
						clientManifest.inputs[clientManifest.handler].output.path,
					],
					bootstrapScriptContent: `window.manifest = ${JSON.stringify(
						await clientManifest.json(),
					)}`,
				},
			);
		});

		event.node.res.setHeader("Content-Type", "text/html");
		return stream;
	},
	websocket: defineWebSocket({
		open: (event) => {
			console.log("WebSocket opened");
		},
		message: (event) => {
			console.log("WebSocket message", event);
			event.send("Hello");
		},
	}),
});

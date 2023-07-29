import { renderAsset } from "@vinxi/react";
import { renderToPipeableStream } from "@vinxi/react-server-dom-vite/server";
import React, { Suspense } from "react";
import { eventHandler, sendStream } from "vinxi/runtime/server";

import App from "./app";

export default eventHandler(async (event) => {
	console.log("event", event);
	async function loadModule(id) {
		if (import.meta.env.DEV) {
			console.log(import.meta.env.MANIFEST["rsc"].chunks[id].output.path);
			return await import(
				import.meta.env.MANIFEST["rsc"].chunks[id].output.path
			);
		}

		console.log(id, globalThis.$$chunks);
		if (globalThis.$$chunks[id + ".js"]) {
			return globalThis.$$chunks[id + ".js"];
		}
		return await import(import.meta.env.MANIFEST["rsc"].chunks[id].output.path);
	}
	if (event.node.req.method === "POST") {
		const {
			renderToPipeableStream,
			decodeReply,
			decodeReplyFromBusboy,
			decodeAction,
		} = await import("@vinxi/react-server-dom-vite/server");
		const serverReference = event.node.req.headers["rsc-action"];
		if (serverReference) {
			// This is the client-side case
			const [filepath, name] = serverReference.split("#");
			const action = (await loadModule(filepath))[name];
			// Validate that this is actually a function we intended to expose and
			// not the client trying to invoke arbitrary functions. In a real app,
			// you'd have a manifest verifying this before even importing it.
			if (action.$$typeof !== Symbol.for("react.server.reference")) {
				throw new Error("Invalid action");
			}

			let args;
			// if (req.is('multipart/form-data')) {
			//   // Use busboy to streamingly parse the reply from form-data.
			//   const bb = busboy({headers: req.headers});
			//   const reply = decodeReplyFromBusboy(bb, moduleBasePath);
			//   req.pipe(bb);
			//   args = await reply;
			// } else {
			const text = await new Promise((resolve) => {
				const requestBody = [];
				event.node.req.on("data", (chunks) => {
					console.log(chunks);
					requestBody.push(chunks);
				});
				event.node.req.on("end", () => {
					resolve(requestBody.join(""));
				});
			});
			console.log(text);

			args = await decodeReply(text);
			console.log(args, action);
			// }
			const result = action.apply(null, args);
			try {
				// Wait for any mutations
				await result;
			} catch (x) {
				// We handle the error on the client
			}
			// Refresh the client and return the value
			// return {};
		} else {
			throw new Error("Invalid request");
		}
	}
	console.log("rendering");
	const reactServerManifest = import.meta.env.MANIFEST["rsc"];
	const serverAssets = await reactServerManifest.inputs[
		reactServerManifest.handler
	].assets();
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs[clientManifest.handler].assets();

	const events = {};
	const stream = renderToPipeableStream(
		<App
			assets={
				<Suspense>
					{serverAssets.map((m) => renderAsset(m))}
					{assets.map((m) => renderAsset(m))}
				</Suspense>
			}
		/>,
	);

	stream.on = (event, listener) => {
		console.log(event, listener);
		events[event] = listener;
	};

	event.node.res.setHeader("Content-Type", "text/x-component");
	event.node.res.setHeader("Router", "rsc");

	console.log(stream);

	return stream;
});

import { renderAsset } from "@vinxi/react";
import * as RSDV from "@vinxi/react-server-dom/server";
import React, { Suspense } from "react";
import { eventHandler } from "vinxi/runtime/server";

import App from "./app";

export default eventHandler(async (event) => {
	if (event.node.req.method === "POST") {
		const {
			renderToPipeableStream,
			decodeReply,
			decodeReplyFromBusboy,
			decodeAction,
		} = await import("@vinxi/react-server-dom/server");
		const serverReference = event.node.req.headers["server-action"];
		if (serverReference) {
			// This is the client-side case
			const [filepath, name] = serverReference.split("#");
			const action = (
				await import(
					import.meta.env.MANIFEST["rsc"].inputs[filepath].output.path
				)
			)[name];
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
					requestBody.push(chunks);
				});
				event.node.req.on("end", () => {
					resolve(Buffer.concat(requestBody).toString());
				});
			});
			console.log(text);

			args = await decodeReply(text);
			console.log(args);
			// }
			const result = action.apply(null, args);
			try {
				// Wait for any mutations
				await result;
			} catch (x) {
				// We handle the error on the client
			}
			// Refresh the client and return the value
			return {};
		} else {
			throw new Error("Invalid request");
		}
	}
	const reactServerManifest = import.meta.env.MANIFEST["rsc"];
	const serverAssets = await reactServerManifest.inputs[
		reactServerManifest.handler
	].assets();
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs[clientManifest.handler].assets();

	const events = {};
	const stream = RSDV.renderToPipeableStream(
		<App
			assets={
				<Suspense>
					{serverAssets.map((m) => renderAsset(m))}
					{assets.map((m) => renderAsset(m))}
				</Suspense>
			}
		/>,
	);

	// @ts-ignore
	stream._read = () => {};
	// @ts-ignore
	stream.on = (event, listener) => {
		events[event] = listener;
	};
	event.node.res.setHeader("Content-Type", "text/x-component");
	event.node.res.setHeader("Router", "rsc");
	return stream;
});

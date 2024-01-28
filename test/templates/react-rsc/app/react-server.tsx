import { renderAsset } from "@vinxi/react";
import { renderToPipeableStream } from "@vinxi/react-server-dom/server";
import { Suspense } from "react";
import { eventHandler, readRawBody, setHeader } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

import App from "./app";

export default eventHandler(async (event) => {
	const reactServerManifest = getManifest("rsc");
	const clientManifest = getManifest("client");
	if (event.method === "POST") {
		const {
			renderToPipeableStream,
			decodeReply,
			decodeReplyFromBusboy,
			decodeAction,
		} = await import("@vinxi/react-server-dom/server");
		const serverReference = event.headers.get("server-action");
		if (serverReference) {
			// This is the client-side case
			const [chunk, name] = serverReference.split("#");
			const action = (await reactServerManifest.chunks[chunk].import())[name];
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
			const text = await readRawBody(event);

			args = await decodeReply(text);
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
	const serverAssets = await reactServerManifest.inputs[
		reactServerManifest.handler
	].assets();
	const assets = await clientManifest.inputs[clientManifest.handler].assets();

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

	setHeader(event, "Content-Type", "text/x-component");
	setHeader(event, "Router", "rsc");

	return stream;
});

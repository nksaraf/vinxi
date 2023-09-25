// import { renderAsset } from "@vinxi/react";
// import { renderToPipeableStream } from "@vinxi/react-server-dom/server";
// import React, { Suspense } from "react";
import { eventHandler, sendStream } from "vinxi/server";

// import App from "./app";

export default eventHandler(async (event) => {
	async function loadModule(id) {
		if (import.meta.env.DEV) {
			return await import(
				import.meta.env.MANIFEST["rsc"].chunks[id].output.path
			);
		}

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
		} = await import("@vinxi/react-server-dom/server");
		const serverReference = event.node.req.headers["server-action"];
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
			const text = await new Promise((resolve) => {
				const requestBody = [];
				event.node.req.on("data", (chunks) => {
					requestBody.push(chunks);
				});
				event.node.req.on("end", () => {
					resolve(requestBody.join(""));
				});
			});

			args = await decodeReply(text);
			const result = action.apply(null, args);
			try {
				// Wait for any mutations
				await result;
				const events = {};
				const stream = renderToPipeableStream(result);

				event.node.res.setHeader("Content-Type", "application/json");
				event.node.res.setHeader("Router", "server");

				return stream;
			} catch (x) {
				// We handle the error on the client
			}
			// Refresh the client and return the value
			// return {};
		} else {
			throw new Error("Invalid request");
		}
	}
});

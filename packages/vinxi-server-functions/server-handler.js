/// <reference types="vinxi/types/server" />
import invariant from "vinxi/lib/invariant";
import { eventHandler, toWebRequest } from "vinxi/server";

async function loadModule(id) {
	if (import.meta.env.DEV) {
		const mod = await import(
			/* @vite-ignore */
			import.meta.env.MANIFEST["server"].chunks[id].output.path
		);
		return mod;
	}

	if (globalThis.$$chunks[id + ".js"]) {
		return globalThis.$$chunks[id + ".js"];
	}
	return await import(
		/* @vite-ignore */
		import.meta.env.MANIFEST["server"].chunks[id].output.path
	);
}

export async function handleServerAction(event) {
	invariant(event.method === "POST", "Invalid method");

	const serverReference = event.node.req.headers["server-action"];
	if (serverReference) {
		invariant(typeof serverReference === "string", "Invalid server action");
		// This is the client-side case
		const [filepath, name] = serverReference.split("#");
		const action = (await loadModule(filepath))[name];
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
		const json = JSON.parse(text);
		const result = action.apply(null, json);
		try {
			// Wait for any mutations
			const response = await result;
			event.node.res.setHeader("Content-Type", "application/json");
			event.node.res.setHeader("Router", "server");

			return JSON.stringify(response ?? null);
		} catch (x) {
			console.error(x);
		}
	} else {
		throw new Error("Invalid request");
	}
}

export default eventHandler(handleServerAction);

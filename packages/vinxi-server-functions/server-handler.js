/// <reference types="vinxi/types/server" />
import invariant from "vinxi/lib/invariant";
import { eventHandler, toWebRequest } from "vinxi/server";

export async function handleServerAction(event) {
	invariant(event.method === "POST", "Invalid method");

	const serverReference = event.node.req.headers["server-action"];
	if (serverReference) {
		invariant(typeof serverReference === "string", "Invalid server action");
		// This is the client-side case
		const [filepath, name] = serverReference.split("#");
		const action = (
			await import.meta.env.MANIFEST[import.meta.env.ROUTER_NAME].chunks[
				filepath
			].import()
		)[name];
		const text = await new Promise((resolve) => {
			const requestBody = [];
			event.node.req.on("data", (chunks) => {
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
			event.node.res.setHeader("Router", "server-fns");

			return JSON.stringify(response ?? null);
		} catch (x) {
			console.error(x);
			return new Response(JSON.stringify({ error: x.message }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"x-server-function": "error",
				},
			});
		}
	} else {
		throw new Error("Invalid request");
	}
}

export default eventHandler(handleServerAction);

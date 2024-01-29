/// <reference types="vinxi/types/server" />
import { eventHandler, getHeader, readBody, setHeader } from "vinxi/http";
import invariant from "vinxi/lib/invariant";
import { getManifest } from "vinxi/manifest";

export async function handleServerAction(event) {
	invariant(event.method === "POST", "Invalid method");

	const serverReference = getHeader(event, "server-action");
	if (serverReference) {
		invariant(typeof serverReference === "string", "Invalid server action");
		// This is the client-side case
		const [filepath, name] = serverReference.split("#");
		const action = (
			await getManifest(import.meta.env.ROUTER_NAME).chunks[filepath].import()
		)[name];
		const json = await readBody(event);
		const result = action.apply(null, json);
		try {
			// Wait for any mutations
			const response = await result;
			setHeader(event, "Content-Type", "application/json");
			setHeader(event, "Router", "server-fns");

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

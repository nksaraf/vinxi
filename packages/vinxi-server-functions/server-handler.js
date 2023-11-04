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
		const action = (await import.meta.env.MANIFEST["server"].chunks[filepath].import())[name];
		// Validate that this is actually a function we intended to expose and
		// not the client trying to invoke arbitrary functions. In a real app,
		// you'd have a manifest verifying this before even importing it.
		// if (action.$$typeof !== Symbol.for("react.server.reference")) {
		// 	throw new Error("Invalid action");
		// }
		const result = action.apply(null, await toWebRequest(event).json());
		try {
			// Wait for any mutations
			const response = await result;
			// const stream = renderToPipeableStream(result);
			// // @ts-ignore
			// stream._read = () => {};
			// // @ts-ignore
			// stream.on = (event, listener) => {
			// 	events[event] = listener;
			// };
			event.node.res.setHeader("Content-Type", "application/json");
			event.node.res.setHeader("Router", "server");

			return JSON.stringify(response ?? null);
		} catch (x) {
			// We handle the error on the client
		}
		// Refresh the client and return the value
		// return {};
	} else {
		throw new Error("Invalid request");
	}
}

export default eventHandler(handleServerAction);

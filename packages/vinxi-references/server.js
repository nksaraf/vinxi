import invariant from "vinxi/lib/invariant";
import { eventHandler } from "vinxi/runtime/server";

async function loadModule(id) {
	if (import.meta.env.DEV) {
		console.log(import.meta.env.MANIFEST["server"].chunks[id].output.path);
		return await import(
			import.meta.env.MANIFEST["server"].chunks[id].output.path
		);
	}

	if (globalThis.$$chunks[id + ".js"]) {
		return globalThis.$$chunks[id + ".js"];
	}
	return await import(
		import.meta.env.MANIFEST["server"].chunks[id].output.path
	);
}

export default eventHandler(async function handleServerAction(event) {
	invariant(event.request.method === "POST", "Invalid method");

	const serverReference = event.node.req.headers["server-action"];
	if (serverReference) {
		// This is the client-side case
		const [filepath, name] = serverReference.split("#");
		const action = (await loadModule(filepath))[name];
		// Validate that this is actually a function we intended to expose and
		// not the client trying to invoke arbitrary functions. In a real app,
		// you'd have a manifest verifying this before even importing it.
		// if (action.$$typeof !== Symbol.for("react.server.reference")) {
		// 	throw new Error("Invalid action");
		// }
		const result = action.apply(null, await event.request.json());
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
			console.log(response);

			return JSON.stringify(response ?? null);
		} catch (x) {
			// We handle the error on the client
		}
		// Refresh the client and return the value
		// return {};
	} else {
		throw new Error("Invalid request");
	}
});

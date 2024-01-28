import { eventHandler, readRawBody, setHeader } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

export default eventHandler(async (event) => {
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
			const [filepath, name] = serverReference.split("#");
			const action = (await getManifest("server").chunks[filepath].import())[
				name
			];
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
			console.log(text);

			args = await decodeReply(text);
			console.log(args, action);
			// }
			const result = action.apply(null, args);
			try {
				// Wait for any mutations
				await result;
				const events = {};
				const stream = renderToPipeableStream(result);

				// @ts-ignore
				stream._read = () => {};
				// @ts-ignore
				stream.on = (event, listener) => {
					events[event] = listener;
				};

				setHeader(event, "Content-Type", "application/json");
				setHeader(event, "Router", "server");

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

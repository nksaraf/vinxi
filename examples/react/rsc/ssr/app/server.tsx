/// <reference types="vinxi/types/server" />
import * as ReactServerDOM from "@vinxi/react-server-dom/client";
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import { renderToPipeableStream } from "react-dom/server";
import { H3Event, eventHandler, handleHTTPEvent, setHeader } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

import { Readable, Writable } from "node:stream";

function createStream() {
	const readable = new Readable({
		objectMode: true,
	});
	readable._read = () => {};
	readable.headers = {};

	const writableStream = new Writable({
		write(chunk, encoding, callback) {
			readable.push(chunk);
			callback();
		},
	});

	writableStream.setHeader = () => {};

	writableStream.on("finish", () => {
		readable.push(null);
		readable.destroy();
	});

	return {
		readable: readable,
		writable: writableStream,
	};
}

export default eventHandler(async (event) => {
	globalThis.__vite__ = createModuleLoader(getManifest("ssr").dev.server);

	const responseStream = createStream();

	event.node.req.url = `/_rsc` + event.node.req.url;

	await handleHTTPEvent(new H3Event(event.node.req, responseStream.writable));

	const clientManifest = getManifest("client");

	const element = await ReactServerDOM.createFromNodeStream(
		responseStream.readable,
	);

	const stream = renderToPipeableStream(element, {
		bootstrapModules: [
			clientManifest?.inputs[clientManifest.handler].output.path,
		].filter(Boolean) as string[],
		bootstrapScriptContent: `
			window.base = "${import.meta.env.BASE_URL}";`,
	});

	setHeader(event, "Content-Type", "text/html");
	return stream;
});

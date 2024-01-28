/// <reference types="vinxi/types/server" />
import viteServer from "#vite-dev-server";
import * as ReactServerDOM from "@vinxi/react-server-dom/client";
import { createModuleLoader } from "@vinxi/react-server-dom/runtime";
import { renderToPipeableStream } from "react-dom/server";
import { H3Event, eventHandler, setHeader } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

import { Readable, Writable } from "node:stream";

export default eventHandler(async (event) => {
	globalThis.__vite__ = createModuleLoader(viteServer);

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

	event.node.req.url = `/_rsc` + event.node.req.url;

	$handle(new H3Event(event.node.req, writableStream));

	const clientManifest = getManifest("client");

	const element = await ReactServerDOM.createFromNodeStream(readable);

	const stream = renderToPipeableStream(element, {
		bootstrapModules: [
			clientManifest?.inputs[clientManifest.handler].output.path,
		].filter(Boolean) as string[],
		bootstrapScriptContent: `window.base = "${import.meta.env.BASE_URL}";`,
	});

	setHeader(event, "Content-Type", "text/html");
	return stream;
});

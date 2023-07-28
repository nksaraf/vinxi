import { renderToStream } from "solid-js/web";
import { eventHandler } from "vinxi/runtime/server";

import { createRoutes } from "../root/FileRoutes";

export function createHandler(fn) {
	return eventHandler(async (event) => {
		const events = {};

		const clientManifest = import.meta.env.MANIFEST["client"];
		const assets = await clientManifest.inputs[clientManifest.handler].assets();
		const manifestJson = await clientManifest.json();
		const tags = [];

		const routes = createRoutes();

		const context = {
			event,
			manifest: manifestJson,
			tags,
			routes,
			assets,
		};

		const stream = renderToStream(() => fn(context), {
			onCompleteAll(info) {
				events["end"]?.();
			},
		});

		// @ts-ignore
		stream.on = (event, listener) => {
			events[event] = listener;
		};

		return {
			pipe: stream.pipe.bind(stream),
			on: (event, listener) => {
				events[event] = listener;
			},
		};
	});
}

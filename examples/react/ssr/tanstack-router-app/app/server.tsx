import {
	StartServer,
	transformStreamWithRouter,
} from "@tanstack/react-start/server";
import { createMemoryHistory } from "@tanstack/router";
import { renderAsset } from "@vinxi/react";
import isbot from "isbot";
import ReactDOMServer, { PipeableStream } from "react-dom/server";
import { eventHandler } from "vinxi/runtime/server";

// index.js
// import "./fetch-polyfill";
import { createRouter } from "./router";

type ReactReadableStream = ReadableStream<Uint8Array> & {
	allReady?: Promise<void> | undefined;
};

export default eventHandler(async (event) => {
	const clientManifest = import.meta.env.MANIFEST["client"];
	const serverManifest = import.meta.env.MANIFEST["ssr"];
	const router = createRouter(clientManifest, serverManifest);

	const assets = await clientManifest.inputs[clientManifest.handler].assets();

	const memoryHistory = createMemoryHistory({
		initialEntries: [event.path],
	});

	// Update the history and context
	router.update({
		history: memoryHistory,
		context: {
			...router.context,
			assets: <>{assets.map((asset) => renderAsset(asset))}</>,
			// head: opts.head,
		},
	});

	// Wait for the router to load critical data
	// (streamed data will continue to load in the background)
	await router.load();

	// Track errors
	let didError = false;

	// Clever way to get the right callback. Thanks Remix!
	const callbackName = isbot(event.node.req.headers["user-agent"])
		? "onAllReady"
		: "onShellReady";

	// Render the app to a readable stream
	let stream!: PipeableStream;

	await new Promise<void>(async (resolve) => {
		stream = ReactDOMServer.renderToPipeableStream(
			<StartServer router={router} />,
			{
				bootstrapModules: [
					clientManifest.inputs[clientManifest.handler].output.path,
				],
				bootstrapScriptContent: `window.manifest = ${JSON.stringify(
					await clientManifest.json(),
				)}; window.base = ${JSON.stringify("/")};`,
				[callbackName]: () => {
					event.node.res.statusCode = didError ? 500 : 200;
					event.node.res.setHeader("Content-Type", "text/html");
					resolve();
				},
				onError: (err) => {
					didError = true;
					console.log(err);
				},
			},
		);
	});

	// Add our Router transform to the stream
	const transforms = [transformStreamWithRouter(router)];

	const transformedStream = transforms.reduce(
		(stream, transform) => stream.pipe(transform as any),
		stream,
	);

	return transformedStream;
});

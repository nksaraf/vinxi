import { StartServer } from "@tanstack/react-start/server";
import { createMemoryHistory } from "@tanstack/router";
import { renderAsset } from "@vinxi/react";
import isbot from "isbot";
import ReactDOMServer, { PipeableStream } from "react-dom/server.edge";
import { eventHandler, sendStream } from "vinxi/server";

import { Readable, Transform } from "node:stream";

import { createRouter } from "./router";

function encodeText(input: string) {
	return new TextEncoder().encode(input);
}

function decodeText(input: Uint8Array | undefined, textDecoder: TextDecoder) {
	return textDecoder.decode(input, { stream: true });
}

export function transformReadableStreamWithRouter(router) {
	return createHeadInsertionTransformStream(async () => {
		const injectorPromises = router.injectedHtml.map((d) =>
			typeof d === "function" ? d() : d,
		);
		const injectors = await Promise.all(injectorPromises);
		router.injectedHtml = [];
		return injectors.join("");
	});
}

const queueTask =
	process.env.TARGET === "vercel-edge" ? globalThis.setTimeout : setImmediate;
console.log(process.env.TARGET);

function createHeadInsertionTransformStream(
	insert: () => Promise<string>,
): TransformStream<Uint8Array, Uint8Array> {
	let inserted = false;
	let freezing = false;
	const textDecoder = new TextDecoder();

	return new TransformStream({
		async transform(chunk, controller) {
			// While react is flushing chunks, we don't apply insertions
			if (freezing) {
				controller.enqueue(chunk);
				return;
			}

			const insertion = await insert();
			if (inserted) {
				controller.enqueue(encodeText(insertion));
				controller.enqueue(chunk);
				freezing = true;
			} else {
				const content = decodeText(chunk, textDecoder);
				const index = content.indexOf("</head>");
				if (index !== -1) {
					const insertedHeadContent =
						content.slice(0, index) + insertion + content.slice(index);
					controller.enqueue(encodeText(insertedHeadContent));
					freezing = true;
					inserted = true;
				}
			}

			if (!inserted) {
				controller.enqueue(chunk);
			} else {
				queueTask(() => {
					freezing = false;
				});
			}
		},
		async flush(controller) {
			// Check before closing if there's anything remaining to insert.
			const insertion = await insert();
			if (insertion) {
				controller.enqueue(encodeText(insertion));
			}
		},
	});
}

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
			assets: (
				<>
					{assets.map((asset) => renderAsset(asset))}
					{import.meta.env.DEV ? (
						<script
							type="module"
							src={clientManifest.inputs[clientManifest.handler].output.path}
						/>
					) : null}
				</>
			),
			// head: opts.head,
		},
	});

	// Wait for the router to load critical data
	// (streamed data will continue to load in the background)
	await router.load();

	// Track errors
	let didError = false;

	// Render the app to a readable stream
	let stream!: ReadableStream;

	// await new Promise<void>(async (resolve) => {
	// 	console.log("rendering");
	stream = await ReactDOMServer.renderToReadableStream(
		<StartServer router={router} />,
		{
			bootstrapModules: import.meta.env.PROD
				? [clientManifest.inputs[clientManifest.handler].output.path]
				: undefined,
			bootstrapScriptContent: `window.manifest = ${JSON.stringify(
				await clientManifest.json(),
			)}; window.base = ${JSON.stringify("/")};`,
			// [callbackName]: () => {
			// 	console.log("doneeee");
			// 	resolve();
			// 	event.node.res.statusCode = didError ? 500 : 200;
			// 	event.node.res.setHeader("Content-Type", "text/html");
			// },
			onError: (err) => {
				didError = true;
				console.log(err);
			},
		},
	);
	// });

	if (isbot(event.node.req.headers["user-agent"])) {
		// @ts-ignore
		await stream.allReady;
	}

	// // Add our Router transform to the stream
	const transforms = [transformReadableStreamWithRouter(router)];

	for (const transform of transforms) {
		stream = stream.pipeThrough(transform);
	}

	event.node.res.statusCode = didError ? 500 : 200;
	event.node.res.setHeader("Content-Type", "text/html");

	return stream;
});

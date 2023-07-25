import { createFromFetch } from "@vinxi/react-server-dom-vite/client";
import * as React from "react";
import { startTransition, use, useState } from "react";

let updateRoot;
declare global {
	interface Window {
		init_server: ReadableStream<Uint8Array> | null;
		chunk(chunk: string): Promise<void>;
	}
}

export function getServerElementStream(url: string) {
	let stream;
	// Ideally we should have a readable stream inlined in the HTML
	if (window.init_server) {
		stream = { body: window.init_server };
		self.init_server = null;
	} else {
		stream = fetch(`/_rsc${url}`, {
			headers: {
				Accept: "text/x-component",
				"x-navigate": url,
			},
		});
	}

	return stream;
}

export function ServerComponent({ url }: { url: string }) {
	const [root, setRoot] = useState(use(useServerElement(url)));
	updateRoot = setRoot;
	return root;
}

export const serverElementCache = /*#__PURE__*/ new Map<
	string,
	React.Thenable<JSX.Element>
>();

async function callServer(id, args) {
	const response = fetch("/", {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"rsc-action": id,
		},
		// body: await encodeReply(args),
	});
	const { returnValue, root } = await createFromFetch(response, {
		callServer,
	});
	// Refresh the tree with the new RSC payload.
	startTransition(() => {
		updateRoot(root);
	});
	return returnValue;
}

export function useServerElement(url: string) {
	if (!serverElementCache.has(url)) {
		serverElementCache.set(
			url,
			createFromFetch(getServerElementStream(url), {
				callServer,
			}),
		);
	}
	return serverElementCache.get(url)!;
}

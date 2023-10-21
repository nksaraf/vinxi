import { createBirpc } from "birpc";
import { eventHandler, lazyEventHandler } from "vinxi/server";
import { WebSocketServer } from "ws";

import { fileURLToPath } from "node:url";

export default lazyEventHandler(() => {
	const wss = new WebSocketServer({ noServer: true });

	wss.on("connection", (ws, req) => {
		const rpc = createBirpc(
			new Proxy(
				{},
				{
					get(target, prop) {
						return async (...args) => {
							const { functions } = await import(
								/* @vite-ignore */
								fileURLToPath(new URL("./rpc.js", import.meta.url))
							);
							return functions[prop](...args);
						};
					},
				},
			),
			{
				post: (data) => ws.send(data),
				on: (data) => ws.on("message", data),
				serialize: (v) => JSON.stringify(v),
				deserialize: (v) => JSON.parse(v),
			},
		);
	});

	return eventHandler(async (event) => {
		if (event.headers.get("upgrade")) {
			wss.handleUpgrade(
				event.node.req,
				event.node.req.socket,
				Buffer.alloc(0),
				(socket) => {
					wss.emit("connection", socket, event.node.req);
				},
			);
			return;
		}
	});
});

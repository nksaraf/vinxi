import { H3Event } from "h3";

import { AsyncLocalStorage } from "node:async_hooks";
import { parentPort, workerData } from "node:worker_threads";

import { createDevServer } from "./dev-server.js";
import { createIncomingMessage, createServerResponse } from "./http-stream.js";
import invariant from "./invariant.js";
import { loadApp } from "./load-app.js";

/**
 *
 * @param {ReadableStream} stream
 * @param {(message: string) => void} onMessage
 */
// function streamToMessageChannel(stream, onMessage) {
// 	const forwardReader = stream.getReader();

// 	const textDecoder = new TextDecoder();

// 	function read() {
// 		forwardReader.read().then(({ done, value }) => {
// 			if (done) {
// 				onMessage("end");
// 			} else {
// 				onMessage(textDecoder.decode(value));
// 				read();
// 			}
// 		});
// 	}
// 	read();
// }

// @ts-ignore
global.AsyncLocalStorage = AsyncLocalStorage;

class AppWorker {
	port;
	server;
	constructor(port) {
		this.port = port;
	}

	bodies = {};

	initPromise;
	initialize() {
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = (async () => {
			const app = await loadApp();
			app.config.routers = app.config.routers.filter(
				(router) => router.name === workerData.name || router.name === "client",
			);
			this.server = await createDevServer(app, {
				port: 8989,
				ws: { port: 10002 },
			});
		})();

		return this.initPromise;
	}

	async handleMessage(message) {
		const { type, ...rest } = JSON.parse(message);
		switch (type) {
			case "body": {
				const { id, chunk } = rest;

				const body = this.bodies[id];
				if (body) {
					if (chunk === "end") {
						body.push(null);
						delete this.bodies[id];
					} else if (chunk) {
						body.push(chunk);
					}
				}

				return;
			}
			case "body-end": {
				return;
			}
			case "handle": {
				const {
					req: { url, method, headers },
				} = rest;

				try {
					await this.initialize();
					this.bodies ??= {};
					const req = createIncomingMessage(
						workerData.base + url,
						method,
						headers,
					);
					this.bodies[rest.id] = req;
					const res = createServerResponse(rest.id, {
						onChunk: (chunk, encoding) => {
							parentPort?.postMessage(
								JSON.stringify({
									chunk: new TextDecoder().decode(chunk),
									id: rest.id,
								}),
							);
						},
						onHeader: (header, value) => {
							parentPort?.postMessage(
								JSON.stringify({
									chunk: "$header",
									data: {
										key: header,
										value,
									},
									id: rest.id,
								}),
							);
						},
						onFinish: () => {
							parentPort?.postMessage(
								JSON.stringify({
									chunk: "end",
									id: rest.id,
								}),
							);
						},
					});

					const event = new H3Event(req, res);
					await this.server.h3App.handler(event);
				} catch (e) {
					console.error(e);
				}
			}
		}
	}

	listen() {
		this.port.addListener("message", this.handleMessage.bind(this));
		this.port.postMessage("ready");
	}
}

invariant(parentPort, "parentPort is not defined");

const appWorker = new AppWorker(parentPort);
appWorker.listen();

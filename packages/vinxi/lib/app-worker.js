import { loadConfig } from "c12";
import { H3Event } from "h3";

import { AsyncLocalStorage } from "node:async_hooks";
import { existsSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { join } from "node:path";
import { Readable, Transform, Writable } from "node:stream";
import { parentPort } from "node:worker_threads";

import { createDevServer } from "./dev-server.js";
import invariant from "./invariant.js";

/**
 *
 * @param {ReadableStream} stream
 * @param {(message: string) => void} onMessage
 */
function streamToMessageChannel(stream, onMessage) {
	const forwardReader = stream.getReader();

	const textDecoder = new TextDecoder();

	function read() {
		forwardReader.read().then(({ done, value }) => {
			if (done) {
				onMessage("end");
			} else {
				onMessage(textDecoder.decode(value));
				read();
			}
		});
	}
	read();
}

// @ts-ignore
global.AsyncLocalStorage = AsyncLocalStorage;

class AppWorker {
	port;
	server;
	constructor(port) {
		this.port = port;
	}

	bodies = {};

	async handleMessage(message) {
		const { type, ...rest } = JSON.parse(message);
		switch (type) {
			case "build": {
				app.config.routers = app.config.routers.filter(
					(router) => router.name === "react-rsc",
				);

				await app.build();
				console.log("built");

				parentPort?.postMessage(
					JSON.stringify({
						status: "built",
						id: rest.id,
					}),
				);

				return;
			}
			case "fetch": {
				const { url } = rest;
				const { default: app } = await import(join(process.cwd(), "./app.js"));

				try {
					if (!this.server) {
						app.config.routers = app.config.routers.filter(
							(router) => router.name === "rsc" || router.name === "client",
						);
						this.server = await createDevServer(app, {
							port: 8989,
							dev: true,
							ws: { port: 10002 },
						});
					}

					const req = createIncomingMessage();

					const res = createServerResponse(rest);

					const event = new H3Event(req, res);
					await this.server.app.handler(event);
					// tranformStream.on("end", () => {
					//   console.log("ending");
					//   parentPort?.postMessage(
					//     JSON.stringify({
					//       chunk: "end",
					//       id: rest.id,
					//     })
					//   );
					// });

					// streamToMessageChannel(stream, (msg) => {
					//   parentPort?.postMessage(
					//     JSON.stringify({ chunk: msg, id: rest.id })
					//   );
					// });
				} catch (e) {
					console.error(e);
				}
			}
			case "body": {
				console.log(rest);
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
				const { config: app } = await loadConfig({
					name: "app",
				});

				try {
					if (!this.server) {
						app.config.routers = app.config.routers.filter(
							(router) => router.name === "rsc" || router.name === "client",
						);
						this.server = await createDevServer(app, {
							port: 8989,
							dev: true,
							ws: { port: 10002 },
						});
					}

					this.bodies ??= {};
					const req = createIncomingMessage(url, method, headers);
					this.bodies[rest.id] = req;
					const res = createServerResponse(rest.id);

					const event = new H3Event(req, res);
					await this.server.h3App.handler(event);
					// tranformStream.on("end", () => {
					//   console.log("ending");
					//   parentPort?.postMessage(
					//     JSON.stringify({
					//       chunk: "end",
					//       id: rest.id,
					//     })
					//   );
					// });

					// streamToMessageChannel(stream, (msg) => {
					//   parentPort?.postMessage(
					//     JSON.stringify({ chunk: msg, id: rest.id })
					//   );
					// });
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

function createServerResponse(id) {
	const responseHeaders = {};
	const writableStream = new Writable({
		write(chunk, encoding, callback) {
			parentPort?.postMessage(
				JSON.stringify({
					chunk: new TextDecoder().decode(chunk),
					id,
				}),
			);
			callback();
		},
	});
	writableStream.socket = {};
	writableStream.getHeader = (header) => {
		return responseHeaders[header];
	};
	writableStream.setHeader = (header, value) => {
		responseHeaders[header] = value;
		parentPort?.postMessage(
			JSON.stringify({
				chunk: "$header",
				data: {
					key: header,
					value,
				},
				id,
			}),
		);
	};

	writableStream.on("finish", () => {
		parentPort?.postMessage(
			JSON.stringify({
				chunk: "end",
				id,
			}),
		);
	});
	return writableStream;
}

/**
 *
 * @returns {import('node:http').IncomingMessage}
 */
function createIncomingMessage(url, method, headers) {
	const readable = new Readable({ objectMode: true });
	readable._read = () => {};

	readable.url = "/_rsc" + url;
	readable.method = method;
	readable.headers = headers;
	return readable;
}

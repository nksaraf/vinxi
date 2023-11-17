import { createRequire } from "node:module";
import { Readable, Writable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import { Worker } from "node:worker_threads";

import invariant from "./invariant.js";
import { c, consola, log } from "./logger.js";

const require = createRequire(import.meta.url);

export class AppWorkerClient {
	/** @type {import('node:worker_threads').Worker | null} */
	worker = null;

	/** @type {Map<string, (event: any) => void>} */
	responses = new Map();

	url;

	/**
	 *
	 * @param {URL} url
	 */
	constructor(url) {
		this.url = url;
	}

	/**
	 *
	 * @param {any} workerData
	 * @param {() => void} onReload
	 */
	async init(workerData, onReload) {
		if (this.worker) {
			return;
		}
		log(`initializing ${c.magenta(workerData.name)} router worker`);
		this.worker = new Worker(this.url, {
			execArgv: ["--conditions", "react-server"],
			env: {
				COMPONENT_SERVER_WORKER: "true",
				// DEBUG: "vite:*",
				DEBUG: process.env.DEBUG,
				DEBUG_COLORS: process.env.DEBUG_COLORS,
				NODE_ENV: process.env.NODE_ENV,
				MINIFY: process.argv.includes("--minify") ? "true" : "false",
			},
			workerData,
		});

		await new Promise((resolve, reject) => {
			invariant(this.worker, "Worker is not initialize");
			this.worker.once("message", (event) => {
				if (event === "ready") {
					resolve(undefined);
				} else {
					reject(new Error("rsc worker failed to start"));
				}
			});
		});

		const encoder = new TextEncoder();
		this.worker.on("message", (msg) => {
			const { id, ...event } = JSON.parse(msg);
			if (event.type === "reload") {
				onReload();
				return;
			}

			const res = this.responses.get(id);
			invariant(res, `No response handler for id: ${id}`);
			res(event);
		});

		this.worker.once("exit", (code) => {
			console.log("Component server worker exited with code", code);
			process.exit(code);
		});
	}

	/**
	 *
	 * @param {import('h3').H3Event} event
	 * @returns
	 */
	handle(event) {
		const { req, res } = event.node;
		invariant(this.worker, "Worker is not initialize");
		const id = Math.random() + "";
		const worker = this.worker;

		worker.postMessage(
			JSON.stringify({
				req: {
					method: req.method,
					url: req.url,
					headers: req.headers,
				},
				type: "handle",
				id,
			}),
		);

		// WritableStream to transport request body to worker.
		const writableStream = new Writable({
			write(chunk, encoding, callback) {
				worker.postMessage(
					JSON.stringify({
						chunk: new TextDecoder().decode(chunk),
						type: "body",
						id: id,
					}),
				);
				callback();
			},
		});

		writableStream.on("finish", () => {
			worker.postMessage(
				JSON.stringify({
					chunk: "end",
					type: "body",
					id,
				}),
			);
		});

		// Pipe the request body to the writable stream.
		req.pipe(writableStream);

		let responses = this.responses;

		responses.set(id, ({ chunk, data }) => {
			if (chunk === "end") {
				res.end();
				responses.delete(id);
			} else if (chunk === "$header") {
				res.setHeader(data.key, data.value);
			} else if (chunk) {
				res.write(chunk);
			}
		});

		event._handled = true;

		return null;
	}

	close() {
		if (this.worker) {
			this.worker.unref();
		}
	}
}

import { Readable, Writable } from "node:stream";
import { parentPort } from "node:worker_threads";

/**
 *
 * @param {string} id
 * @returns {import('node:http').ServerResponse}
 */
export function createServerResponse(
	id,
	{
		onChunk = (chunk, encoding) => {
			parentPort?.postMessage(
				JSON.stringify({
					chunk: new TextDecoder().decode(chunk),
					id,
				}),
			);
		},
		onHeader = (header, value) => {
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
		},
		onFinish = () => {
			parentPort?.postMessage(
				JSON.stringify({
					chunk: "end",
					id,
				}),
			);
		},
	},
) {
	const responseHeaders = {};
	const writableStream = new Writable({
		write(chunk, encoding, callback) {
			onChunk(chunk);
			callback();
		},
	});
	writableStream.socket = {};
	writableStream.getHeader = (header) => {
		return responseHeaders[header];
	};
	writableStream.setHeader = (header, value) => {
		responseHeaders[header] = value;
		onHeader(header, value);
	};

	writableStream.on("finish", () => {
		onFinish();
	});
	return writableStream;
}
/**
 *
 * @returns {import('node:http').IncomingMessage}
 */
export function createIncomingMessage(url, method, headers) {
	const readable = new Readable({ objectMode: true });
	readable._read = () => {};

	readable.url = url;
	readable.method = method;
	readable.headers = headers;
	readable.connection = {};
	return readable;
}

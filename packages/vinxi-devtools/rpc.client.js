import { createBirpc } from "birpc";
import { createRPCClient } from "vite-dev-rpc";

const clientFunctions = {
	alert(message) {
		msg.textContent = message;
	},
};
/** @typedef {typeof clientFunctions} ClientFunctions */
/** @typedef {typeof import('./rpc.js')['functions']} ServerFunctions */
/** @type {import('birpc').BirpcReturn<ServerFunctions, ClientFunctions>} */
export let rpc;
// if (import.meta.hot) {
// 	/** @type {import('birpc').BirpcReturn<ServerFunctions, ClientFunctions>} */
// 	rpc = createRPCClient("demo", import.meta.hot, clientFunctions);
// } else {
const ws = new WebSocket(
	`ws://${window.location.hostname}:${window.location.port}/__devtools/rpc`,
);

await new Promise((resolve) => {
	ws.addEventListener("open", () => {
		resolve();
	});
});

rpc = createBirpc(clientFunctions, {
	post: (data) => ws.send(data),
	on: (data) => ws.addEventListener("message", (event) => data(event.data)),
	// these are required when using WebSocket
	serialize: (v) => JSON.stringify(v),
	deserialize: (v) => JSON.parse(v),
});
// }

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
if (import.meta.hot) {
	/** @type {import('birpc').BirpcReturn<ServerFunctions, ClientFunctions>} */
	rpc = createRPCClient("demo", import.meta.hot, clientFunctions);
}

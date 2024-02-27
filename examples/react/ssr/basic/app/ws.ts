import { defineWebSocket, eventHandler } from "vinxi/http";

export default eventHandler({
	handler: () => {},
	websocket: defineWebSocket({
		async open(event) {
			console.log("WebSocket opened");
		},
		async message(peer, event) {
			console.log("WebSocket message", event);
			peer.send("YOOO");
		},
		async close(event) {
			console.log("WebSocket closed 3");
		},
	}),
});

import { partyHandler } from "vinxi/runtime/party";

export default partyHandler({
	onMessage(party, message, connection) {
		// Broadcast message to all other members
		party.broadcast(new TextDecoder().decode(message), [connection.id]);
	},

	onConnect(party, connection) {
		party.broadcast(
			JSON.stringify({
				type: "members",
				conns: [...party.getConnections()].map((conn) => conn.id),
			}),
		);
	},

	onClose(party, connection) {
		party.broadcast(
			JSON.stringify({
				type: "members",
				conns: [...party.getConnections()].map((conn) => conn.id),
			}),
			[connection.id],
		);
	},
	onRequest(party, req) {
		return new Response("Not found", { status: 501 });
	},
});

// import { defineWebSocket, eventHandler } from "vinxi/http";
import { partyHandler } from "vinxi/party";

export default partyHandler({
	onConnect(party, conn) {
		console.log(party);
		conn.send("Hello from the server!");
		party.broadcast(
			"Hello from the server!" +
				[...party.getConnections()].map((c) => c.id).join(","),
		);
	},
});

import {
	eventHandler,
	isWebSocketEvent,
	isWebSocketUpgradeRequest,
	lazyEventHandler,
	toWebRequest,
	toWebSocketEvent,
	upgradeWebSocket,
} from "./server";

class InternalParty {
	connections = new Map();
	getConnections(tag) {
		return this.connections.values();
	}
	getConnection(id) {
		return this.connections.get(id);
	}
	id;
	constructor(id) {
		this.id = id;
	}
	onConnect(connection) {
		this.connections.set(connection.id, connection);
	}

	onClose(connection) {
		this.connections.delete(connection.id);
	}

	storage;
	name;
	internalID;
	env;
	context;

	broadcast(msg, without = []) {
		for (const conn of this.connections.values()) {
			if (without && without.includes(conn.id)) {
				continue;
			}
			conn.send(msg);
		}
	}

	parties;
}

function createConnection(webSocket) {
	// @ts-ignore
	webSocket.id ??= Math.random().toString(36).slice(2);
	return webSocket;
}

export function partyHandler(partyServer) {
	return lazyEventHandler(async () => {
		const party = new InternalParty("main");
		await partyServer.onStart?.(party);
		return eventHandler((e) => {
			if (isWebSocketEvent(e)) {
				const wsEvent = toWebSocketEvent(e);
				const conn = createConnection(wsEvent.connection);
				if (wsEvent.type === "connection") {
					party.onConnect(conn);
					partyServer.onConnect?.(party, conn);
				} else if (wsEvent.type === "message") {
					partyServer.onMessage?.(party, wsEvent.message, conn);
				} else if (wsEvent.type === "error") {
					partyServer.onError?.(party, conn, wsEvent.error);
				} else if (wsEvent.type === "close") {
					party.onClose(conn);
					partyServer.onClose?.(party, conn);
				}
			} else if (isWebSocketUpgradeRequest(e)) {
				return upgradeWebSocket(e);
			} else {
				return partyServer.onRequest?.(party, toWebRequest(e));
			}
		});
	});
}

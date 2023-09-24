import {
	Connection,
	ConnectionContext,
	Context,
	Party,
	Server,
	Stub,
} from "vinxi/runtime/party";
import {
	getHeader,
	isWebSocketEvent,
	isWebSocketUpgradeRequest,
	toWebRequest,
	toWebSocketEvent,
	upgradeWebSocket,
} from "vinxi/runtime/server";
import { eventHandler, lazyEventHandler } from "vinxi/runtime/server";

class InternalParty implements Party {
	connections = new Map();
	getConnections(tag?: string): Iterable<Connection> {
		return this.connections.values();
	}
	getConnection(id: string): Connection {
		return this.connections.get(id);
	}
	id: string;
	constructor(id: string) {
		this.id = id;
	}
	onConnect(connection: Connection): void | Promise<void> {
		this.connections.set(connection.id, connection);
	}

	onClose(connection: Connection): void | Promise<void> {
		this.connections.delete(connection.id);
	}

	storage: Storage;
	name: string;
	internalID: string;
	env: Record<string, unknown>;
	context: Context;

	broadcast(msg: string, without?: string[]) {
		for (const conn of this.connections.values()) {
			if (without && without.includes(conn.id)) {
				continue;
			}
			conn.send(msg);
		}
	}

	parties: Record<string, { get(id: string): Stub }>;
}

export class PartyServer implements Server {
	constructor(readonly party: Party) {}
	onConnect(connection, ctx) {}

	getConnectionTags(
		connection: Connection,
		context: ConnectionContext,
	): string[] | Promise<string[]> {
		return [];
	}

	onRequest(req: Request): Response | Promise<Response> {
		return new Response("Not found", { status: 501 });
	}

	onMessage(message, sender: Connection): void | Promise<void> {
		const text =
			typeof message === "string" ? message : new TextDecoder().decode(message);
		sender.send(
			JSON.stringify({
				type: "message",
				conns: [...this.party.getConnections()].map((conn) => conn.id),
			}),
		);
	}
}

function webSocketHandler(websocketServer) {
	return lazyEventHandler(async () => {
		const party = new InternalParty("1");
		const server = new websocketServer(party);
		await server.onStart?.();
		return eventHandler((e) => {
			if (isWebSocketEvent(e)) {
				const wsEvent = toWebSocketEvent(e);
				console.log("websocket event", wsEvent);
				if (wsEvent.type === "connection") {
					const id = Math.random().toString(36).slice(2);
					wsEvent.connection.id = id;
					party.onConnect(wsEvent.connection);
					server.onConnect?.(wsEvent.connection);
				} else if (wsEvent.type === "message") {
					server.onMessage?.(wsEvent.message, wsEvent.connection);
				} else if (wsEvent.type === "error") {
					server.onError?.(wsEvent.connection, wsEvent.error);
				} else if (wsEvent.type === "close") {
					party.onClose(wsEvent.connection);
					server.onClose?.(wsEvent.connection);
				}
			}

			if (isWebSocketUpgradeRequest(e)) {
				console.log("upgrade request");
				return upgradeWebSocket(e);
				// if (getHeader(e, "upgrade") === "websocket") {
				// 	return "upgrade";
				// }
				// return server.onRequest?.(toWebRequest(e));
			} else {
				return server.onRequest?.(toWebRequest(e));
			}
		});
	});
}

export default webSocketHandler(PartyServer);

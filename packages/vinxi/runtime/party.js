import { eventHandler } from "./server";

class InternalParty {
	connections = new Map();
	/**
	 * @param {any} tag
	 */
	getConnections(tag) {
		return this.connections.values();
	}
	/**
	 * @param {any} id
	 */
	getConnection(id) {
		return this.connections.get(id);
	}
	id;
	/**
	 * @param {string} id
	 */
	constructor(id) {
		this.id = id;
	}
	/**
	 * @param {{ id: any; }} connection
	 */
	onConnect(connection) {
		this.connections.set(connection.id, connection);
	}

	/**
	 * @param {{ id: any; }} connection
	 */
	onClose(connection) {
		this.connections.delete(connection.id);
	}

	/**
	 * @type {any}
	 */
	storage;
	/**
	 * @type {any}
	 */
	name;
	/**
	 * @type {any}
	 */
	internalID;
	/**
	 * @type {any}
	 */
	env;
	/**
	 * @type {any}
	 */
	context;

	/**
	 * @param {any} msg
	 * @param {string[]} without
	 */
	broadcast(msg, without = []) {
		for (const conn of this.connections.values()) {
			if (without && without.includes(conn.id)) {
				continue;
			}
			conn.send(msg);
		}
	}

	/**
	 * @type {any}
	 */
	parties;
}

/**
 * @param {WebSocket} webSocket
 * @returns {import("../types/party.d.ts").Connection}
 */
function createConnection(webSocket) {
	// @ts-ignore
	webSocket.id ??= Math.random().toString(36).slice(2);
	// @ts-ignore
	return webSocket;
}

globalThis.parties ??= {};

async function getParty(partyServer, id) {
	if (!globalThis.parties[id]) {
		globalThis.parties[id] = new InternalParty(id);
		await partyServer.onStart?.(globalThis.parties[id]);
	}

	return globalThis.parties[id];
}

/**
 * @param {import('../types/party.d.ts').PartyHandler} partyServer
 */
export function partyHandler(partyServer) {
	return eventHandler({
		handler: (e) => {},
		websocket: {
			async open(peer) {
				const party = await getParty(partyServer, peer.url);
				await party.onConnect(peer);
				return await partyServer.onConnect?.(party, peer);
			},
			async close(peer, details) {
				const party = await getParty(partyServer, peer.url);
				await party.onClose(peer);
				return await partyServer.onClose?.(party, peer);
			},
			async message(peer, message) {
				const party = await getParty(partyServer, peer.url);
				return await partyServer.onMessage?.(party, message, peer);
			},
			async error(peer, error) {
				const party = await getParty(partyServer, peer.url);
				return await partyServer.onError?.(party, peer, error);
			},
		},
	});
}

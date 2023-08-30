import { EventHandler, H3Event } from "h3";
import { NitroAppPlugin } from "nitropack";

export * from "h3";

export function createMiddleware(
	fn: ({
		forward,
	}: {
		forward: (event: H3Event) => Promise<any>;
	}) => EventHandler,
): NitroAppPlugin;

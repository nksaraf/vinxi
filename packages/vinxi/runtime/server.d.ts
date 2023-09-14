import { EventHandler, EventHandlerObject, H3Event } from "h3";
import { NitroAppPlugin } from "nitropack";

export * from "h3";

export function defineMiddleware(
	object: Omit<EventHandlerObject, "handler">,
): Omit<EventHandlerObject, "handler">;

export function setContext(event: H3Event, key: string, value: any): void;

export function getContext<T = any>(event: H3Event, key: string): T;

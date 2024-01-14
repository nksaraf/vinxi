import { EventHandlerRequest, _RequestMiddleware } from "h3";

export * from "h3";

export function getContext(event: import("h3").H3Event, key: string): any;
export function setContext(
	event: import("h3").H3Event,
	key: string,
	value: any,
): any;

export function defineMiddleware(options: {
	onRequest?:
		| import("h3")._RequestMiddleware
		| import("h3")._RequestMiddleware[];
	onBeforeResponse?:
		| import("h3")._ResponseMiddleware
		| import("h3")._ResponseMiddleware[];
}): {
	onRequest?:
		| import("h3")._RequestMiddleware
		| import("h3")._RequestMiddleware[]
		| undefined;
	onBeforeResponse?:
		| import("h3")._ResponseMiddleware
		| import("h3")._ResponseMiddleware[]
		| undefined;
};

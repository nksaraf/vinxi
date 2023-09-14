export * from "h3";

export function setContext(event, key, value) {
	event.context[key] = value;
}

export function getContext(event, key, value) {
	return event.context[key];
}

export function defineMiddleware(options) {
	return options;
}

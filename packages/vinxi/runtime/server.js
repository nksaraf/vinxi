import { createAppEventHandler } from "h3";

export * from "h3";

export function createMiddleware(getHandler) {
	return (app) => {
		const prevHandler = createAppEventHandler([...app.h3App.stack], {});
		const handler = getHandler({ forward: (event) => prevHandler(event) });

		app.h3App.stack.unshift({
			route: "/",
			match: undefined,
			handler: handler,
		});
	};
}

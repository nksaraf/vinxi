import { AsyncLocalStorage } from "async_hooks";
import { createConsola } from "consola";
import { colors } from "consola/utils";
import { isMainThread } from "worker_threads";

const logContext = new AsyncLocalStorage();
let prevLog = console.log.bind(console);
export const consola = createConsola({});

console.log = (...args) => {
	const req = logContext.getStore();
	if (!req) {
		prevLog(...args);
		return;
	}

	prevLog(
		colors.dim(
			[
				colors.blue(req.router.name),
				isMainThread ? undefined : "worker",
				req.requestId,
			]
				.filter(Boolean)
				.join(":"),
		),

		...args,
	);
};

export let requestIdCounter = 0;

export function withLogger(logger, fn) {
	return logContext.run(logger, fn);
}

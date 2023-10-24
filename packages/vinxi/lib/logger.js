import { AsyncLocalStorage } from "async_hooks";
import { createConsola } from "consola";
import { colors } from "consola/utils";
import { isMainThread } from "worker_threads";

const logContext = new AsyncLocalStorage();
export const consola = createConsola({});

export { colors as c };

export const log = (...args) => {
	console.log(
		colors.dim(
			[colors.blue("vinxi"), isMainThread ? undefined : "worker"]
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

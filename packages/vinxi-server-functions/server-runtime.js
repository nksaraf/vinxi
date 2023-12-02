export function createServerReference(fn, id, name) {
	return new Proxy(fn, {
		get(target, prop, receiver) {
			if (prop === "url") {
				return "/_server" + `id=${id}&name=${name}`;
			}

			return Reflect.get(target, prop, receiver);
		},
		apply(target, thisArg, args) {
			return fn.apply(thisArg, args);
		},
	});
}

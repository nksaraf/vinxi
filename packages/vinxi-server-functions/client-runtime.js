async function fetchServerAction(base, id, args) {
	const response = await fetch(base, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"server-action": id,
		},
		body: JSON.stringify(args),
	});

	return response.json();
}

export function createServerReference(fn, id, name) {
	return new Proxy(fn, {
		get(target, prop, receiver) {
			if (prop === "url") {
				return "/_server" + `id=${id}&name=${name}`;
			}

			return Reflect.get(target, prop, receiver);
		},
		apply(target, thisArg, args) {
			return fetchServerAction("/_server", `${id}#${name}`, args);
		},
	});
}

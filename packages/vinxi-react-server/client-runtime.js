import { createServerReference as cServerReference } from "@vinxi/react-server-dom/runtime";

import { fetchServerAction } from "./fetch-server-action";

export function createServerReference(fn, moduleId, name) {
	return cServerReference(
		async (...args) => {
			return await fetchServerAction("/_server/", moduleId + "#" + name, args);
		},
		moduleId,
		name,
	);
}

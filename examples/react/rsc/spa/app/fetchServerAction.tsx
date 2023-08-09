import {
	createFromFetch,
	encodeReply,
} from "@vinxi/react-server-dom-vite/client";

export async function fetchServerAction(
	base,
	id,
	args,
	callServer = (id, args) => {
		throw new Error("No server action handler");
	},
) {
	const response = fetch(base, {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"rsc-action": id,
		},
		body: await encodeReply(args),
	});

	return await createFromFetch(response, {
		callServer,
	});
}

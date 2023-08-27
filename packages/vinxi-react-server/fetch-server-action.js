import { createFromFetch, encodeReply } from "@vinxi/react-server-dom/client";

export async function fetchServerAction(
	base,
	id,
	args,
	/** @type {(id: string, args: any) => Promise<void>} */
	callServer = (id, args) => {
		throw new Error("No server action handler");
	},
) {
	const response = fetch(base, {
		method: "POST",
		headers: {
			Accept: "text/x-component",
			"server-action": id,
		},
		body: await encodeReply(args),
	});

	return await createFromFetch(response, {
		callServer,
	});
}

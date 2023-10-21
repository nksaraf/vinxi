import { eventHandler } from "vinxi/server";

export default eventHandler(async (event) => {
	const app = globalThis.app;

	console.log(app);
	if (event.path === "/tailwind") {
		const response = await fetch("https://cdn.tailwindcss.com");
		return new Response(response.body, {
			headers: {
				"content-type": "application/script",
			},
		});
	}
});

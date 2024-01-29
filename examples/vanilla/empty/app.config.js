import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			type: "spa",
			dir: "./",
			handler: "./index.html",
		},
	],
});

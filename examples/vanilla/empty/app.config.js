import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "spa",
			dir: "./",
			handler: "./index.html",
		},
	],
});

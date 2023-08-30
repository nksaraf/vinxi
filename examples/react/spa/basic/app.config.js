import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.ts",
			build: {
				target: "browser",
				plugins: () => [reactRefresh()],
			},
		},
	],
});

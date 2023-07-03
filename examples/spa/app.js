import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			build: {
				outDir: "./.build/client",
			},
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			build: {
				target: "browser",
				outDir: "./.build/api",
				plugins: () => [reactRefresh()],
			},
			base: "/",
		},
	],
});

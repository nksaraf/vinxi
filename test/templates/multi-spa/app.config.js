import { createApp } from "vinxi";
import react from "@vitejs/plugin-react";
import solid from "vite-plugin-solid";

const app = createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "react",
			mode: "spa",
			root: "./react",
			handler: "./index.html",
			target: "browser",
			plugins: () => [react()]
		},
		{
			name: "solid",
			mode: "spa",
			root: "./solid",
			handler: "./index.ts",
			base: "/solid",
			target: "browser",
			plugins: () => [solid()]
		}
	],
});

export default app;

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
			name: "public-react",
			mode: "static",
			dir: "./react/public",
			base: "/react"
		},
		{
			name: "public-solid",
			mode: "static",
			dir: "./solid/public",
			base: "/solid"
		},
		{
			name: "root",
			mode: "spa",
			handler: "./src/index.ts",
			target: "browser",
			plugins: () => [react()]
		},
		{
			name: "react",
			mode: "spa",
			root: "./react",
			handler: "./index.html",
			base: "/react",
			target: "browser",
			plugins: () => [react()]
		},
		{
			name: "solid",
			mode: "spa",
			root: "./solid",
			handler: "./src/index.ts",
			base: "/solid",
			target: "browser",
			plugins: () => [solid()]
		}
	],
});

export default app;

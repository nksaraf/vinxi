import react from "@vitejs/plugin-react";
import { createApp } from "vinxi";
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
			type: "static",
			dir: "./react/public",
			base: "/react",
		},
		{
			name: "public-solid",
			type: "static",
			dir: "./solid/public",
			base: "/solid",
		},
		{
			name: "root",
			type: "spa",
			handler: "./src/index.ts",
			target: "browser",
			plugins: () => [react()],
		},
		{
			name: "react",
			type: "spa",
			root: "./react",
			handler: "./index.html",
			base: "/react",
			target: "browser",
			plugins: () => [react()],
		},
		{
			name: "solid",
			type: "spa",
			root: "./solid",
			handler: "./src/index.ts",
			base: "/solid",
			target: "browser",
			plugins: () => [solid()],
		},
	],
});

export default app;

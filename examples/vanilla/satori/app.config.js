import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "server",
			type: "handler",
			handler: "./index.tsx",
		},
	],
});

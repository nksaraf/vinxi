import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "./server";
import "./style.css";

const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "/trpc",
			// You can pass any HTTP headers you wish here
		}),
	],
	transformer: superjson,
});

document.getElementById("app").innerHTML = await client.greeting.query();

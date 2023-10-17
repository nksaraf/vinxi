import appRouter from "#vinxi/trpc/router";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import superjson from "superjson";
import { fromNodeMiddleware } from "vinxi/server";

// // Export only the type of a router!
// // This prevents us from importing server code on the client.
// export type AppRouter = typeof appRouter;

const handler = createHTTPHandler({
	router: appRouter,

	createContext() {
		return {};
	},
});

export default fromNodeMiddleware((req, res) => {
	console.log(req.url);
	req.url = req.url.replace(import.meta.env.BASE_URL, "");
	return handler(req, res);
});

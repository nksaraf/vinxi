import appRouter from "#vinxi/trpc/router";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { fromNodeMiddleware } from "vinxi/http";

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

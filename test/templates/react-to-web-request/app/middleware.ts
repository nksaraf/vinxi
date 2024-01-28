import { defineMiddleware, toWebRequest } from "vinxi/http";

export default defineMiddleware({
	onRequest: (event) => {
		toWebRequest(event);
	},
});

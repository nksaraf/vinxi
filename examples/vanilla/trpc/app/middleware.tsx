import { defineMiddleware, getContext, setContext } from "vinxi/server";

export default defineMiddleware({
	onRequest: (event) => {
		setContext(event, "help", { foo: "bar" });
	},
	onBeforeResponse: (event) => {
		console.log(getContext(event, "help"));
	},
});

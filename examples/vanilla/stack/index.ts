import { eventHandler } from "vinxi/server";

export default eventHandler((event) => {
	console.log(event.path);
	return "Hello world";
});

import { eventHandler } from "vinxi/http";

export default eventHandler((event) => {
	console.log(event.path);
	return "Hello world";
});

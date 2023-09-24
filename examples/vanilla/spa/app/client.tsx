/// <reference types="vinxi/client" />
import { sayHello } from "./actions";
import "./style.css";

console.log(await sayHello());
console.log("Hello world!");

const ws = new WebSocket(`ws://${window.location.host}/party`);

await new Promise((resolve) => {
	ws.addEventListener("open", resolve);
});
ws.send("Hello world!");

console.log(await fetch("/party").then((res) => res.text()));

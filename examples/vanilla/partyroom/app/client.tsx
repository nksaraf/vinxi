import { sayHello } from "./actions";
import "./style.css";

console.log(await sayHello());
console.log("Hello world!");

const ws = new WebSocket(`ws://${window.location.host}/party`);

await new Promise((resolve) => {
	ws.addEventListener("open", resolve);
});

ws.addEventListener("message", (event) => {
	document.getElementById("app").innerHTML += `<p>${event.data}</p>`;
});

document.getElementById("form").onsubmit = (event) => {
	event.preventDefault();
	const input = document.getElementById("input") as HTMLInputElement;
	ws.send(input.value);
	input.value = "";
};

ws.send("Hello world!");

console.log(await fetch("/party").then((res) => res.text()));

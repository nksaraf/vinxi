/// <reference types="vinxi/types/client" />
import ReactDOM from "react-dom/client";

async function greetServer(name: string) {
	"use server";
	console.log(`Hi, server. My name is ${name}.`);
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<div>
		<button onClick={() => greetServer("client")} data-test-id="button">Greet Server</button>
	</div>,
);
import React, { useEffect } from "react";

async function greetServer(name: string) {
	"use server";
	console.log(`Hi, server. My name is ${name}.`);
}

export function App() {
	useEffect(() => {
		document.documentElement.dataset.ready = "";
		return () => {
			document.documentElement.dataset.ready = null;
		}
	}, []);

	return (
		<div>
			<button onClick={() => greetServer("client")} data-test-id="button">
				Greet Server
			</button>
		</div>
	);
}

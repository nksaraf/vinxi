import React, { useEffect } from "react";

async function getData() {
	"use server";
	console.log(`I have not been blocked.`);
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
			<button onClick={() => getData()} data-test-id="button">
				Get Data
			</button>
		</div>
	);
}

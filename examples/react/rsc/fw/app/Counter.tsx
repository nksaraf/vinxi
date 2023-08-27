"use client";

import { fetchServerAction } from "@vinxi/react-server/client";
import { useState } from "react";

import { sayHello } from "./actions";

document.addEventListener("click", async (e) => {
	console.log(sayHello, "hello");

	const result = await fetchServerAction("/_server", sayHello["$$id"], []);
	console.log(result);
	// sayHello();
});
export function Counter({ onChange }) {
	const [count, setCount] = useState(0);
	return (
		<button
			onClick={() => {
				setCount((c) => c + 1);
				onChange();
			}}
		>
			Count: {count}
		</button>
	);
}

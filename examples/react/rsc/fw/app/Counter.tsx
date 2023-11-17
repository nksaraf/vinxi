"use client";

import { useState } from "react";

import { getStore } from "./actions";

console.log(await getStore());

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

"use client";

import { useEffect, useState } from "react";

export function Counter({ onChange }) {
	useEffect(() => {
		document.documentElement.dataset.ready = "";
		return () => {
			document.documentElement.dataset.ready = null;
		}
	}, []);
	const [count, setCount] = useState(0);
	return (
		<button
			data-test-id="counter"
			onClick={() => {
				setCount((c) => c + 1);
				onChange();
			}}
		>
			Count: {count}
		</button>
	);
}

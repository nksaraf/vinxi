import React from "react";

export function Counter() {
	const [count, setCount] = React.useState(0);
	const onClick = () => setCount((c) => c + 1);
	return (
		<button data-test-id="counter" onClick={onClick}>
			{count}
		</button>
	);
}

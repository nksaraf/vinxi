import { useState } from "react";

export function Counter() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<button data-test-id="button" onClick={() => setCount(count + 1)}>
				Click me
			</button>
			<span data-test-id="count">{count}</span>
		</div>
	);
}

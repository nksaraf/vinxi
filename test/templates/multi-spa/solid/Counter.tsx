import { createSignal } from "solid-js";

export function Counter() {
	const [count, setCount] = createSignal(0);

	return (
		<div>
			<button data-test-id="button" onClick={() => setCount(value => value + 1)}>
				Click me
			</button>
			<span data-test-id="count">{count()}</span>
		</div>
	);
}

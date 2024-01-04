import { createSignal } from "solid-js";

export function Counter() {
	const [count, setCount] = createSignal(0);

	return (
		<div>
			<button data-test-id="button-solid" onClick={() => setCount(value => value + 1)}>
				Click me
			</button>
			<span data-test-id="count-solid">{count()}</span>
		</div>
	);
}

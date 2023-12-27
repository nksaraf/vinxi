import { createSignal } from "solid-js";

import styles from "./Counter.module.css";

export function Counter() {
	const [count, setCount] = createSignal(0);
	return (
		<>
			<button
				class={styles.button}
				onClick={() => setCount((count) => count + 1)}
			>
				Click me!!: {count()}!
			</button>
		</>
	);
}

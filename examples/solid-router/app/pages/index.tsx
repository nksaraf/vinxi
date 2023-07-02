import { A } from "@solidjs/router";
import { createSignal } from "solid-js";

import "./hello.css";

function Counter() {
	const [count, setCount] = createSignal(0);
	return (
		<div>
			<p>Count: {count()}</p>
			<button onClick={() => setCount((count) => count + 1)}>Increment</button>
		</div>
	);
}

export default function Hello() {
	return (
		<>
			<div>Hellsas\\dasd4</div>
			<A href="/hello">Hello</A>
			<Counter />
			{/* <iframe
				src="/_spa/hello"
				style={{
					width: 400,
					height: 300,
				}}
			/>
			<iframe
				src="/hello"
				style={{
					width: 400,
					height: 300,
				}} */}
			{/* /> */}
		</>
	);
}

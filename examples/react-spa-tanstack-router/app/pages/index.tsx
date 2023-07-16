import { Link } from "@tanstack/router";
import React from "react";

import "./hello.css";

function Counter() {
	const [count, setCount] = React.useState(0);
	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}

export default function Hello({ assets }) {
	return (
		<>
			<div>Hellsas\\dasd4</div>
			<Link to="/hello">Hello</Link>
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

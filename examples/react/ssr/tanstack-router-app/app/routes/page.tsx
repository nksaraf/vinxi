import { Link, useRouter } from "@tanstack/router";
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
			<Test wait={1000 / 2} />
			<Test wait={2000 / 2} />
			<Test wait={3000 / 2} />
			<Test wait={4000 / 2} />
			<Test wait={5000 / 2} />
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

function Test({ wait }: { wait: number }) {
	return (
		<React.Suspense fallback={<div>...</div>}>
			<TestInner wait={wait} />
		</React.Suspense>
	);
}

function TestInner({ wait }: { wait: number }) {
	const router = useRouter();

	const instance = router.context.loaderClient.loaders.test.useLoader({
		variables: wait,
	});

	return <div>Test: {instance.state.data.test}</div>;
}

import { Link, createFileRoute, createServerFn } from "@tanstack/react-router";
import React, { useEffect, useState, useTransition } from "react";

import "./hello.css";

const fn = createServerFn("GET", async (wait: number) => {
	"use server";
	await new Promise((r) => setTimeout(r, wait));
	return {
		test: new Date().toLocaleString(),
	};
});
export const Route = createFileRoute("/")({
	component: Hello,
});

function Counter() {
	const [count, setCount] = React.useState(0);
	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}

export default function Hello() {
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
	const [test, setTest] = useState("");
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		startTransition(() => {
			fn(wait).then(({ test }) => setTest(test));
		});
	}, []);

	return isLoading ? null : <div>Test: {test}</div>;
}

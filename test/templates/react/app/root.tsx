import React from "react";
import { useEffect } from "react";
import { Counter } from "./Counter";

export default function App({ assets }) {
	useEffect(() => {
		document.documentElement.dataset.ready = "";
		return () => {
			document.documentElement.dataset.ready = null;
		}
	}, []);

	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{assets}
			</head>
			<body>
				<section>
					<h1 data-test-id="content">Hello from Vinxi</h1>
					<Counter />
				</section>
			</body>
		</html>
	);
}

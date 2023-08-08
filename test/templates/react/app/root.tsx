import React from "react";

import { Counter } from "./Counter";

export default function App({ assets }) {
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

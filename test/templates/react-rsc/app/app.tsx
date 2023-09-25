import React from "react";

import { Counter } from "./Counter";
import { getStore, sayHello } from "./actions";
import "./style.css";

export default function App({ assets }) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{assets}
			</head>
			<body>
				<section>
					<h1 data-test-id="title">Hello from Vinxi</h1>
					<span data-test-id="server-count">{getStore()}</span>
					<Counter onChange={sayHello} />
				</section>
			</body>
		</html>
	);
}

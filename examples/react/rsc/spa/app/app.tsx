import React from "react";

import { Counter } from "./Counter";
import { getStore, sayHello } from "./actions";
import "./style.css";

console.log(sayHello);

export default function App({ assets }) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{assets}
			</head>
			<body>
				<section>
					<h1>Hello AgentConf with ya asdo!!!</h1>
					<div>Hello World</div>

					{getStore()}
					<Counter onChange={sayHello} />
				</section>
			</body>
		</html>
	);
}

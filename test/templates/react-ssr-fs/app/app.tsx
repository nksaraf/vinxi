import React from "react";

import { Counter } from "./Counter";
import "./style.css";

export default function App({ assets, children }) {
	const [count, setCount] = React.useState(0);
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{assets}
			</head>
			<body>
				<section>App</section>
				<Counter />
				{children}
			</body>
		</html>
	);
}

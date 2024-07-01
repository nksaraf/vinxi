import React, { useEffect } from "react";

import { Counter } from "./Counter";
import "./style.css";

export default function App({ assets, children }) {
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
				<section>App</section>
				<Counter />
				{children}
			</body>
		</html>
	);
}

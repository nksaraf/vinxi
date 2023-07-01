import { NoHydration } from "solid-js/web";

import { Counter } from "./Counter";
import "./style.css";

export default function App({ assets, scripts }) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{assets}
			</head>
			<body>
				<section>
					<h1>Hello AgentConf with ya asdo!!!</h1>
					<Counter />
				</section>
				{scripts}
			</body>
		</html>
	);
}

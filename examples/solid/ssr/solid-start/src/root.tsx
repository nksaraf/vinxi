// @refresh reload
import { A } from "@solidjs/router";

import { Counter } from "./Counter";
import "./style.css";

export default function App(props) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{props.assets}
			</head>
			<body>
				<section>
					<h1>Hello AgentConf with ya asdo!!!</h1>
					<A href="/hello">Hello</A>
					<A href="/abc">ABC</A>
					<A href="/def">DEF</A>
					<A href="/">Home</A>
					<A href="/posts">Posts</A>
					<Counter />
				</section>
				{props.children}
				{props.scripts}
			</body>
		</html>
	);
}

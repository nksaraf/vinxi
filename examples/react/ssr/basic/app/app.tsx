import React from "react";

import "./style.css";

function useWebSocket() {
	const [message, setMessage] = React.useState("");
	const [ws, setWs] = React.useState<WebSocket | null>(null);

	React.useEffect(() => {
		const ws = new WebSocket("ws://localhost:3000/_ws");
		ws.onopen = () => {
			console.log("WebSocket opened");
		};
		ws.onmessage = (event) => {
			console.log("WebSocket message", event);
			setMessage(event.data);
		};
		setWs(ws);
		return () => {
			ws.close();
		};
	}, []);

	return { message, ws };
}

export default function App({ assets }) {
	const [count, setCount] = React.useState(0);
	const { message, ws } = useWebSocket();
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				{assets}
			</head>
			<body>
				<section>
					<h1>Hello AgentConf with ya asdo!!!</h1>
					<button
						onClick={() => {
							setCount(count + 1);
							ws.send("Hello from the client!");
						}}
					>
						Click me: {count}!
					</button>
					<div>Message from server: {message}</div>
				</section>
			</body>
		</html>
	);
}

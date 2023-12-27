import { Counter } from "./Counter";
import Logo from "./logo.png";
import "./style.css";

export default function App({ assets, scripts }) {
	return (
		<html lang="en">
			<head>
				<link
					rel="icon"
					href={`${import.meta.env.SERVER_BASE_URL}/favicon.ico`}
				/>
				{assets}
			</head>
			<body>
				<section>
					<h1>Hello AgentConf with ya asdo!!!</h1>
					<img src={Logo} />
					<Counter />
				</section>
				{scripts}
			</body>
		</html>
	);
}

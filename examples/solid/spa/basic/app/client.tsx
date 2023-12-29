/// <reference types="vinxi/types/client" />
import { render } from "solid-js/web";

import Logo from "./logo.png";
import "./style.css";

render(
	() => (
		<div>
			Hello World
			<img src={Logo} />
		</div>
	),
	document.getElementById("root")!,
);

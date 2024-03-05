import { Link } from "@tanstack/react-router";
import React from "react";

import "./white.css";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/hello/')({
	component: Hello
})

export default function Hello() {
	return (
		<div>
			Hello world <Link to="/">Home 123</Link>
		</div>
	);
}

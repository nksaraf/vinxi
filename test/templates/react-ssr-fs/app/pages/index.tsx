import React from "react";
import { Link } from "wouter";

import "./index.css";

export default function Hello({ assets }) {
	return (
		<>
			<h1 data-test-id="title">Vinxi Home</h1>
			<Link href="/hello">Hello</Link>
		</>
	);
}

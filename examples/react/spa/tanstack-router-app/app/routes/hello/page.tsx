import { Link } from "@tanstack/react-router";
import React from "react";

import "./white.css";

export default function Hello() {
	return (
		<div>
			Hello world <Link to="/">Home 123</Link>
		</div>
	);
}

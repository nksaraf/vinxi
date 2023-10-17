import { Link } from "@tanstack/router";
import React from "react";

/**
 * Yooo whats this page about
 *
 * asdasd  asdasd  asdad
 *
 * @prerender {true}
 * @returns {string}
 */
export default function Hello() {
	return (
		<div>
			Hello world <Link to="/">Home 123</Link>
		</div>
	);
}
